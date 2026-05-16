# backend/app.py
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///resume_screener.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'mysecretkey123')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

from extensions import db
db.init_app(app)

from routes.resume_routes import resume_bp
from routes.job_routes import job_bp
from routes.screen_routes import screen_bp

app.register_blueprint(resume_bp, url_prefix='/api/resumes')
app.register_blueprint(job_bp, url_prefix='/api/jobs')
app.register_blueprint(screen_bp, url_prefix='/api/screen')

@app.route('/')
def home():
    return {'message': 'Resume Screener API is running!', 'status': 'ok'}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)