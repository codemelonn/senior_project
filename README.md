# 🧠 Bias Checker – Full-Stack Application (FastAPI + React + Docker)

## 📘 Overview
**Bias Checker** is a full-stack web application designed to analyze text for emotional tone, political bias, and toxicity.  
The system consists of:
- **Backend:** FastAPI server running multiple NLP models (`transformers`, `detoxify`, `BERT`)
- **Frontend:** React + Vite interface (Fusion Starter template)
- **Containerization:** Docker Compose for one-command setup and reproducibility

---

## 🐋 Running the Project with Docker Compose

This setup lets you run both backend and frontend without installing Python or Node.js manually.

### ✅ Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running  
- (Optional) [Git](https://git-scm.com/) to clone the repository

---

### 🪄 Quick Start

1. **Clone or download** the repository:
   ```bash
   git clone https://github.com/<your-username>/senior_project.git
   cd senior_project
   ```

2. **Run both containers** (builds automatically the first time):
   ```bash
   docker compose up --build
   ```

3. Wait until both services finish building. (may take up to 10 minutes)  
   When ready, you’ll see lines like:
   ```
   backend  | Uvicorn running on http://0.0.0.0:8000
   frontend | VITE v5.0  ready at http://localhost:8080
   ```

4. **Open the app:**
   - Frontend → http://localhost:8080  
   - Backend (API Docs) → http://localhost:8000/docs  

5. **Stop the containers:**
   ```bash
   docker compose down
   ```

---

## ⚙️ Service Details

| Service | Framework | Port | Description |
|----------|------------|------|-------------|
| `backend` | FastAPI (Uvicorn) | 8000 | NLP API for emotion, bias, and toxicity analysis |
| `frontend` | React + Vite | 8080 | User interface calling backend via REST API |

---

## 📂 Project Structure
```
senior_project/
├── backend/
│   ├── main.py                # FastAPI entry point
│   ├── run_analysis.py        # NLP analysis script
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Backend container build
│
├── frontend/
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   └── Dockerfile             # Frontend container build
│
└── docker-compose.yml         # Coordinates backend + frontend
```

---

## 🧩 Notes for Reviewers
- The first build may take **up to 15 minutes** (downloads large Hugging Face models and creates environment to run **without** a server).
- If you see  
  `env file ./backend/.env not found` — that’s fine; it’s optional and not required.
- Do **not** commit `__pycache__`, `node_modules`, or `.env` files.


---

## 👩‍💻 Contributors
- **Amara Barton** – Full-Stack Integration & Testing  
- **Pauline R.** – Frontend Interface Design  
- **Dominik T.** – Backend NLP Model Implementation  

---

## 📄 License
This project is for educational purposes under the **NMSU CS Senior Project** course.
