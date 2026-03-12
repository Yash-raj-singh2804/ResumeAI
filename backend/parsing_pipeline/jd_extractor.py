import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

class JobDescriptionData(BaseModel):
    required_skills: List[str] = Field(description="List of mandatory technical and soft skills")
    preferred_skills: List[str] = Field(default=[], description="List of nice-to-have skills")
    seniority: str = Field(default="Unknown", description="Seniority level (e.g., Junior, Senior, Staff, Lead)")
    keywords: List[str] = Field(default=[], description="Important keywords for ATS optimization")
    job_role: Optional[str] = Field(default="Unknown", description="The job title or role")

def extract_job_details(jd_text: str):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"error": "GOOGLE_API_KEY not found"}

    try:
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
        parser = PydanticOutputParser(pydantic_object=JobDescriptionData)

        template = """
        You are an ATS system. Analyze the following Job Description (JD) and extract structured requirements.

        {format_instructions}

        --- JOB DESCRIPTION ---
        {jd_text}
        """

        prompt = PromptTemplate(
            template=template,
            input_variables=["jd_text"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        chain = prompt | llm | parser

        result = chain.invoke({"jd_text": jd_text})
        return result.dict()

    except Exception as e:
        print(f"JD Extraction Error: {e}")
        return {"error": str(e)}
