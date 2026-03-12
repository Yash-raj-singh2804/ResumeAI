import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
from parsing_pipeline.classifier import organize_text
from dotenv import load_dotenv

load_dotenv()

class ResumeData(BaseModel):
    full_name: Optional[str] = Field(description="Candidate's full name. If not found, return None.")
    email: Optional[str] = Field(description="Candidate's email address. If not found, return None.")
    role: str = Field(description="The candidate's current or target job role")
    skills: List[str] = Field(description="List of technical and soft skills")
    experience: List[str] = Field(description="List of work experiences, including company and duration if available")
    projects: List[str] = Field(description="List of projects, including title and description")
    education: List[str] = Field(description="Educational background details")

def extract_resume_details(resume_text: str):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"error": "GOOGLE_API_KEY not found in environment variables. Please set it in .env"}

    try:

        organized_data = organize_text(resume_text)
        
        parser = PydanticOutputParser(pydantic_object=ResumeData)
        template = """
        You are an expert resume parser. Extract the following details from the resume text provided below.
        
        I have already separated the text into sections for you. Please use the specific sections to populate the corresponding fields.
        - Use the 'EXPERIENCE' section for the 'experience' field.
        - Use the 'PROJECTS' section for the 'projects' field.
        - Use the 'EDUCATION' section for the 'education' field.
        - Use 'SKILLS' for 'skills'.
        - Use 'PERSONAL'/Header to extract 'full_name' and 'email'.
        - Use 'PERSONAL' for 'role' context if needed.
        
        {format_instructions}
        
        --- RESUME SECTIONS ---
        
        SECTION: EXPERIENCE
        {experience_context}
        
        SECTION: PROJECTS
        {projects_context}
        
        SECTION: EDUCATION
        {education_context}
        
        SECTION: SKILLS
        {skills_context}
        
        SECTION: PERSONAL/OTHER
        {personal_context}
        {other_context}
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["experience_context", "projects_context", "education_context", "skills_context", "personal_context", "other_context"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        inputs = {
            "experience_context": organized_data.get("EXPERIENCE", ""),
            "projects_context": organized_data.get("PROJECTS", ""),
            "education_context": organized_data.get("EDUCATION", ""),
            "skills_context": organized_data.get("SKILLS", ""),
            "personal_context": organized_data.get("PERSONAL", ""),
            "other_context": organized_data.get("OTHER", "")
        }

        try:
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key, max_retries=0)
            chain = prompt | llm | parser
            result = chain.invoke(inputs)
            
        except Exception as e:

            groq_key = os.getenv("GROQ_API_KEY")
            if groq_key:
                print(f"Gemini Error ({str(e)}). Switching to Groq fallback...")
                llm_fallback = ChatGroq(model="llama-3.1-8b-instant", api_key=groq_key)
                chain_fallback = prompt | llm_fallback | parser
                result = chain_fallback.invoke(inputs)
            else:
                raise e
        
        result_dict = result.dict()
        result_dict["parsing_debug"] = organized_data
        return result_dict
    except Exception as exc:
        print(f"Extraction Error: {exc}")
        return {"error": str(exc)}
