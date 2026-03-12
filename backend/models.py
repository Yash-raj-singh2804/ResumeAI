from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base
import datetime
import uuid

class ParsingLog(Base):
    __tablename__ = "parsing_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String)
    processing_time = Column(Float)
    file_type = Column(String)
    filename = Column(String, nullable=True)
    detected_role = Column(String, nullable=True)
    detected_skills = Column(String, nullable=True)
    error_message = Column(String, nullable=True)

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    job_role = Column(String)
    required_skills = Column(String)
    preferred_skills = Column(String)
    seniority = Column(String)
    original_text = Column(String)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    resumes = relationship("Resume", back_populates="candidate")
    skills = relationship("CandidateSkill", back_populates="candidate")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    confidence_score = Column(Float, default=1.0)
    years_of_experience = Column(Float, nullable=True)
    
    candidate = relationship("Candidate", back_populates="skills")
    skill = relationship("Skill")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"))
    version = Column(Integer, default=1)
    file_url = Column(String)
    parsed_content = Column(JSONB)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="resumes")

class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    key_hash = Column(String, unique=True, index=True)
    key_prefix = Column(String)
    name = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_url = Column(String, nullable=False)
    event_types = Column(JSONB)
    secret_key = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("webhook_subscriptions.id"))
    event_id = Column(String, index=True)
    event_type = Column(String)
    payload = Column(JSONB)
    status = Column(String)
    response_status = Column(Integer, nullable=True)
    response_body = Column(String, nullable=True)
    attempt = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    subscription = relationship("WebhookSubscription")
