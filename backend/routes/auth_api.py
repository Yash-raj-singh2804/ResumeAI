from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
import models
import secrets
import hashlib
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api", tags=["API Keys"])

class APIKeyCreate(BaseModel):
    name: str

class APIKeyResponse(BaseModel):
    name: str
    api_key: str
    key_prefix: str

def get_api_key(x_api_key: str = Header(None), db: Session = Depends(get_db)):
    if not x_api_key:
        raise HTTPException(status_code=403, detail="API Key header missing")
    
    key_hash = hashlib.sha256(x_api_key.encode()).hexdigest()
    
    api_key_record = db.query(models.APIKey).filter(
        models.APIKey.key_hash == key_hash,
        models.APIKey.is_active == True
    ).first()
    
    if not api_key_record:
        raise HTTPException(status_code=403, detail="Invalid API Key")
        
    return api_key_record

from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Duration, Rate, Limiter

_rate = Rate(5, Duration.MINUTE)
_limiter = Limiter(_rate)

@router.post("/keys", response_model=APIKeyResponse, dependencies=[Depends(RateLimiter(_limiter))])
def create_api_key(request: APIKeyCreate, db: Session = Depends(get_db)):
    default_user = db.query(models.User).first()
    if not default_user:
        default_user = models.User(
            username="admin",
            email="admin@resumeai.com",
            hashed_password="default",
            role="Admin"
        )
        db.add(default_user)
        db.flush()
    user_id = default_user.id
    
    raw_key = f"sk_live_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[:10]
    
    new_key = models.APIKey(
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=request.name,
        user_id=user_id 
    )
    db.add(new_key)
    db.commit()
    db.refresh(new_key)
    
    return {
        "name": new_key.name,
        "api_key": raw_key,
        "key_prefix": new_key.key_prefix
    }
