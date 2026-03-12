from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from parsing_pipeline.jd_extractor import extract_job_details
from parsing_pipeline.parser import extract_text
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import json
import os
import re
from typing import List, Optional
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ats", tags=["ATS"])

class ATSEvaluateRequest(BaseModel):
    resume_id: int
    job_description: str

def calculate_skill_score(resume_skills: List[str], jd_skills: List[str]) -> float:
    if not jd_skills:
        return 100.0
    
    resume_skills_lower = set([s.lower() for s in resume_skills])
    jd_skills_lower = set([s.lower() for s in jd_skills])
    
    matches = resume_skills_lower.intersection(jd_skills_lower)
    return (len(matches) / len(jd_skills_lower)) * 100

def calculate_semantic_score(resume_text: str, jd_text: str) -> float:

    resume_tokens = set(re.findall(r'\w+', resume_text.lower()))
    jd_tokens = set(re.findall(r'\w+', jd_text.lower()))
    
    intersection = resume_tokens.intersection(jd_tokens)
    union = resume_tokens.union(jd_tokens)
    
    if not union:
        return 0.0
    
    return (len(intersection) / len(union)) * 100

def calculate_experience_score(resume_text: str, jd_seniority: str) -> float:
    years_pattern = r'(\d+)\+?\s*years?'
    matches = re.findall(years_pattern, resume_text.lower())
    
    if not matches:
        return 50.0
        
    max_years = max([int(m) for m in matches])
    
    required_years = 0
    if "senior" in jd_seniority.lower():
        required_years = 5
    elif "mid" in jd_seniority.lower():
        required_years = 3
    elif "junior" in jd_seniority.lower():
        required_years = 1
        
    if max_years >= required_years:
        return 100.0
    else:
        return (max_years / required_years) * 100.0 if required_years > 0 else 100.0

def get_formatting_score(file_type: str) -> float:
    if file_type.lower() == 'pdf':
        return 100.0
    elif file_type.lower() == 'docx':
        return 90.0
    else:
        return 50.0

@router.post("/evaluate")
def evaluate_resume(request: ATSEvaluateRequest, db: Session = Depends(get_db)):

    resume = db.query(models.ParsingLog).filter(models.ParsingLog.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        

    jd_analysis = extract_job_details(request.job_description)
    if "error" in jd_analysis:
        raise HTTPException(status_code=500, detail=jd_analysis["error"])
        

    jd_entry = models.JobDescription(
        job_role=jd_analysis.get("job_role", "Unknown"),
        required_skills=json.dumps(jd_analysis.get("required_skills", [])),
        preferred_skills=json.dumps(jd_analysis.get("preferred_skills", [])),
        seniority=jd_analysis.get("seniority", "Unknown"),
        original_text=request.job_description
    )
    db.add(jd_entry)
    db.commit()


    resume_skills = json.loads(resume.detected_skills) if resume.detected_skills else []
    jd_required_skills = jd_analysis.get("required_skills", [])
    
    resume_text = ""
    try:
        file_path = os.path.join("uploads", resume.filename)
        resume_text = extract_text(file_path, resume.filename)
    except Exception as e:
        logger.error(f"Could not read file for semantic analysis: {e}")
        resume_text = ""

    skill_score = calculate_skill_score(resume_skills, jd_required_skills)
    semantic_score = calculate_semantic_score(resume_text, request.job_description)
    experience_score = calculate_experience_score(resume_text, jd_analysis.get("seniority", "Junior"))
    formatting_score = get_formatting_score(resume.file_type)
    

    final_ats_score = (
        (skill_score * 0.4) + 
        (semantic_score * 0.3) + 
        (experience_score * 0.2) + 
        (formatting_score * 0.1)
    )
    
    final_ats_score = round(min(final_ats_score, 100.0))


    api_key = os.getenv("GOOGLE_API_KEY")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
    
    prompt = PromptTemplate.from_template("""
    You are an ATS System Auditor.
    
    I have calculated an ATS Score for a candidate based on the following breakdown:
    - Overall ATS Score: {final_ats_score}/100
    - Skill Match Score (40% weight): {skill_score:.1f}%
    - Semantic Match Score (30% weight): {semantic_score:.1f}%
    - Experience Alignment Score (20% weight): {experience_score:.1f}%
    - Formatting Score (10% weight): {formatting_score:.1f}%
    
    Context:
    - Job Role: {jd_role} (Seniority: {jd_seniority})
    - JD Skills Required: {jd_skills}
    - Resume Skills Found: {resume_skills}
    - Resume Text Snippet: {resume_snippet}
    
    Task:
    Provide an EXPLANATION for this score.
    1. Identify Missing Skills (strict list).
    2. Identify Formatting or Content issues.
    3. Provide a 'reasoning' sentence explaining why the score is what it is.
    4. Estimate 'pass_probability' (Low/Medium/High) based on the score.

    Return JSON:
    {{
        "missing_skills": ["Skill1", "Skill2"],
        "formatting_issues": ["Issue1"],
        "reasoning": "Candidate has strong skills in X but lacks Y...",
        "pass_probability": "High"
    }}
    """)
    
    try:
        response = chain = (prompt | llm).invoke({
            "final_ats_score": final_ats_score,
            "skill_score": skill_score,
            "semantic_score": semantic_score,
            "experience_score": experience_score,
            "formatting_score": formatting_score,
            "jd_role": jd_analysis.get("job_role"),
            "jd_seniority": jd_analysis.get("seniority"),
            "jd_skills": jd_required_skills,
            "resume_skills": resume_skills,
            "resume_snippet": resume_text[:1000]
        })
        
        content = response.content.replace("```json", "").replace("```", "").strip()
        reasoning_data = json.loads(content)
        
        result = {
            "ats_score": final_ats_score,
            "pass_probability": reasoning_data.get("pass_probability", "Medium"),
            "missing_skills": reasoning_data.get("missing_skills", []),
            "formatting_issues": reasoning_data.get("formatting_issues", []),
            "reasoning": reasoning_data.get("reasoning", "Score calculated based on formula.")
        }


        try:
            from tasks import dispatch_webhook
            dispatch_webhook.delay("ats.score.generated", result)
        except Exception as e:
            logger.error(f"Failed to dispatch ATS webhook: {e}")

        return result
        
    except Exception as e:
        logger.error(f"Gemini reasoning failed: {e}")
        return {
            "ats_score": final_ats_score,
            "pass_probability": "Unknown",
            "missing_skills": [],
            "formatting_issues": [],
            "reasoning": "Score calculated, but reasoning engine failed."
        }
