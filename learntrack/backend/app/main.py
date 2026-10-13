from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.routes import student, teacher, auth as auth_routes, assignments
from app.auth import get_current_user
from app.db import supabase

app = FastAPI(title="LearnTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend URL before deploying
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student.router)
app.include_router(teacher.router)
app.include_router(auth_routes.router)
app.include_router(assignments.router)


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.get("/me")
def get_me(user=Depends(get_current_user)):
    return user


class AvatarUpdate(BaseModel):
    avatar: str


@app.patch("/me/avatar")
def update_avatar(body: AvatarUpdate, user=Depends(get_current_user)):
    updated = supabase.table("users").update({"avatar": body.avatar}).eq("id", user["id"]).execute()
    return updated.data[0]
