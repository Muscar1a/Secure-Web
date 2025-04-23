# from core.config import
from sqlalchemy import Boolean, DateTime, MetaData, func
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker