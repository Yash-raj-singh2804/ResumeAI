import shutil
import os
import urllib.parse
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from routes import resume_extraction, analytics, ats, search, auth_api, webhooks
from typing import Annotated
from dotenv import load_dotenv
import time
import json
from sqlalchemy.orm import Session
from fastapi import Depends
import models
from database import engine, get_db
from datetime import datetime, timedelta

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"]
)

app.include_router(resume_extraction.router)
app.include_router(analytics.router)
app.include_router(ats.router)
app.include_router(search.router)
app.include_router(auth_api.router)
app.include_router(webhooks.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
