from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.db import supabase
from app.auth import require_student, require_teacher

router = APIRouter(prefix="/assignments", tags=["assignments"])

class AssignmentCreate(BaseModel):
    class_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class AssignmentSubmissionUpdate(BaseModel):
    file_url: Optional[str] = None
    content: Optional[str] = None

class GradeSubmission(BaseModel):
    grade: int
    feedback: Optional[str] = None

# --- TEACHER ENDPOINTS ---

@router.post("/")
def create_assignment(payload: AssignmentCreate, user=Depends(require_teacher)):
    # Verify the class belongs to the teacher's school
    cls = supabase.table("classes").select("id").eq("id", payload.class_id).eq("school_id", user["school_id"]).execute().data
    if not cls:
        raise HTTPException(status_code=403, detail="Not authorized for this class")
    
    data = {
        "class_id": payload.class_id,
        "title": payload.title,
        "description": payload.description,
        "due_date": payload.due_date.isoformat() if payload.due_date else None
    }
    result = supabase.table("assignments").insert(data).execute()
    return result.data[0]

@router.get("/teacher")
def get_teacher_assignments(user=Depends(require_teacher)):
    # Get all classes for this teacher's school
    classes = supabase.table("classes").select("id").eq("school_id", user["school_id"]).execute().data
    class_ids = [c["id"] for c in classes]
    
    if not class_ids:
        return []
        
    return supabase.table("assignments").select("*, class:classes(name)").in_("class_id", class_ids).order("created_at", desc=True).execute().data

@router.get("/{assignment_id}/submissions")
def get_submissions(assignment_id: str, user=Depends(require_teacher)):
    return supabase.table("assignment_submissions").select("*, student:users(id, name, avatar)").eq("assignment_id", assignment_id).execute().data

@router.patch("/submissions/{submission_id}/grade")
def grade_submission(submission_id: str, payload: GradeSubmission, user=Depends(require_teacher)):
    data = {
        "grade": payload.grade,
        "feedback": payload.feedback
    }
    result = supabase.table("assignment_submissions").update(data).eq("id", submission_id).execute()
    return result.data[0]

# --- STUDENT ENDPOINTS ---

@router.get("/student")
def get_student_assignments(user=Depends(require_student)):
    return supabase.table("assignments").select("*").eq("class_id", user["class_id"]).order("created_at", desc=True).execute().data

@router.get("/student/submissions")
def get_student_submissions(user=Depends(require_student)):
    return supabase.table("assignment_submissions").select("*").eq("student_id", user["id"]).execute().data

@router.post("/{assignment_id}/submit")
def submit_assignment(assignment_id: str, payload: AssignmentSubmissionUpdate, user=Depends(require_student)):
    data = {
        "assignment_id": assignment_id,
        "student_id": user["id"],
        "file_url": payload.file_url,
        "content": payload.content
    }
    # Upsert the submission
    result = supabase.table("assignment_submissions").upsert(data, on_conflict="assignment_id, student_id").execute()
    return result.data[0]
