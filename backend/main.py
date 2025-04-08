import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json

app = FastAPI(title="FastAPI with React", version="1.0")

origins = [
    "http://localhost:8000",  # React app URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_users = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(user_id: str, websocket: WebSocket):
    await websocket.accept()
    
    connected_users[user_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            for user, user_ws in connected_users.items():
                if user != user_id:
                    await user_ws.send_text(data)
    except Exception as e:
        del connected_users[user_id]
        await websocket.close()
                    
@app.get("/")
def read_root():
    return {"Hello": "World"}