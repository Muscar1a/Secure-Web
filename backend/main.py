from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.routers import auth, users, message
from core.config import settings
from db.mongo import db_connection_status, get_db, startup_db_client, shutdown_db_client

import socketio
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

# Register the startup event handler
@app.on_event('startup')
async def startup_event():
    await startup_db_client(app)
    db: AsyncIOMotorDatabase = app.mongodb
    await db["password_reset_tokens"].create_index(
        "expires_at",
        expireAfterSeconds=0
    )
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

