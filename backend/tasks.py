import requests
import json
import logging
from sqlalchemy.orm import Session
from celery_app import celery_app
from database import SessionLocal
import models
from webhook_utils import generate_hmac_signature, format_payload
import time

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def dispatch_webhook(self, event_type: str, data: dict, user_id: int = None):
    """
    Find subscriptions for this event and dispatch webhooks.
    """
    db: Session = SessionLocal()
    try:

        query = db.query(models.WebhookSubscription).filter(
            models.WebhookSubscription.is_active == True
        )
        
        if user_id:
            query = query.filter(models.WebhookSubscription.user_id == user_id)
        
        subscriptions = query.all()
        
        logger.info(f"Dispatching event {event_type} to {len(subscriptions)} subscribers")
        

        payload_dict = format_payload(event_type, data)
        payload_json = json.dumps(payload_dict)
        
        for sub in subscriptions:

            
            sub_events = sub.event_types or []
            if "*" not in sub_events and event_type not in sub_events:
                continue
            

            signature = generate_hmac_signature(sub.secret_key, payload_json)
            headers = {
                "Content-Type": "application/json",
                "X-Hub-Signature": signature,
                "User-Agent": "AI-Resume-Parser-Webhook/1.0"
            }
            
            try:
                send_webhook_request.delay(sub.id, sub.target_url, headers, payload_json, payload_dict['id'], event_type)
            except Exception as e:
                logger.error(f"Failed to queue webhook for sub {sub.id}: {e}")

    finally:
        db.close()

@celery_app.task(bind=True, max_retries=5, backoff_factor=2)
def send_webhook_request(self, sub_id, url, headers, payload_body, event_id, event_type):
    db: Session = SessionLocal()
    delivery_status = "FAILED"
    resp_status = None
    resp_body = None
    
    try:
        response = requests.post(url, headers=headers, data=payload_body, timeout=10)
        resp_status = response.status_code
        resp_body = response.text[:1000]
        
        if 200 <= resp_status < 300:
            delivery_status = "SUCCESS"
        else:
            if resp_status >= 500:
                self.retry(countdown=self.request.retries ** 2 * 60)
    
    except requests.RequestException as e:
        logger.error(f"Webhook request failed: {e}")
        resp_body = str(e)

        self.retry(exc=e, countdown=self.request.retries ** 2 * 60)
        
    finally:

        try:
            log = models.WebhookDelivery(
                subscription_id=sub_id,
                event_id=event_id,
                event_type=event_type,
                payload=json.loads(payload_body),
                status=delivery_status,
                response_status=resp_status,
                response_body=resp_body,
                attempt=self.request.retries + 1
            )
            db.add(log)
            db.commit()
        except Exception as log_error:
            logger.error(f"Failed to log webhook delivery: {log_error}")
        finally:
            db.close()
