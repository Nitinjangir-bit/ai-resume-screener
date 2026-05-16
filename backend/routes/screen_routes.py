# backend/routes/screen_routes.py
from flask import Blueprint, request, jsonify
import json
from extensions import db
from models.models import Candidate, JobDescription, ScreeningResult
from utils.nlp_processor import screen_resume_against_job

screen_bp = Blueprint('screen', __name__)

@screen_bp.route('/single', methods=['POST'])
def screen_single():
    """
    Ek candidate ko ek job ke against screen karo
    Body: { candidate_id: 1, job_id: 1 }
    """
    data = request.get_json()
    candidate_id = data.get('candidate_id')
    job_id = data.get('job_id')
    
    if not candidate_id or not job_id:
        return jsonify({'error': 'candidate_id and job_id required'}), 400
    
    candidate = Candidate.query.get_or_404(candidate_id)
    job = JobDescription.query.get_or_404(job_id)
    
    # NLP processing - yahi main magic hai!
    result = screen_resume_against_job(
        {
            'resume_text': candidate.resume_text,
            'skills': candidate.skills,
            'experience_years': candidate.experience_years,
            'name': candidate.name
        },
        {
            'description': job.description,
            'required_skills': job.required_skills,
            'preferred_skills': job.preferred_skills or '[]',
            'min_experience': job.min_experience,
            'title': job.title
        }
    )
    
    # Pehle ka result check karo (overwrite karo ya naya banao)
    existing = ScreeningResult.query.filter_by(
        candidate_id=candidate_id, job_id=job_id
    ).first()
    
    if existing:
        for key, value in result.items():
            setattr(existing, key, value)
        db.session.commit()
        return jsonify({'message': 'Screening updated', 'result': existing.to_dict()})
    
    screening = ScreeningResult(
        candidate_id=candidate_id,
        job_id=job_id,
        **result
    )
    db.session.add(screening)
    db.session.commit()
    
    return jsonify({'message': 'Screening complete!', 'result': screening.to_dict()}), 201

@screen_bp.route('/bulk', methods=['POST'])
def screen_bulk():
    """
    Ek job ke liye SARE candidates screen karo
    Body: { job_id: 1 }
    """
    data = request.get_json()
    job_id = data.get('job_id')
    
    if not job_id:
        return jsonify({'error': 'job_id required'}), 400
    
    job = JobDescription.query.get_or_404(job_id)
    candidates = Candidate.query.all()
    
    if not candidates:
        return jsonify({'error': 'No candidates in database'}), 404
    
    results = []
    for candidate in candidates:
        result = screen_resume_against_job(
            {
                'resume_text': candidate.resume_text,
                'skills': candidate.skills,
                'experience_years': candidate.experience_years,
                'name': candidate.name
            },
            {
                'description': job.description,
                'required_skills': job.required_skills,
                'preferred_skills': job.preferred_skills or '[]',
                'min_experience': job.min_experience,
                'title': job.title
            }
        )
        
        existing = ScreeningResult.query.filter_by(
            candidate_id=candidate.id, job_id=job_id
        ).first()
        
        if existing:
            for key, value in result.items():
                setattr(existing, key, value)
        else:
            screening = ScreeningResult(candidate_id=candidate.id, job_id=job_id, **result)
            db.session.add(screening)
        
        results.append({
            'candidate_name': candidate.name,
            'candidate_id': candidate.id,
            **result
        })
    
    db.session.commit()
    
    # Score ke hisaab se sort karo
    results.sort(key=lambda x: x['overall_score'], reverse=True)
    
    return jsonify({
        'message': f'Screened {len(results)} candidates',
        'job_title': job.title,
        'results': results
    })

@screen_bp.route('/results/job/<int:job_id>', methods=['GET'])
def get_results_by_job(job_id):
    """Ek job ke sare screening results lo"""
    results = ScreeningResult.query.filter_by(job_id=job_id)\
        .order_by(ScreeningResult.overall_score.desc()).all()
    
    detailed = []
    for r in results:
        d = r.to_dict()
        d['candidate_name'] = r.candidate.name
        d['candidate_email'] = r.candidate.email
        detailed.append(d)
    
    return jsonify(detailed)