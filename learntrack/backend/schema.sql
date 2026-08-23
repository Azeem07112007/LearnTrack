-- LearnTrack database schema
-- Run this in Supabase SQL editor before building anything else

-- ============ CORE ENTITIES ============

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  name text not null,
  teacher_id uuid  -- set after users table exists (fk added below)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('student', 'teacher')),
  name text not null,
  class_id uuid references classes(id),
  school_id uuid references schools(id),
  domain text,  -- e.g. 'Science', 'Mathematics' — student's subject track
  created_at timestamptz default now()
);

alter table classes add constraint fk_teacher foreign key (teacher_id) references users(id);

-- ============ CONTENT & QUIZZES ============

create table content (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid references users(id),
  class_id uuid references classes(id),
  domain text not null,
  title text not null,
  raw_text text,          -- OCR output
  due_date date,
  created_at timestamptz default now()
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references content(id),
  class_id uuid references classes(id),
  domain text not null,
  topic text,
  created_at timestamptz default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  text text not null,
  options jsonb not null,       -- ["A","B","C","D"]
  correct_answer text not null,
  difficulty text default 'medium'
);

-- ============ ATTEMPTS & SCORING ============

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references users(id),
  quiz_id uuid references quizzes(id),
  score int not null,
  attempted_at timestamptz default now(),
  unique (student_id, quiz_id)   -- best-attempt-only rule; app layer can allow retake by deleting+reinserting
);

-- ============ REWARDS ============

create table xp_ledger (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references users(id),
  xp_earned int not null,
  source text not null,   -- 'quiz' | 'streak' | 'badge'
  created_at timestamptz default now()
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unlock_rule jsonb not null   -- e.g. {"type": "streak", "value": 5}
);

create table student_badges (
  student_id uuid references users(id),
  badge_id uuid references badges(id),
  earned_at timestamptz default now(),
  primary key (student_id, badge_id)
);

-- ============ INDEXES ============

create index idx_quiz_attempts_student on quiz_attempts(student_id);
create index idx_quiz_attempts_quiz on quiz_attempts(quiz_id);
create index idx_xp_ledger_student on xp_ledger(student_id);
create index idx_users_class on users(class_id);
create index idx_quizzes_class_domain on quizzes(class_id, domain);
create index idx_content_class_domain on content(class_id, domain);

-- ============ LEADERBOARD (materialized view) ============

create materialized view leaderboard as
select
  u.id as student_id,
  u.name,
  u.class_id,
  coalesce(sum(x.xp_earned), 0) as total_xp
from users u
left join xp_ledger x on x.student_id = u.id
where u.role = 'student'
group by u.id, u.name, u.class_id
order by total_xp desc;

create unique index idx_leaderboard_student on leaderboard(student_id);

-- Refresh this on a schedule (cron / Supabase Edge Function), e.g. every 5 minutes:
-- refresh materialized view concurrently leaderboard;

-- ============ ROW LEVEL SECURITY ============

alter table quiz_attempts enable row level security;
alter table xp_ledger enable row level security;
alter table quizzes enable row level security;

create policy "students see own attempts" on quiz_attempts
  for select using (auth.uid() = student_id);

create policy "students see own xp" on xp_ledger
  for select using (auth.uid() = student_id);

create policy "students see own class quizzes" on quizzes
  for select using (
    class_id in (select class_id from users where id = auth.uid())
  );
