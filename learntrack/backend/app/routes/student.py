from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import supabase
from app.auth import require_student
from app.services.reward_engine import submit_quiz_attempt, get_active_streak
from app.services.helper_chat import answer_question

router = APIRouter(prefix="/student", tags=["student"])


class QuizSubmission(BaseModel):
    quiz_id: str
    answers: dict  # {question_id: chosen_option}


class HelperQuestion(BaseModel):
    question: str
    domain: str | None = None


from datetime import datetime, timezone

@router.post("/ask")
def ask_helper(payload: HelperQuestion, user=Depends(require_student)):
    # 1. Rate Limiting Check
    today = datetime.now(timezone.utc).date()
    
    # Get current rate limit status
    limit_resp = supabase.table("tutor_rate_limits").select("*").eq("student_id", user["id"]).execute()
    limit_data = limit_resp.data[0] if limit_resp.data else None
    
    if not limit_data:
        # Create record
        supabase.table("tutor_rate_limits").insert({
            "student_id": user["id"],
            "messages_count": 0,
            "last_reset_date": today.isoformat()
        }).execute()
        count = 0
    else:
        last_date = datetime.fromisoformat(limit_data["last_reset_date"]).date()
        if last_date < today:
            # Reset count for new day
            supabase.table("tutor_rate_limits").update({
                "messages_count": 0,
                "last_reset_date": today.isoformat()
            }).eq("student_id", user["id"]).execute()
            count = 0
        else:
            count = limit_data["messages_count"]
            
    max_daily = 10
    if count >= max_daily:
        raise HTTPException(status_code=429, detail="Daily limit reached for Study Guide. Try again tomorrow!")
        
    # 2. Get Answer
    answer = answer_question(user["class_id"], payload.question, payload.domain)
    
    # 3. Update count
    new_count = count + 1
    supabase.table("tutor_rate_limits").update({
        "messages_count": new_count
    }).eq("student_id", user["id"]).execute()
    
    # 4. Persist history
    supabase.table("tutor_chat_history").insert([
        {"student_id": user["id"], "role": "user", "content": payload.question},
        {"student_id": user["id"], "role": "assistant", "content": answer}
    ]).execute()
    
    return {"answer": answer, "remaining": max_daily - new_count}


@router.get("/chat-history")
def get_chat_history(user=Depends(require_student)):
    """Return chat history and remaining daily quota for the AI tutor."""
    today = datetime.now(timezone.utc).date()
    max_daily = 10

    # Get remaining quota
    limit_resp = supabase.table("tutor_rate_limits").select("*").eq("student_id", user["id"]).execute()
    limit_data = limit_resp.data[0] if limit_resp.data else None

    if not limit_data:
        remaining = max_daily
    else:
        last_date = datetime.fromisoformat(limit_data["last_reset_date"]).date()
        if last_date < today:
            remaining = max_daily
        else:
            remaining = max(0, max_daily - limit_data["messages_count"])

    # Get chat history
    rows = (
        supabase.table("tutor_chat_history")
        .select("role, content, created_at")
        .eq("student_id", user["id"])
        .order("created_at")
        .execute()
        .data
    )

    history = [{"role": r["role"], "text": r["content"]} for r in rows] if rows else []

    return {"history": history, "remaining": remaining}


@router.get("/ask/history")
def get_helper_history(user=Depends(require_student)):
    return supabase.table("tutor_chat_history").select("*").eq("student_id", user["id"]).order("created_at").execute().data


@router.get("/quizzes")
def get_available_quizzes(user=Depends(require_student)):
    return (
        supabase.table("quizzes")
        .select("*, questions!inner(id)")  # inner join: only quizzes with >=1 question
        .eq("class_id", user["class_id"])
        .execute()
        .data
    )


@router.get("/quiz/{quiz_id}/questions")
def get_quiz_questions(quiz_id: str, user=Depends(require_student)):
    # Only return questions for quizzes actually scoped to this student's class
    quiz = (
        supabase.table("quizzes")
        .select("*")
        .eq("id", quiz_id)
        .eq("class_id", user["class_id"])
        .single()
        .execute()
        .data
    )
    return (
        supabase.table("questions")
        .select("id, text, options")  # correct_answer intentionally excluded
        .eq("quiz_id", quiz["id"])
        .execute()
        .data
    )


@router.post("/quiz/submit")
def submit_quiz(payload: QuizSubmission, user=Depends(require_student)):
    try:
        return submit_quiz_attempt(user["id"], payload.quiz_id, payload.answers)
    except Exception as e:
        if "duplicate key" in str(e) or "23505" in str(e):
            raise HTTPException(status_code=409, detail="You've already submitted this quiz.")
        raise HTTPException(status_code=500, detail="Could not submit quiz. Please try again.")


@router.get("/dashboard")
def get_dashboard(user=Depends(require_student)):
    xp_rows = supabase.table("xp_ledger").select("xp_earned").eq("student_id", user["id"]).execute().data
    total_xp = sum(r["xp_earned"] for r in xp_rows)
    badges = (
        supabase.table("student_badges")
        .select("badge_id, badges(name)")
        .eq("student_id", user["id"])
        .execute()
        .data
    )
    return {
        "total_xp": total_xp,
        "streak": get_active_streak(user["id"]),
        "badges": badges,
    }


@router.get("/roadmap")
def get_roadmap(user=Depends(require_student)):
    quizzes = (
        supabase.table("quizzes")
        .select("id, topic, domain, created_at, questions!inner(id)")
        .eq("class_id", user["class_id"])
        .order("created_at")
        .execute()
        .data
    )
    attempts = (
        supabase.table("quiz_attempts")
        .select("quiz_id, score")
        .eq("student_id", user["id"])
        .execute()
        .data
    )
    done_ids = {a["quiz_id"]: a["score"] for a in attempts}

    path = []
    next_marked = False
    for q in quizzes:
        if q["id"] in done_ids:
            status = "completed"
        elif not next_marked:
            status = "current"
            next_marked = True
        else:
            status = "upcoming"
        path.append({
            "id": q["id"],
            "title": q["topic"],
            "domain": q["domain"],
            "status": status,
            "score": done_ids.get(q["id"]),
        })
    return path


@router.get("/activity")
def get_recent_activity(user=Depends(require_student)):
    return (
        supabase.table("quiz_attempts")
        .select("score, attempted_at, quizzes(topic, domain)")
        .eq("student_id", user["id"])
        .order("attempted_at", desc=True)
        .limit(5)
        .execute()
        .data
    )


@router.get("/leaderboard")
def get_leaderboard(user=Depends(require_student)):
    return (
        supabase.table("leaderboard")
        .select("*")
        .eq("class_id", user["class_id"])
        .order("total_xp", desc=True)
        .execute()
        .data
    )
