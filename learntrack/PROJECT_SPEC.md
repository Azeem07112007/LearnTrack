# LearnTrack — Project Spec

Gamified learning platform for rural education. SIH25048 (Govt. of Odisha, Smart Education theme). Solo project.

## Tech stack
- Frontend: React (Vite) + Tailwind + Framer Motion + Recharts
- Backend: FastAPI (Python)
- Database: Supabase (Postgres) — see backend/schema.sql
- LLM (quiz generation): Groq — llama-3.3-70b-versatile
- LLM (helper chat): Gemini 2.5 Flash
- OCR: PaddleOCR (local, free)
- Vector store (RAG helper chat, stretch goal): ChromaDB + sentence-transformers

## Core loop
Teacher uploads curriculum PDF -> OCR extracts text -> chunked -> Groq generates
quiz questions per chunk -> stored in DB -> student sees quizzes scoped to their
class_id + domain -> student submits answers -> backend scores server-side ->
XP written to xp_ledger -> badge rules checked -> leaderboard (materialized view)
reflects new total on next refresh -> teacher dashboard aggregates class progress.

## Key design decisions (don't relitigate these)
- XP is an append-only ledger (xp_ledger), never a single editable column.
- Leaderboard is a materialized view, refreshed on a schedule, not computed live.
- quiz_attempts has UNIQUE(student_id, quiz_id) — best attempt only, prevents farming.
- Visibility (which quizzes a student sees) is enforced by class_id + domain match,
  both at the API layer (FastAPI query filter) and DB layer (Supabase RLS).
- Reward writes (attempt + XP + badge check) should be atomic — current Python
  version in reward_engine.py is NOT yet wrapped in a real transaction; move this
  logic into a Postgres function (supabase.rpc) before relying on it under load.

## Build priority (MVP first, in this order)
1. Auth + roles (student/teacher) via Supabase Auth
2. Teacher upload -> OCR -> quiz generation -> stored questions
3. Student: view quizzes, submit, get scored, see XP update
4. Badges + streak + leaderboard
5. Teacher class dashboard
6. Animations (Framer Motion: XP fill, badge pop, level-up)
7. Stretch: RAG helper chat (ChromaDB), offline caching, regional language toggle

## Folder layout
```
learntrack/
  backend/
    schema.sql            <- run in Supabase SQL editor first
    requirements.txt
    .env.example           <- copy to .env, fill in keys
    app/
      main.py               <- FastAPI entrypoint
      db.py                 <- Supabase client
      auth.py                <- role-based auth dependencies
      routes/
        student.py
        teacher.py
      services/
        reward_engine.py     <- XP/badge/streak logic
        content_pipeline.py  <- OCR + quiz generation
  frontend/
    package.json
    src/
      supabaseClient.js
      pages/
        StudentDashboard.jsx
```

## Not yet built (next steps)
- Frontend: Quiz player, teacher upload form, teacher dashboard, login pages, routing
- Backend: RAG helper chat endpoint, weak-topic classification model, badge seed data
- Deployment config (Vercel for frontend, Render/Railway for backend)
