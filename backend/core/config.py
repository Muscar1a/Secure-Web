import logging
import os
from random import randint
from pydantic_settings import BaseSettings, SettingsConfigDict

class GlobalSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    ENVIRONMENT: str = "development"
    # app settings
    ALLOWED_ORIGINS: str 

    # Logging
    LOG_LEVEL: int = logging.DEBUG

    # Sentry
    SENTRY_DSN: str = ""

    # MongoDB
    MONGODB_URL: str = "mongodb+srv://a69966699:76KCEQTNPvHvpqXH@userinfo.noqb9gh.mongodb.net/?retryWrites=true&w=majority&appName=UserInfo"
    MONGODB_DB_NAME: str = "chatapp"
    
    # Authentication
    SECRET_KEY: str
    ALGORITHM: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # SMTP
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    EMAIL_FROM: str

    # Password-reset URL
    FRONTEND_URL: str 
#SQLALCHEMY_DATABASE_URL = "sqlite:///./chatapp.db"

def get_settings():
    env = os.environ.get("ENVIRONMENT", "development")
    return GlobalSettings()

settings = get_settings()