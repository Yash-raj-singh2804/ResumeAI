from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
import secrets

from .auth_api import get_api_key

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

class WebhookCreate(BaseModel):
    target_url: HttpUrl
    event_types: List[str] = ["*"]

class WebhookResponse(BaseModel):
    id: int
    target_url: HttpUrl
    event_types: List[str]
    secret_key: str
    is_active: bool

@router.post("/", response_model=WebhookResponse)
def create_subscription(
    webhook: WebhookCreate, 
    api_key: models.APIKey = Depends(get_api_key),
    db: Session = Depends(get_db)
):

    secret = secrets.token_hex(24)
    
    new_sub = models.WebhookSubscription(
        user_id=api_key.user_id,
        target_url=str(webhook.target_url),
        event_types=webhook.event_types,
        secret_key=secret
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    
    return new_sub

@router.get("/", response_model=List[WebhookResponse])
def list_subscriptions(
    api_key: models.APIKey = Depends(get_api_key),
    db: Session = Depends(get_db)
):
    subs = db.query(models.WebhookSubscription).filter(
        models.WebhookSubscription.user_id == api_key.user_id
    ).all()
    return subs

@router.delete("/{webhook_id}")
def delete_subscription(
    webhook_id: int,
    api_key: models.APIKey = Depends(get_api_key),
    db: Session = Depends(get_db)
):
    sub = db.query(models.WebhookSubscription).filter(
        models.WebhookSubscription.id == webhook_id,
        models.WebhookSubscription.user_id == api_key.user_id
    ).first()
    
    if not sub:
        raise HTTPException(status_code=404, detail="Webhook not found")
        
    db.delete(sub)
    db.commit()
    return {"detail": "Webhook deleted"}
