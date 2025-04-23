# old db that uses sqlalchemy. We now try migrate to mongodb
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
