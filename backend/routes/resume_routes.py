# backend/routes/resume_routes.py
from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models.models import Candidate
from werkzeug.utils import secure_filename
import os
import json
from utils.nlp_processor import parse_resume, extract_skills

resume_bp = Blueprint('resumes', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_bp.route('/upload', methods=['POST'])
def upload_resume():
    """Resume upload karo aur parse karo"""
    
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['resume']
    email = request.form.get('email', '').strip()
    
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF and DOCX files allowed'}), 400
    
    # File save karo
    filename = secure_filename(file.filename)
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    # Resume parse karo (NLP magic here!)
    parsed = parse_resume(file_path)
    if not parsed:
        return jsonify({'error': 'Could not extract text from file'}), 422
    
    # Override email if provided in form
    candidate_email = email or parsed.get('email') or f"unknown_{filename}@placeholder.com"
    
    # Check if candidate already exists
    existing = Candidate.query.filter_by(email=candidate_email).first()
    if existing:
        # Update existing record
        existing.resume_filename = filename
        existing.resume_text = parsed['raw_text']
        existing.skills = json.dumps(parsed['skills'])
        existing.experience_years = parsed['experience_years']
        existing.education = parsed['education']
        db.session.commit()
        return jsonify({'message': 'Resume updated', 'candidate': existing.to_dict()}), 200
    
    # New candidate create karo
    candidate = Candidate(
        name=parsed['name'],
        email=candidate_email,
        resume_filename=filename,
        resume_text=parsed['raw_text'],
        skills=json.dumps(parsed['skills']),
        experience_years=parsed['experience_years'],
        education=parsed['education']
    )
    db.session.add(candidate)
    db.session.commit()
    
    return jsonify({
        'message': 'Resume uploaded and parsed successfully',
        'candidate': candidate.to_dict(),
        'extracted_info': {
            'name': parsed['name'],
            'email': parsed['email'],
            'skills_found': len(parsed['skills']),
            'skills': parsed['skills'],
            'experience_years': parsed['experience_years'],
            'education': parsed['education']
        }
    }), 201

@resume_bp.route('/', methods=['GET'])
def get_all_candidates():
    """Sab candidates ki list lo"""
    candidates = Candidate.query.order_by(Candidate.created_at.desc()).all()
    return jsonify([c.to_dict() for c in candidates])

@resume_bp.route('/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    """Ek candidate ki detail lo"""
    candidate = Candidate.query.get_or_404(candidate_id)
    return jsonify(candidate.to_dict())

@resume_bp.route('/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    """Candidate delete karo"""
    candidate = Candidate.query.get_or_404(candidate_id)
    db.session.delete(candidate)
    db.session.commit()
    return jsonify({'message': 'Candidate deleted'}), 200