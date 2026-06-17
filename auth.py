from jose import jwt
from datetime import datetime,timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def create_access_token(data:dict):

    expire = datetime.utcnow()+timedelta(hours=1)

    data.update({"exp":expire})

    return jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )