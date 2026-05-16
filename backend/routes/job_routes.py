# backend/routes/job_routes.py
from flask import Blueprint, request, jsonify
import json
from extensions import db
from models.models import JobDescription

job_bp = Blueprint('jobs', __name__)

@job_bp.route('/', methods=['POST'])
def create_job():
    """Nayi job description add karo"""
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('description'):
        return jsonify({'error': 'Title and description are required'}), 400
    
    job = JobDescription(
        title=data['title'],
        company=data.get('company', ''),
        description=data['description'],
        required_skills=json.dumps(data.get('required_skills', [])),
        preferred_skills=json.dumps(data.get('preferred_skills', [])),
        min_experience=float(data.get('min_experience', 0))
    )
    db.session.add(job)
    db.session.commit()
    
    return jsonify({'message': 'Job created', 'job': job.to_dict()}), 201

@job_bp.route('/', methods=['GET'])
def get_all_jobs():
    """Sab jobs ki list"""
    jobs = JobDescription.query.order_by(JobDescription.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs])

@job_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = JobDescription.query.get_or_404(job_id)
    return jsonify(job.to_dict())

@job_bp.route('/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    """Job update karo"""
    job = JobDescription.query.get_or_404(job_id)
    data = request.get_json()
    
    if 'title' in data: job.title = data['title']
    if 'company' in data: job.company = data['company']
    if 'description' in data: job.description = data['description']
    if 'required_skills' in data: job.required_skills = json.dumps(data['required_skills'])
    if 'preferred_skills' in data: job.preferred_skills = json.dumps(data['preferred_skills'])
    if 'min_experience' in data: job.min_experience = float(data['min_experience'])
    
    db.session.commit()
    return jsonify({'message': 'Job updated', 'job': job.to_dict()})

@job_bp.route('/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = JobDescription.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job deleted'})