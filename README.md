<div align="center">

# ResumeAI

**An intelligent, full-stack resume parsing and evaluation platform powered by LLMs.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)

</div>

---

## 📋 Overview

ResumeAI is an end-to-end platform that uses **Google Gemini** and **LangChain** to extract structured data from resumes, score them against job descriptions using a multi-factor ATS engine, and enable semantic candidate search through vector embeddings. It features a modern React frontend with dark mode support, an admin analytics dashboard, and a developer portal with webhook and API key management.

---

## ✨ Features

### 🧠 AI-Powered Resume Parsing
- Upload resumes in **PDF**, **DOCX**, or **TXT** format
- Automatic **section classification** using heuristic rules + LLM fallback (Experience, Projects, Education, Skills, Personal)
- Structured data extraction via **Google Gemini 2.5 Flash** with **Groq LLaMA 3.1** as fallback
- Extracts: full name, email, role, skills, experience, projects, and education
- Layout-aware PDF parsing preserving column structures and tables

### 📊 ATS (Applicant Tracking System) Scoring
- **4-factor weighted scoring algorithm**:
  - **Skill Match** (40%) — keyword intersection between resume and job description
  - **Semantic Match** (30%) — token-level Jaccard similarity
  - **Experience Alignment** (20%) — years of experience vs. seniority requirements
  - **Formatting Score** (10%) — file format quality assessment
- LLM-generated reasoning explaining the score, missing skills, and pass probability
- AI-powered **Job Description analysis** extracting required/preferred skills, seniority, and keywords

### 🔍 Smart Candidate Search
- **Semantic search** using Google's `gemini-embedding-001` model
- **ChromaDB** vector store for fast similarity queries
- Filter candidates by skills with SQL-level filtering
- Deduplication of results by candidate
- Returns match scores, roles, and skill lists

### 🔔 Webhook System
- Subscribe to events: `resume.parsed`, `resume.failed`, `ats.score.generated`
- **HMAC SHA-256 signed payloads** for secure delivery
- **Celery-based async dispatch** with automatic retries (up to 5 attempts with exponential backoff)
- Full delivery logging with status tracking and response capture

### 🔑 API Key Management
- Generate secure API keys (`sk_live_` prefix) with SHA-256 hashing
- API key authentication via `X-API-Key` header
- **Rate limiting** (5 requests/minute) on key generation endpoints

### 📈 Analytics Dashboard
- Total resumes parsed with success/failure rates
- Average processing time tracking
- **Top 10 skills** frequency analysis
- 7-day parsing activity timeline
- Historical resume listing with detected roles

### 🌙 Modern Frontend
- **React 19** with **Vite** for fast development
- **TailwindCSS** styling with **dark mode** support (persisted in localStorage)
- **Recharts** for data visualization in the admin dashboard
- Client-side routing with **React Router v7**
- Pages: Home, Admin Dashboard, Developer Portal

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│          React 19 · Vite · TailwindCSS · Recharts           │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│                     FastAPI Backend                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Resume   │  │   ATS    │  │  Search  │  │  Webhooks  │  │
│  │ Extract   │  │ Scoring  │  │ Endpoint │  │  & Auth    │  │
│  └─────┬─────┘  └─────┬────┘  └────┬─────┘  └─────┬──────┘  │
│        │              │            │               │         │
│  ┌─────▼──────────────▼────────────▼───────────────▼──────┐  │
│  │              Parsing Pipeline                          │  │
│  │   Parser → Classifier → LLM Chain → JD Extractor      │  │
│  └─────────────────────┬──────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌─────▼─────┐   ┌─────▼─────┐
    │ Postgres │    │  ChromaDB  │   │   Redis   │
    │   (DB)   │    │ (Vectors)  │   │  (Broker) │
    └──────────┘    └───────────┘   └─────┬─────┘
                                          │
                                    ┌─────▼─────┐
                                    │   Celery   │
                                    │  (Worker)  │
                                    └───────────┘
```

---

## 🛠️ Tech Stack

| Layer        | Technology                                                |
|--------------|-----------------------------------------------------------|
| **Frontend** | React 19, Vite, TailwindCSS, Recharts, React Router v7   |
| **Backend**  | FastAPI, Python 3.12, Uvicorn                             |
| **AI/LLM**   | LangChain, Google Gemini 2.5 Flash, Groq LLaMA 3.1       |
| **Embeddings** | Google Generative AI Embeddings (`gemini-embedding-001`)|
| **Vector DB** | ChromaDB (persistent storage)                            |
| **Database** | PostgreSQL 15, SQLAlchemy ORM                             |
| **Task Queue** | Celery with Redis broker                                |
| **Auth**     | API Key (SHA-256 hashed), HMAC webhook signatures         |
| **DevOps**   | Docker, Docker Compose                                    |

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v18+) for frontend development
- A **Google API Key** with access to Gemini models
- *(Optional)* A **Groq API Key** for LLM fallback

### 1. Clone the Repository

```bash
git clone https://github.com/Yash-raj-singh2804/AI_Resume_parser.git
cd AI_Resume_parser
```

### 2. Configure Environment Variables

Create a `backend/.env` file:

```env
GOOGLE_API_KEY=your_google_api_key_here
GROQ_API_KEY=your_groq_api_key_here          # Optional fallback

DATABASE_URL=postgresql+psycopg2://postgres:mysecretpassword@postgres:5432/mydatabase
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=*
```

Create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8080
```

### 3. Start the Backend (Docker)

```bash
cd backend
docker compose up --build
```

This spins up four services:
- **FastAPI** app on `http://localhost:8080`
- **Celery** worker for async webhook delivery
- **PostgreSQL 15** database
- **Redis 7** message broker

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 📡 API Reference

### Resume Extraction

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/extract` | Upload and parse a resume (PDF/DOCX/TXT). Returns structured JSON with name, email, role, skills, experience, projects, and education. |

### ATS Scoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ats/evaluate` | Evaluate a parsed resume against a job description. Returns ATS score, missing skills, and LLM-generated reasoning. |

### Candidate Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/search/candidates` | Semantic search across all parsed resumes. Supports skill filtering and result limiting. |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/analytics` | Dashboard metrics: totals, success rates, top skills, and 7-day timeline. |
| `GET`  | `/resumes` | List all successfully parsed resumes. |

### API Keys

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/keys` | Generate a new API key (rate-limited: 5/min). |

### Webhooks

| Method   | Endpoint | Description |
|----------|----------|-------------|
| `POST`   | `/webhooks/` | Create a webhook subscription (requires API key). |
| `GET`    | `/webhooks/` | List your webhook subscriptions. |
| `DELETE` | `/webhooks/{id}` | Delete a webhook subscription. |

**Supported Webhook Events:**
- `resume.parsed` — Fired when a resume is successfully parsed
- `resume.failed` — Fired when resume parsing fails
- `ats.score.generated` — Fired when an ATS score is calculated

---

## 📁 Project Structure

```
AI_Resume_parser/
├── LICENSE
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── main.py                   # FastAPI app entry point
│   ├── database.py               # SQLAlchemy engine & session
│   ├── models.py                 # ORM models (Candidate, Resume, Skill, etc.)
│   ├── schemas.py                # Pydantic schemas
│   ├── celery_app.py             # Celery configuration
│   ├── tasks.py                  # Async webhook dispatch tasks
│   ├── webhook_utils.py          # HMAC signature & payload formatting
│   │
│   ├── parsing_pipeline/         # Core AI parsing engine
│   │   ├── parser.py             # PDF/DOCX/TXT text extraction
│   │   ├── classifier.py         # Section classification (heuristic + LLM)
│   │   ├── llm_chain.py          # LangChain structured extraction
│   │   └── jd_extractor.py       # Job description analysis
│   │
│   ├── smart_student_search/     # Vector search module
│   │   ├── embedder.py           # Google Generative AI embeddings
│   │   └── vector_stores.py      # ChromaDB operations
│   │
│   └── routes/                   # API route handlers
│       ├── resume_extraction.py  # /extract endpoint
│       ├── ats.py                # /ats/evaluate endpoint
│       ├── search.py             # /search/candidates endpoint
│       ├── analytics.py          # /analytics & /resumes endpoints
│       ├── auth_api.py           # /api/keys endpoint
│       └── webhooks.py           # /webhooks CRUD endpoints
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx              # React entry point
        ├── App.jsx               # Routing & theme management
        │
        └── components/
            ├── Navbar.jsx            # Navigation with dark mode toggle
            ├── Hero.jsx              # Landing section with upload CTA
            ├── FileUpload.jsx        # Resume file upload component
            ├── ResultDisplay.jsx     # Parsed resume results viewer
            ├── AtsSimulator.jsx      # ATS score evaluation UI
            ├── CandidateSearch.jsx   # Semantic search interface
            ├── AdminDashboard.jsx    # Analytics charts & metrics
            ├── DeveloperPortal.jsx   # API keys & webhook management
            ├── Features.jsx          # Feature highlights section
            ├── HowItWorks.jsx        # Process explanation section
            └── Footer.jsx            # Site footer
```

---

## 🗄️ Database Schema

| Model | Description |
|-------|-------------|
| `Candidate` | Stores candidate profiles (name, email, phone) linked to resumes and skills |
| `Resume` | Parsed resume data stored as JSONB, linked to a candidate |
| `Skill` | Normalized skill names |
| `CandidateSkill` | Many-to-many link with confidence scores and years of experience |
| `ParsingLog` | Tracks every parsing attempt with timing, status, and detected data |
| `JobDescription` | Parsed JD data (role, skills, seniority) |
| `User` | Application users for API key ownership |
| `APIKey` | Hashed API keys with activation status |
| `WebhookSubscription` | Webhook endpoint registrations with event type filtering |
| `WebhookDelivery` | Delivery audit log with response tracking |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built by [Yash](https://github.com/Yash-raj-singh2804)**

</div>
