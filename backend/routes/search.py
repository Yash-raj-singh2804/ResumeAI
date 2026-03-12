from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Resume, Candidate, Skill, CandidateSkill
from smart_student_search.embedder import get_embedding
from smart_student_search.vector_stores import search_resumes
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import select, func, desc

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    skills: Optional[List[str]] = None
    min_experience: Optional[float] = None
    limit: int = 10

@router.post("/search/candidates")
async def search_candidates(request: SearchRequest, db: Session = Depends(get_db)):
    try:

        query_vector = get_embedding(request.query)
        
        chroma_results = search_resumes(query_vector, limit=request.limit) 
        
        resume_scores = {}
        for res in chroma_results:
             resume_id = res['metadata']['resume_id']
             score = 1 - res['distance']
             resume_scores[resume_id] = {
                 'score': score,
                 'distance': res['distance']
             }
             
        top_resume_ids = list(resume_scores.keys())
        
        if not top_resume_ids:
            return []

        stmt = select(Resume, Candidate).join(Candidate, Resume.candidate_id == Candidate.id)\
            .filter(Resume.id.in_(top_resume_ids))
            
        if request.skills:
             stmt = stmt.join(CandidateSkill, Candidate.id == CandidateSkill.candidate_id)\
                       .join(Skill, CandidateSkill.skill_id == Skill.id)\
                       .filter(func.lower(Skill.name).in_([s.lower() for s in request.skills]))
        
        results = db.execute(stmt).all()
        
        response = []
        seen_candidates = set()
        
        db_map = {str(r.Resume.id): (r.Resume, r.Candidate) for r in results}
        
        for resume_id in top_resume_ids:
            if resume_id not in db_map:
                continue 
                
            resume, candidate = db_map[resume_id]
            vector_data = resume_scores[resume_id]
            
            if candidate.id in seen_candidates:
                continue
            seen_candidates.add(candidate.id)
            
            response.append({
                "candidate_id": str(candidate.id),
                "name": candidate.full_name,
                "email": candidate.email,
                "score": round(vector_data['score'] * 100, 2),
                "role": resume.parsed_content.get("role", "Unknown"),
                "skills": resume.parsed_content.get("skills", []),
                "summary": f"Matches query ({round(vector_data['score'] * 100)}%)"
            })
            
        return response[:request.limit]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
