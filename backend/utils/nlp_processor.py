# backend/utils/nlp_processor.py
import spacy
import pdfplumber
import docx
import json
import re
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np

# Models load karo (ek baar load hote hain, slow nahi hoga)
print("Loading NLP models... (first time thoda time lagega)")
nlp = spacy.load("en_core_web_md")
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')  # Free, fast BERT model
print("NLP Models loaded successfully!")

# Common tech skills ka database (aap aur add kar sakte ho)
SKILLS_DATABASE = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust",
    "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    # Web
    "react", "angular", "vue", "node.js", "express", "django", "flask", "fastapi",
    "html", "css", "bootstrap", "tailwind", "jquery", "next.js", "nuxt",
    # Data Science / ML
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
    "pytorch", "keras", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn",
    "huggingface", "bert", "gpt", "transformers",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "sqlite",
    "oracle", "cassandra", "dynamodb",
    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "github",
    "gitlab", "ci/cd", "terraform", "ansible", "linux", "bash",
    # Other
    "agile", "scrum", "rest api", "graphql", "microservices", "spark", "hadoop",
    "tableau", "power bi", "excel", "figma", "photoshop"
]

def extract_text_from_pdf(file_path):
    """PDF se text extract karo"""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"PDF extract error: {e}")
    return text.strip()

def extract_text_from_docx(file_path):
    """DOCX se text extract karo"""
    text = ""
    try:
        doc = docx.Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        # Tables se bhi text lo
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text += cell.text + " "
                text += "\n"
    except Exception as e:
        print(f"DOCX extract error: {e}")
    return text.strip()

def extract_text(file_path):
    """File type detect karke text extract karo"""
    extension = os.path.splitext(file_path)[1].lower()
    if extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif extension in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    else:
        return ""

def extract_email(text):
    """Email dhundo resume mein"""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(pattern, text)
    return emails[0] if emails else None

def extract_phone(text):
    """Phone number dhundo"""
    pattern = r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}'
    phones = re.findall(pattern, text)
    return phones[0] if phones else None

def extract_name(text):
    """spaCy se naam extract karo"""
    doc = nlp(text[:500])  # Sirf pehle 500 characters check karo (naam upar hota hai)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    # Fallback: pehli line
    first_line = text.strip().split('\n')[0].strip()
    return first_line if len(first_line) < 50 else "Unknown"

def extract_skills(text):
    """Resume se skills extract karo"""
    text_lower = text.lower()
    found_skills = []
    
    for skill in SKILLS_DATABASE:
        # Word boundary check - "java" "javascript" mein galat match na ho
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
    
    # spaCy se additional entities
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT"] and len(ent.text) > 2:
            potential_skill = ent.text.lower().strip()
            if potential_skill not in found_skills and len(potential_skill) < 30:
                found_skills.append(potential_skill)
    
    return list(set(found_skills))  # Duplicates remove karo

def extract_experience_years(text):
    """Experience years nikalo"""
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*yrs?\s*experience',
    ]
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return float(match.group(1))
    
    # Year ranges dhundo (2019-2024 = 5 years)
    year_pattern = r'(20\d{2})\s*[-–]\s*(20\d{2}|present|current)'
    matches = re.findall(year_pattern, text.lower())
    if matches:
        import datetime
        current_year = datetime.datetime.now().year
        total = 0
        for start, end in matches:
            end_year = current_year if end in ['present', 'current'] else int(end)
            total += (end_year - int(start))
        return float(min(total, 30))  # Max 30 years cap
    
    return 0.0

def extract_education(text):
    """Education level nikalo"""
    education_keywords = {
        'PhD': ['phd', 'doctorate', 'doctor of'],
        'Masters': ['master', 'm.tech', 'm.e.', 'mba', 'msc', 'm.s.', 'pg diploma'],
        'Bachelors': ['bachelor', 'b.tech', 'b.e.', 'bsc', 'b.s.', 'b.com', 'bca', 'b.a.'],
        '12th/Diploma': ['12th', 'diploma', 'hsc', 'intermediate'],
        '10th': ['10th', 'ssc', 'matriculation']
    }
    text_lower = text.lower()
    for level, keywords in education_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                return level
    return "Not specified"

def parse_resume(file_path):
    """
    Ek resume file lo, sab kuch extract karo.
    Returns: dictionary with all candidate info
    """
    text = extract_text(file_path)
    if not text:
        return None
    
    return {
        'raw_text': text,
        'name': extract_name(text),
        'email': extract_email(text),
        'phone': extract_phone(text),
        'skills': extract_skills(text),
        'experience_years': extract_experience_years(text),
        'education': extract_education(text)
    }

def calculate_skill_match(candidate_skills, required_skills, preferred_skills=[]):
    """
    Skills match karo aur score calculate karo
    """
    candidate_lower = [s.lower() for s in candidate_skills]
    required_lower = [s.lower() for s in required_skills]
    preferred_lower = [s.lower() for s in preferred_skills]
    
    # Required skills match
    matched_required = [s for s in required_lower if s in candidate_lower]
    matched_preferred = [s for s in preferred_lower if s in candidate_lower]
    missing_required = [s for s in required_lower if s not in candidate_lower]
    
    if not required_lower:
        required_score = 100
    else:
        required_score = (len(matched_required) / len(required_lower)) * 100
    
    preferred_bonus = (len(matched_preferred) / max(len(preferred_lower), 1)) * 20
    
    total_score = min(required_score + preferred_bonus, 100)
    
    return {
        'score': round(total_score, 2),
        'matched_required': matched_required,
        'matched_preferred': matched_preferred,
        'missing_required': missing_required
    }

def calculate_semantic_similarity(resume_text, job_description):
    """
    BERT embeddings use karke semantic similarity calculate karo
    (Same words nahi hain par matlab same hai - yeh detect karta hai)
    """
    try:
        embeddings = sentence_model.encode([resume_text[:1000], job_description[:1000]])
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return round(float(similarity) * 100, 2)
    except Exception as e:
        print(f"Semantic similarity error: {e}")
        return 50.0

def calculate_tfidf_score(resume_text, job_description):
    """
    TF-IDF se keyword similarity nikalo
    """
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=200)
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(similarity) * 100, 2)
    except Exception as e:
        print(f"TF-IDF error: {e}")
        return 50.0

def calculate_experience_score(candidate_years, required_years):
    """Experience score calculate karo"""
    if required_years == 0:
        return 100.0
    if candidate_years >= required_years:
        bonus = min((candidate_years - required_years) * 5, 20)  # Extra experience bonus
        return min(100 + bonus, 100)
    else:
        ratio = candidate_years / required_years
        return round(ratio * 100, 2)

def get_recommendation(overall_score):
    """Score ke basis par recommendation do"""
    if overall_score >= 75:
        return "SHORTLIST"
    elif overall_score >= 50:
        return "REVIEW"
    else:
        return "REJECT"

def generate_ai_summary(candidate_info, job_info, score_info):
    """
    Candidate ke baare mein summary generate karo
    (Simple template-based - no paid API needed)
    """
    name = candidate_info.get('name', 'The candidate')
    score = score_info.get('overall_score', 0)
    matched = score_info.get('matched_skills', [])
    missing = score_info.get('missing_required', [])
    experience = candidate_info.get('experience_years', 0)
    
    recommendation = get_recommendation(score)
    
    summary = f"{name} scored {score:.1f}/100 for the {job_info.get('title', 'position')} role. "
    
    if matched:
        summary += f"Key matching skills include: {', '.join(matched[:5])}. "
    
    if experience > 0:
        summary += f"Has {experience:.0f} year(s) of experience. "
    
    if missing:
        summary += f"Missing required skills: {', '.join(missing[:3])}. "
    
    if recommendation == "SHORTLIST":
        summary += "Strongly recommended for interview."
    elif recommendation == "REVIEW":
        summary += "Consider for further review — meets some requirements."
    else:
        summary += "Does not meet minimum requirements for this role."
    
    return summary

def screen_resume_against_job(candidate_data, job_data):
    """
    Main function: Resume aur Job ke beech match karo
    Returns complete screening result
    """
    # Skills parse karo
    candidate_skills = json.loads(candidate_data.get('skills', '[]'))
    required_skills = json.loads(job_data.get('required_skills', '[]'))
    preferred_skills = json.loads(job_data.get('preferred_skills', '[]'))
    
    # 1. Skill matching
    skill_result = calculate_skill_match(candidate_skills, required_skills, preferred_skills)
    
    # 2. Semantic similarity (BERT)
    resume_text = candidate_data.get('resume_text', '')
    job_desc = job_data.get('description', '')
    semantic_score = calculate_semantic_similarity(resume_text, job_desc)
    
    # 3. TF-IDF keyword score
    keyword_score = calculate_tfidf_score(resume_text, job_desc)
    
    # 4. Experience score
    exp_score = calculate_experience_score(
        candidate_data.get('experience_years', 0),
        job_data.get('min_experience', 0)
    )
    
    # 5. Weighted overall score
    # (Aap weights change kar sakte ho apne project mein)
    overall = (
        skill_result['score'] * 0.40 +      # Skills: 40% weightage
        semantic_score * 0.25 +              # Semantic: 25% weightage
        keyword_score * 0.20 +               # Keywords: 20% weightage
        exp_score * 0.15                     # Experience: 15% weightage
    )
    
    recommendation = get_recommendation(overall)
    
    summary = generate_ai_summary(
        candidate_data,
        job_data,
        {'overall_score': overall, 'matched_skills': skill_result['matched_required'],
         'missing_required': skill_result['missing_required']}
    )
    
    return {
        'overall_score': round(overall, 2),
        'skill_match_score': skill_result['score'],
        'semantic_similarity_score': semantic_score,
        'keyword_score': keyword_score,
        'experience_score': exp_score,
        'matched_skills': json.dumps(skill_result['matched_required']),
        'missing_skills': json.dumps(skill_result['missing_required']),
        'recommendation': recommendation,
        'ai_summary': summary
    }