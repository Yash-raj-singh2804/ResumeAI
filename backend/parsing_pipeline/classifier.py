import re
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

HEADERS = {
    "EXPERIENCE": [r"experience", r"employment", r"work history", r"work experience", r"career history", r"internship", r"internships", r"internship experience"],
    "PROJECTS": [r"projects", r"technical projects", r"capstone projects", r"key projects"],
    "EDUCATION": [r"education", r"academic", r"qualifications", r"academic background", r"10th", r"12th", r"graduation", r"post graduation", r"phd", r"masters", r"bachelors"],
    "SKILLS": [r"skills", r"technical skills", r"technologies", r"competencies", r"core competencies"],
    "PERSONAL": [r"personal details", r"contact", r"profile", r"summary", r"about me"]
}

def clean_line(line):
    return line.strip()

def is_header(line):

    line_clean = clean_line(line)
    if not line_clean:
        return False
    
    if len(line_clean) > 50:
        return False
    
    line_lower = line_clean.lower()
    for category, patterns in HEADERS.items():
        for pattern in patterns:
            if re.search(pattern, line_lower):
                return True
                
    if line_clean.isupper() and len(line_clean) > 3:
        return True
        
    return False

def split_text_by_headers(text):
    lines = text.split('\n')
    blocks = []
    current_block = {"header": "UNK", "content": []}
    
    for line in lines:
        if is_header(line):

            if current_block["content"]:
                blocks.append(current_block)

            current_block = {"header": line.strip(), "content": []}
        else:
            current_block["content"].append(line)
            
    if current_block["content"]:
        blocks.append(current_block)
        
    return blocks

def classify_block_heuristic(header_line):
    line_lower = header_line.lower()
    for category, patterns in HEADERS.items():
        for pattern in patterns:
            if re.search(pattern, line_lower):
                return category
    return None

def classify_block_llm(block_text):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "OTHER"
        
    try:

        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
        
        template = """
        Classify the following resume section into exactly one of these labels: 
        EXPERIENCE, PROJECTS, EDUCATION, SKILLS, PERSONAL, OTHER.
        
        Return ONLY the label. Do not return any other text.
        
        Text:
        {text}
        """
        
        prompt = PromptTemplate(template=template, input_variables=["text"])
        chain = prompt | llm
        
        content_sample = block_text[:1000] 
        resp = chain.invoke({"text": content_sample})
        return resp.content.strip()
    except Exception as e:
        print(f"LLM Classification Error: {e}")
        return "OTHER"

def organize_text(text):
    blocks = split_text_by_headers(text)
    organized = {
        "EXPERIENCE": [],
        "PROJECTS": [],
        "EDUCATION": [],
        "SKILLS": [],
        "PERSONAL": [],
        "OTHER": []
    }
    
    for block in blocks:
        header = block["header"]
        content = "\n".join(block["content"])
        full_text = f"{header}\n{content}"
        
        label = classify_block_heuristic(header)
        

        if not label:
             label = classify_block_llm(full_text)
             
        label = label.upper()
        if label not in organized:
            label = "OTHER"
            
        organized[label].append(full_text)
        
    return {k: "\n\n".join(v) for k, v in organized.items()}
