from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import base  # ensures all models are registered
from db.session import engine
from api.routers import auth, users

# create tables
base.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)

#run: uvicorn main:app --reload
