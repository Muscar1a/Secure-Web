from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, users, message
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from fastapi_socketio import SocketManager


app = FastAPI()
mongodb = None

socket_manager = SocketManager(app=app, async_mode="asgi")

online_users = {}



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(message.router, prefix="/messages", tags=["Messages"])


@app.on_event("startup")
async def startup_db_client():
    global mongodb
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    mongodb = client[settings.MONGODB_DB_NAME]
    print("Connected to MongoDB")


@socket_manager.on("connect")
async def handle_connect(sid, environ):
    print(f"Client connected: {sid}")
    

@socket_manager.on("add-user")
async def handle_add_user(sid, user_id):
    user_id_list = online_users.get(user_id, [])
    user_id_list.append(sid)
    online_users[user_id] = user_id_list
    

@socket_manager.on("send-message")
async def send_msg(sid, data):
    send_user_sockets = online_users.get(data["sender"], None)
    if send_user_sockets:
        for user_socket in send_user_sockets:
            await socket_manager.emit("msg-recieve", data, to=user_socket)
            
            

@socket_manager.on("tag-msg")
async def react_msg(sid, data):
    await message.tag_message(message_id=data["message_id"], tag=data["tag"])
    send_user_sockets = online_users.get(data["sender"], None)
    if send_user_sockets:
        for user_socket in send_user_sockets:
            await socket_manager.emit("tag-recieve", data, to=user_socket)



@app.get("/")
async def read_root():
    """
    Root endpoint for the ChatApp API.

    Returns:
        str: Welcome message.
    """
    return "Welcome to the ChatApp API!"