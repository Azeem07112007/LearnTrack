import shutil
import tempfile
from fastapi import APIRouter, Depends, UploadFile, Form, HTTPException
from pydantic import BaseModel
from app.db import supabase
from app.auth import require_teacher
from app.services.content_pipeline import generate_quiz_from_file

router = APIRouter(prefix="/teacher", tags=["teacher"])


class CreateClassRequest(BaseModel):
    name: str


@router.get("/stats")
def teacher_stats(user=Depends(require_teacher)):
    classes = supabase.table("classes").select("id, name, school_id").execute().data
    seen = set()
    unique_classes = []
    for c in classes:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique_classes.append(c)

    students = supabase.table("users").select("id").eq("role", "student").execute().data
    class_ids = [c["id"] for c in classes]
    quizzes = (
        supabase.table("quizzes").select("id").in_("class_id", class_ids).execute().data
        if class_ids else []
    )
    return {
        "total_classes": len(unique_classes),
        "total_students": len(students),
        "total_quests": len(quizzes),
    }


@router.get("/classes")
def list_classes(user=Depends(require_teacher)):
    classes = (
        supabase.table("classes")
        .select("id, name, school_id")
        .order("name")
        .execute()
        .data
    )
    school_id = user.get("school_id")
    if school_id:
        classes.sort(key=lambda c: (0 if c.get("school_id") == school_id else 1, c["name"]))

    seen = set()
    unique_classes = []
    for c in classes:
        if c["name"] not in seen:
            seen.add(c["name"])
            unique_classes.append(c)

    # Sort naturally (e.g. 9-A, 9-B, 10-A, ...)
    try:
        unique_classes.sort(key=lambda c: (int(c["name"].split("-")[0]) if "-" in c["name"] and c["name"].split("-")[0].isdigit() else 999, c["name"]))
    except Exception:
        unique_classes.sort(key=lambda c: c["name"])

    return unique_classes


@router.post("/classes")
def create_class(payload: CreateClassRequest, user=Depends(require_teacher)):
    school_id = user.get("school_id")
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Class name is required")

    existing = (
        supabase.table("classes")
        .select("id, name, school_id")
        .eq("name", name)
        .execute()
        .data
    )
    if existing:
        return existing[0]

    insert_data = {"name": name}
    if school_id:
        insert_data["school_id"] = school_id

    res = (
        supabase.table("classes")
        .insert(insert_data)
        .execute()
        .data
    )
    if not res:
        raise HTTPException(status_code=500, detail="Failed to create class")
    return res[0]


@router.get("/leaderboard/{class_id}")
def class_leaderboard(class_id: str, user=Depends(require_teacher)):
    cls = supabase.table("classes").select("id").eq("id", class_id).execute().data
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
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
