from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, users, message
from core.config import settings
from db.mongo import get_db, startup_db_client, shutdown_db_client

import socketio
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

#   DATABASE LIFECYCLE  
app.add_event_handler("startup", startup_db_client)
app.add_event_handler("shutdown", shutdown_db_client)

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
app.include_router(auth.router,   prefix="/auth",    tags=["auth"])
app.include_router(users.router,  prefix="/users",   tags=["users"])
app.include_router(message.router,prefix="/messages",tags=["messages"])

#   HEALTHCHECK
@app.get("/health/db")
async def health_check_db(db=Depends(get_db)):
    """
    Ping MongoDB via the dependency and report status.
    """
    try:
        # note: db.client is the same as _client under the hood
        await db.client.admin.command("ping")
        return {"status": "ok"}
    except Exception as e:
        logger.error("DB healthcheck failed", exc_info=e)
        return {"status": "error", "detail": str(e)}