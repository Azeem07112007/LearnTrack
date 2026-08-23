# LearnTrack

## 📚 Overview
LearnTrack is a modern **full‑stack learning management platform** built with **FastAPI** for the backend and **React (Vite)** for the frontend. It lets students, teachers, and administrators create, take, and review quizzes while tracking progress in real time.

---

## ✨ Key Features
- **User authentication** via Supabase
- **Dynamic quiz engine** with real‑time scoring
- **Role‑based access** for students, teachers and admins
- **REST API** powered by FastAPI
- **Responsive UI** built with React, Tailwind CSS and Vite
- **Docker‑ready** (optional) for easy deployment

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | Python 3.12, FastAPI, Pydantic, Supabase client |
| Frontend | React, Vite, TailwindCSS, Supabase JS SDK |
| Database | Supabase (PostgreSQL) |
| CI/CD | GitHub Actions (push protection already configured) |

---

## 🚀 Getting Started
### Prerequisites
- Python **3.12+**
- Node **20+** (for the frontend)
- **pnpm** or **npm**
- A Supabase project (free tier works)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Azeem07112007/LearnTrack.git
cd LearnTrack
```

### 2️⃣ Backend Setup
```bash
# Create a virtual environment
python -m venv .venv
source .venv/bin/activate   # on Windows: .\.venv\Scripts\activate

# Install dependencies
pip install -r learntrack/backend/requirements.txt
```
#### Environment Variables
Create a **`.env`** file inside `learntrack/backend/` (already ignored by Git) with the following keys:
```
SUPABASE_URL=<your‑supabase‑url>
SUPABASE_SERVICE_ROLE_KEY=<your‑service‑role‑key>
GROQ_API_KEY=<your‑groq‑apikey>
GEMINI_API_KEY=<your‑gemini‑apikey>
```
> **⚠️ Do not commit this file** – it contains secrets.

### 3️⃣ Run the Backend
```bash
uvicorn learntrack.backend.app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

### 4️⃣ Frontend Setup
```bash
cd learntrack/frontend
npm install   # or pnpm install
```
Create a **`.env`** (or edit the existing) with the Supabase public keys:
```
VITE_SUPABASE_URL=<your‑supabase‑url>
VITE_SUPABASE_ANON_KEY=<your‑anon‑key>
VITE_API_BASE=http://127.0.0.1:8000
```

### 5️⃣ Run the Frontend
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker (optional)
A simple Docker Compose file can be added later to orchestrate the backend, frontend, and a local Supabase emulator.

---

## 📄 License
This project is licensed under the **MIT License**.

---

## 🙏 Contributing
Contributions are welcome! Please open an issue or a pull request. Follow the conventional commit style for clarity.