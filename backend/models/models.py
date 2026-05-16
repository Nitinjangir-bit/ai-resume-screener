# backend/models/models.py
from extensions import db
from datetime import datetime

class Candidate(db.Model):
    __tablename__ = 'candidates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    resume_filename = db.Column(db.String(200))
    resume_text = db.Column(db.Text)  # Extracted text stored here
    skills = db.Column(db.Text)       # JSON string of skills list
    experience_years = db.Column(db.Float, default=0)
    education = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with screening results
    screenings = db.relationship('ScreeningResult', backref='candidate', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'resume_filename': self.resume_filename,
            'skills': self.skills,
            'experience_years': self.experience_years,
            'education': self.education,
            'created_at': self.created_at.isoformat()
        }

class JobDescription(db.Model):
    __tablename__ = 'job_descriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200))
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.Text)   # JSON string
    preferred_skills = db.Column(db.Text)  # JSON string
    min_experience = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    screenings = db.relationship('ScreeningResult', backref='job', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'description': self.description,
            'required_skills': self.required_skills,
            'min_experience': self.min_experience,
            'created_at': self.created_at.isoformat()
        }

class ScreeningResult(db.Model):
    __tablename__ = 'screening_results'
    
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job_descriptions.id'), nullable=False)
    
    # Scores (0 to 100)
    overall_score = db.Column(db.Float)
    skill_match_score = db.Column(db.Float)
    experience_score = db.Column(db.Float)
    semantic_similarity_score = db.Column(db.Float)
    keyword_score = db.Column(db.Float)
    
    matched_skills = db.Column(db.Text)    # JSON - skills jo match hue
    missing_skills = db.Column(db.Text)    # JSON - skills jo nahi hain
    recommendation = db.Column(db.String(50))  # "SHORTLIST", "REVIEW", "REJECT"
    ai_summary = db.Column(db.Text)        # AI generated summary
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'job_id': self.job_id,
            'overall_score': round(self.overall_score, 2),
            'skill_match_score': round(self.skill_match_score, 2),
            'experience_score': round(self.experience_score, 2),
            'semantic_similarity_score': round(self.semantic_similarity_score, 2),
            'keyword_score': round(self.keyword_score, 2),
            'matched_skills': self.matched_skills,
            'missing_skills': self.missing_skills,
            'recommendation': self.recommendation,
            'ai_summary': self.ai_summary,
            'created_at': self.created_at.isoformat()
        }