import hmac
import hashlib
import json
import time
import uuid

def generate_hmac_signature(secret_key: str, payload_body: str) -> str:
    """
    Generate SHA-256 HMAC signature for the payload.
    """
    secret_bytes = secret_key.encode('utf-8')
    payload_bytes = payload_body.encode('utf-8')
    
    signature = hmac.new(secret_bytes, payload_bytes, hashlib.sha256).hexdigest()
    return f"sha256={signature}"

def format_payload(event_type: str, data: dict) -> dict:
    """
    Standardize the webhook event payload.
    """
    return {
        "id": str(uuid.uuid4()),
        "event": event_type,
        "created_at": time.time(),
        "data": data
    }
