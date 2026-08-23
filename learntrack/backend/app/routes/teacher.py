import shutil
import tempfile
from fastapi import APIRouter, Depends, UploadFile, Form, HTTPException
from app.db import supabase
from app.auth import require_teacher
from app.services.content_pipeline import generate_quiz_from_file

router = APIRouter(prefix="/teacher", tags=["teacher"])


@router.get("/stats")
def teacher_stats(user=Depends(require_teacher)):
    classes = supabase.table("classes").select("id").eq("school_id", user["school_id"]).execute().data
    class_ids = [c["id"] for c in classes]

    students = (
        supabase.table("users").select("id").eq("school_id", user["school_id"]).eq("role", "student").execute().data
        if class_ids else []
    )
    quizzes = (
        supabase.table("quizzes").select("id").in_("class_id", class_ids).execute().data
        if class_ids else []
    )
    return {
        "total_classes": len(class_ids),
        "total_students": len(students),
        "total_quests": len(quizzes),
    }


@router.get("/classes")
def list_classes(user=Depends(require_teacher)):
    return (
        supabase.table("classes")
        .select("id, name")
        .eq("school_id", user["school_id"])
        .execute()
        .data
    )


@router.get("/leaderboard/{class_id}")
def class_leaderboard(class_id: str, user=Depends(require_teacher)):
    # Make sure this class actually belongs to the teacher's school before showing it
    cls = supabase.table("classes").select("id").eq("id", class_id).eq("school_id", user["school_id"]).execute().data
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found in your school")
    return (
        supabase.table("leaderboard")
        .select("*")
        .eq("class_id", class_id)
        .order("total_xp", desc=True)
        .execute()
        .data
    )


@router.post("/upload")
def upload_content(
    file: UploadFile,
    domain: str = Form(...),
    class_id: str = Form(...),
    title: str = Form(...),
    due_date: str | None = Form(None),
    user=Depends(require_teacher),
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    # Generate first — don't touch the DB until we know this actually produced questions
    questions = generate_quiz_from_file(tmp_path)
    if not questions:
        raise HTTPException(status_code=422, detail="Could not generate any questions from this file. Check the file has readable text and try again.")

    content = (
        supabase.table("content")
        .insert(
            {
                "uploaded_by": user["id"],
                "class_id": class_id,
                "domain": domain,
                "title": title,
                "due_date": due_date,
            }
        )
        .execute()
        .data[0]
    )

    quiz = (
        supabase.table("quizzes")
        .insert({"content_id": content["id"], "class_id": class_id, "domain": domain, "topic": title})
        .execute()
        .data[0]
    )

    for q in questions:
        supabase.table("questions").insert(
            {
                "quiz_id": quiz["id"],
                "text": q["question"],
                "options": q["options"],
                "correct_answer": q["correct_answer"],
                "difficulty": q.get("difficulty", "medium"),
            }
        ).execute()

    return {"content_id": content["id"], "quiz_id": quiz["id"], "questions_generated": len(questions)}


@router.get("/class/{class_id}/dashboard")
def class_dashboard(class_id: str, user=Depends(require_teacher)):
    students = supabase.table("users").select("*").eq("class_id", class_id).eq("role", "student").execute().data
    leaderboard = (
        supabase.table("leaderboard").select("*").eq("class_id", class_id).order("total_xp", desc=True).execute().data
    )
    return {"student_count": len(students), "leaderboard": leaderboard}


@router.get("/student/{student_id}/history")
def student_history(student_id: str, user=Depends(require_teacher)):
    return supabase.table("quiz_attempts").select("*").eq("student_id", student_id).execute().data
