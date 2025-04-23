from datetime import timedelta

# JWT
SECRET_KEY = "IT‑E15"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# MongoDB
#SQLALCHEMY_DATABASE_URL = "sqlite:///./chatapp.db"
MONGODB_URL = "mongodb+srv://a69966699:76KCEQTNPvHvpqXH@userinfo.noqb9gh.mongodb.net/?retryWrites=true&w=majority&appName=UserInfo"
MONGODB_DB_NAME = "chatapp" 
# MONGODB_META = "metadata"