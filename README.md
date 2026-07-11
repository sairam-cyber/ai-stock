# 🚀 AI Stock Platform

An AI-powered stock analysis and prediction platform built with **Next.js 15**, **Express.js**, **FastAPI**, and cutting-edge machine learning models.

---

## 📦 Architecture

```
ai-stock/
├── frontend/       → Next.js 15 + Tailwind + ShadCN UI
├── backend/        → Express.js + MongoDB + Redis + Socket.IO
├── ml-service/     → FastAPI + TensorFlow + LangChain
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 🛠️ Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Frontend    | Next.js 15, React 19, TypeScript, Tailwind CSS, ShadCN UI |
| Backend     | Express.js, MongoDB, Redis, BullMQ, Socket.IO       |
| ML Service  | FastAPI, TensorFlow, XGBoost, Prophet, LangChain    |
| Infra       | Docker, GitHub Actions CI/CD                        |

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB 7+
- Redis 7+
- Docker & Docker Compose (optional)

### 1. Clone & Setup

```bash
git clone <repo-url> ai-stock
cd ai-stock
cp .env.example .env
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 3. Backend

```bash
cd backend
npm install
npm run dev
# → http://localhost:5000
```

### 4. ML Service

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
```

### 5. Docker (All Services)

```bash
docker compose up --build
```

## 📁 Environment Variables

Copy `.env.example` to `.env` and update values:

| Variable              | Description                  |
| --------------------- | ---------------------------- |
| `MONGODB_URI`         | MongoDB connection string    |
| `REDIS_HOST`          | Redis host                   |
| `JWT_SECRET`          | JWT signing secret           |
| `GOOGLE_AI_API_KEY`   | Google Generative AI API key |

## 📜 License

MIT
