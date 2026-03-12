from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import ParsingLog
import models
import json
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    logs = db.query(models.ParsingLog).all()
    
    total = len(logs)
    if total == 0:
        return {"total": 0, "success_rate": 0, "avg_time": 0, "skills": [], "timeline": []}
        
    success = len([l for l in logs if l.status == "SUCCESS"])
    failed = total - success
    avg_time = sum([l.processing_time for l in logs]) / total
    
    all_skills = []
    for log in logs:
        if log.detected_skills:
            try:
                skills = json.loads(log.detected_skills)
                all_skills.extend(skills)
            except:
                pass
                
    from collections import Counter
    skill_counts = Counter(all_skills).most_common(10)
    top_skills = [{"name": s[0], "count": s[1]} for s in skill_counts]
    
    timeline_data = {}
    today = datetime.utcnow().date()
    for i in range(7):
        date_key = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        timeline_data[date_key] = 0
        
    for log in logs:
        date_str = log.timestamp.strftime("%Y-%m-%d")
        if date_str in timeline_data:
            timeline_data[date_str] += 1
            
    timeline_list = [{"date": k, "count": v} for k, v in reversed(timeline_data.items())]

    return {
        "total": total,
        "success": success,
        "failed": failed,
        "success_rate": round((success/total)*100, 1),
        "avg_time": round(avg_time, 2),
        "top_skills": top_skills,
        "timeline": timeline_list
    }

@router.get("/resumes")
def get_resumes(db: Session = Depends(get_db)):
    resumes = db.query(models.ParsingLog).filter(models.ParsingLog.status == "SUCCESS").order_by(models.ParsingLog.timestamp.desc()).all()
    return [{
        "id": r.id,
        "filename": r.filename,
        "role": r.detected_role,
        "date": r.timestamp.strftime("%Y-%m-%d %H:%M")
    } for r in resumes]