from datetime import date, timedelta
from app.db import supabase


def compute_score(answers: dict, questions: list) -> int:
    """answers: {question_id: chosen_option}. Returns count of correct answers."""
    correct_map = {q["id"]: q["correct_answer"] for q in questions}
    score = sum(1 for qid, ans in answers.items() if correct_map.get(qid) == ans)
    return score


def get_active_streak(student_id: str) -> int:
    attempts = (
        supabase.table("quiz_attempts")
        .select("attempted_at")
        .eq("student_id", student_id)
        .order("attempted_at", desc=True)
        .execute()
    )
    dates = sorted({row["attempted_at"][:10] for row in attempts.data}, reverse=True)
    if not dates:
        return 0
    streak = 1
    cursor = date.fromisoformat(dates[0])
    for d in dates[1:]:
        d_date = date.fromisoformat(d)
        if cursor - d_date == timedelta(days=1):
            streak += 1
            cursor = d_date
        else:
            break
    return streak


def check_and_award_badges(student_id: str):
    """Awards any newly-unlocked badges and returns them, so callers can
    show a 'badge unlocked' moment instead of the award happening silently."""
    streak = get_active_streak(student_id)
    badges = supabase.table("badges").select("*").execute().data
    already_earned = {
        b["badge_id"]
        for b in supabase.table("student_badges").select("badge_id").eq("student_id", student_id).execute().data
    }

    newly_unlocked = []
    for badge in badges:
        if badge["id"] in already_earned:
            continue
        rule = badge["unlock_rule"]
        unlocked = False

        if rule.get("type") == "streak" and streak >= rule.get("value", 0):
            unlocked = True
        elif rule.get("type") == "first_quiz":
            count = (
                supabase.table("quiz_attempts")
                .select("id", count="exact")
                .eq("student_id", student_id)
                .execute()
            )
            unlocked = (count.count or 0) >= 1

        if unlocked:
            supabase.table("student_badges").insert(
                {"student_id": student_id, "badge_id": badge["id"]}
            ).execute()
            newly_unlocked.append({"id": badge["id"], "name": badge["name"]})

    return newly_unlocked


def submit_quiz_attempt(student_id: str, quiz_id: str, answers: dict):
    """Core reward-engine flow. The attempt + XP write happen together in one
    Postgres transaction (submit_quiz_transaction) so a failure partway through
    can never leave a recorded attempt with no XP, or vice versa."""

    questions = supabase.table("questions").select("*").eq("quiz_id", quiz_id).execute().data
    score = compute_score(answers, questions)

    base_xp = score * 10
    streak = get_active_streak(student_id)
    streak_bonus = 5 if streak > 0 else 0
    xp_total = base_xp + streak_bonus

    supabase.rpc(
        "submit_quiz_transaction",
        {
            "p_student_id": student_id,
            "p_quiz_id": quiz_id,
            "p_score": score,
            "p_xp_earned": xp_total,
        },
    ).execute()

    # Badge-awarding runs after the transaction commits — it reads the attempt
    # that was just written, but isn't itself critical to core data integrity,
    # so it stays a best-effort step outside the transaction.
    new_badges = check_and_award_badges(student_id)

    return {"score": score, "xp_earned": xp_total, "new_badges": new_badges}
