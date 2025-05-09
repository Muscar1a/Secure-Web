from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIWebSocketRoute
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.extension import _rate_limit_exceeded_handler

from api.routers import auth, users, chat
from websocket.wsocket import chat_websocket_endpoint
from core.config import settings
from db.mongo import db_connection_status, startup_db_client, shutdown_db_client
from motor.motor_asyncio import AsyncIOMotorDatabase

import socketio
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

# add rate limit
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

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
    


#   CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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