from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIWebSocketRoute

from api.routers import auth, users, chat
from websocket.wsocket import chat_websocket_endpoint
from core.config import settings
from db.mongo import db_connection_status, startup_db_client, shutdown_db_client

import socketio
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

# Register the startup event handler
@app.on_event('startup')
async def startup_event():
    await startup_db_client(app)
    await db_connection_status()


# Register the shutdown event handler
@app.on_event('shutdown')
async def shutdown_event():
    await shutdown_db_client(app)
    

#   SOCKET.IO
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.ALLOWED_ORIGINS,
)
socket_manager = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    socketio_path="/socket.io",
)
app.mount("/socket.io", socket_manager)

#   CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#   API ROUTERS
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chat.router)



#   WebSocket
websocket = APIWebSocketRoute("/ws/chat/{chat_tpye}/{chat_id}/token={token}", chat_websocket_endpoint)
app.router.routes.append(websocket)