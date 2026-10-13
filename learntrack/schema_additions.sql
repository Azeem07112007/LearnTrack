-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_url TEXT,
    content TEXT,
    grade INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- Storage bucket for assignments (requires postgres extension/config, assuming Supabase default)
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true) ON CONFLICT DO NOTHING;
-- Policy for assignments bucket
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'assignments');

-- Study Guide / Tutor Chat History
CREATE TABLE IF NOT EXISTS public.tutor_chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutor Rate Limits (Daily limit tracking)
CREATE TABLE IF NOT EXISTS public.tutor_rate_limits (
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    messages_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE
);
