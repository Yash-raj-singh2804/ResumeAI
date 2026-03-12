from fastapi import APIRouter
from sqlalchemy.orm import Session
from database import get_db
from models import ParsingLog
UPLOAD_DIR = "uploads"
import json
from datetime import datetime, timedelta
from parsing_pipeline.parser import extract_text
from parsing_pipeline.llm_chain import extract_resume_details
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
import time
import os
import shutil
from models import ParsingLog, Candidate, Resume, Skill, CandidateSkill
import models
from smart_student_search.embedder import get_embedding
from smart_student_search.vector_stores import add_resume_to_vector_db
from sqlalchemy import select
import urllib.parse
from typing import Annotated
from dotenv import load_dotenv
from database import engine, get_db
from datetime import datetime, timedelta
from fastapi.staticfiles import StaticFiles

load_dotenv()

router = APIRouter()

@router.post("/extract")
async def extract_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    start_time = time.time()
    try:
        file_location = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        text = extract_text(file_location, file.filename)
        
        extracted_data = extract_resume_details(text)
        
        embedding_text = f"Role: {extracted_data.get('role', '')}. Skills: {', '.join(extracted_data.get('skills', []))}. Experience: {', '.join(extracted_data.get('experience', []))}"
        vector = get_embedding(embedding_text)

        filename_quoted = urllib.parse.quote(file.filename)
        file_url = f"http://localhost:8000/uploads/{filename_quoted}"
        extracted_data["file_url"] = file_url

        email = extracted_data.get("email")
        full_name = extracted_data.get("full_name", "Unknown Candidate")
        
        candidate = None
        if email:
            candidate = db.query(Candidate).filter(Candidate.email == email).first()
        
        if not candidate:
            candidate = Candidate(
                full_name=full_name,
                email=email
            )
            db.add(candidate)
            db.flush()
            

        new_resume = Resume(
            candidate_id=candidate.id,
            file_url=file_url,
            parsed_content=extracted_data,
        )
        db.add(new_resume)
        db.flush()
        
        add_resume_to_vector_db(
            resume_id=str(new_resume.id),
            text=embedding_text,
            vector=vector,
            metadata={"role": extracted_data.get('role', ''), "email": email}
        )
        
        extracted_skills = extracted_data.get("skills", [])
        for skill_name in extracted_skills:
            skill_norm = skill_name.strip().title()
            
            skill_db = db.query(Skill).filter(Skill.name == skill_norm).first()
            if not skill_db:
                skill_db = Skill(name=skill_norm)
                db.add(skill_db)
                db.flush()
            
            existing_link = db.query(CandidateSkill).filter(
                CandidateSkill.candidate_id == candidate.id,
                CandidateSkill.skill_id == skill_db.id
            ).first()
            
            if not existing_link:
                confidence = 1.0 
                link = CandidateSkill(
                    candidate_id=candidate.id,
                    skill_id=skill_db.id,
                    confidence_score=confidence
                )
                db.add(link)

        process_time = time.time() - start_time
        skills_json = json.dumps(extracted_data.get("skills", [])[:50]) 
        role = extracted_data.get("role", "Unknown")
        
        log_entry = models.ParsingLog(
            status="SUCCESS",
            processing_time=process_time,
            file_type=file.filename.split('.')[-1],
            filename=file.filename,
            detected_role=role,
            detected_skills=skills_json
        )
        db.add(log_entry)
        db.commit()
        
        try:
            from tasks import dispatch_webhook
            webhook_data = extracted_data.copy()
            webhook_data["id"] = str(new_resume.id)
            dispatch_webhook.delay("resume.parsed", webhook_data)
        except Exception as e:
            print(f"Failed to dispatch webhook: {e}")

        return extracted_data
        
    except Exception as e:

        process_time = time.time() - start_time
        log_entry = models.ParsingLog(
            status="FAILED",
            processing_time=process_time,
            file_type=file.filename.split('.')[-1] if file else "unknown",
            error_message=str(e)
        )
        db.add(log_entry)
        db.commit()

        try:
            from tasks import dispatch_webhook
            dispatch_webhook.delay("resume.failed", {"filename": file.filename, "error": str(e)})
        except Exception as we:
            print(f"Failed to dispatch failure webhook: {we}")

        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")