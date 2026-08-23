from fastapi import Depends, HTTPException, Header
from app.db import supabase


def get_current_user(authorization: str = Header(...)):
    """Expects header: Authorization: Bearer <supabase_jwt>"""
    token = authorization.replace("Bearer ", "")
    try:
        user_resp = supabase.auth.get_user(token)
        user = user_resp.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")

        profile = supabase.table("users").select("*").eq("id", user.id).single().execute()
        return profile.data
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")


def get_verified_auth_user(authorization: str = Header(...)):
    """Like get_current_user, but doesn't require a users profile row yet.
    Used only during signup, before a profile exists."""
    token = authorization.replace("Bearer ", "")
    try:
        user_resp = supabase.auth.get_user(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token check failed: {e}")
    user = user_resp.user
    if not user:
        raise HTTPException(status_code=401, detail="No user found for this token")
    return {"id": user.id, "email": user.email}


def require_student(user=Depends(get_current_user)):
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    return user


def require_teacher(user=Depends(get_current_user)):
    if user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")
    return user