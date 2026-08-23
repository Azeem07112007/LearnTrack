from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import supabase
from app.auth import get_verified_auth_user

router = APIRouter(prefix="/auth", tags=["auth"])


def domain_from_email(email: str) -> str:
    return email.split("@")[-1].lower()


@router.get("/school-check")
def school_check(user=Depends(get_verified_auth_user)):
    """Frontend calls this right after signup to see if the school already exists."""
    domain = domain_from_email(user["email"])
    existing = supabase.table("schools").select("id, name").eq("email_domain", domain).execute().data
    return {"domain": domain, "school": existing[0] if existing else None}


class TeacherSignup(BaseModel):
    name: str
    school_name: str | None = None  # only needed if the school doesn't exist yet


@router.post("/signup/teacher")
def signup_teacher(body: TeacherSignup, user=Depends(get_verified_auth_user)):
    domain = domain_from_email(user["email"])
    existing = supabase.table("schools").select("id").eq("email_domain", domain).execute().data

    if existing:
        school_id = existing[0]["id"]
    else:
        if not body.school_name:
            raise HTTPException(status_code=422, detail="This school isn't registered yet — provide a school name to create it.")
        school = supabase.table("schools").insert({"name": body.school_name, "email_domain": domain}).execute().data[0]
        school_id = school["id"]

    profile = supabase.table("users").insert({
        "id": user["id"], "role": "teacher", "name": body.name, "school_id": school_id,
    }).execute().data[0]
    return profile


class StudentSignup(BaseModel):
    name: str
    class_id: str
    domains: list[str]


@router.post("/signup/student")
def signup_student(body: StudentSignup, user=Depends(get_verified_auth_user)):
    domain = domain_from_email(user["email"])
    existing = supabase.table("schools").select("id").eq("email_domain", domain).execute().data
    if not existing:
        raise HTTPException(status_code=422, detail="No school is registered for this email domain yet. Ask a teacher to sign up first.")
    school_id = existing[0]["id"]

    # sanity check: the chosen class actually belongs to this school
    cls = supabase.table("classes").select("id").eq("id", body.class_id).eq("school_id", school_id).execute().data
    if not cls:
        raise HTTPException(status_code=422, detail="That class doesn't belong to your school.")

    profile = supabase.table("users").insert({
        "id": user["id"], "role": "student", "name": body.name, "school_id": school_id, "class_id": body.class_id,
    }).execute().data[0]

    if body.domains:
        supabase.table("student_domains").insert(
            [{"student_id": user["id"], "domain": d} for d in body.domains]
        ).execute()

    return profile


@router.get("/classes-for-signup")
def classes_for_signup(user=Depends(get_verified_auth_user)):
    """Lets a student pick their class during signup, scoped to their school."""
    domain = domain_from_email(user["email"])
    existing = supabase.table("schools").select("id").eq("email_domain", domain).execute().data
    if not existing:
        return []
    return supabase.table("classes").select("id, name").eq("school_id", existing[0]["id"]).execute().data
