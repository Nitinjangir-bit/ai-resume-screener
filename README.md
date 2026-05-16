# 🤖 AI-Powered Resume Screener

> Final Year Project | NLP-based Candidate Screening System

![Python](https://img.shields.io/badge/Python-3.10-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Flask](https://img.shields.io/badge/Flask-2.0-green)
![spaCy](https://img.shields.io/badge/spaCy-NLP-orange)

## 📌 Problem Statement
Manual resume screening is time-consuming and biased. This system uses NLP 
to automatically rank candidates based on skills, experience, and job fit.

## ✨ Features
- 📄 PDF/DOCX resume upload with drag & drop
- 🧠 NLP-based skill extraction using spaCy
- 🤖 BERT semantic similarity scoring (HuggingFace)
- 📊 TF-IDF keyword matching
- ⚡ Bulk screening of all candidates
- 📈 Interactive charts and radar visualization
- 🎯 AI-generated candidate summary
- 🌙 Dark/Light mode toggle

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Material UI, Recharts |
| Backend | Python Flask, SQLAlchemy |
| NLP/AI | spaCy, HuggingFace BERT, scikit-learn |
| Database | SQLite |
| File Parsing | pdfplumber, python-docx |

## 🚀 How to Run

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📊 Scoring Algorithm
| Factor | Weight |
|--------|--------|
| Skill Match | 40% |
| Semantic Similarity (BERT) | 25% |
| TF-IDF Keywords | 20% |
| Experience | 15% |

## 👤 Author
[Tumhara Naam] | [College Name] | [Roll Number]