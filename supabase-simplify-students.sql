-- Simplify student/course progress model
-- Run this in Supabase SQL Editor.
--
-- This version avoids DO $$ blocks so the Supabase dashboard cannot inject
-- helper SQL inside a dollar-quoted block.

BEGIN;

-- 1) Store course/progress directly on students.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS certificate_id TEXT,
  ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS certificate_template TEXT;

CREATE INDEX IF NOT EXISTS idx_students_course_id ON public.students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_completed ON public.students(completed);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_certificate_id
  ON public.students(certificate_id)
  WHERE certificate_id IS NOT NULL;

-- 2) Let applications become "converted" after they are turned into students.
-- Your original setup created this inline check as applications_status_check.
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'converted'));

-- 3) Backfill course from applications where the student's email matches.
UPDATE public.students s
SET course_id = a.course_id
FROM (
  SELECT DISTINCT ON (email) email, course_id
  FROM public.applications
  WHERE course_id IS NOT NULL
  ORDER BY email, created_at DESC
) a
WHERE s.email = a.email
  AND s.course_id IS NULL;

-- 4) Backfill course/completion data from the old enrollments table.
-- In your original setup, unquoted studentId/courseId/completionDate became
-- lowercase studentid/courseid/completiondate in Postgres.
UPDATE public.students s
SET
  course_id = COALESCE(s.course_id, e.courseid),
  completed = COALESCE(e.completed, s.completed, false),
  completion_date = COALESCE(s.completion_date, e.completiondate)
FROM (
  SELECT DISTINCT ON (studentid)
    studentid,
    courseid,
    completed,
    completiondate,
    created_at
  FROM public.enrollments
  ORDER BY studentid, created_at DESC
) e
WHERE s.id = e.studentid;

-- 5) Mark applications as converted when a matching student already exists.
UPDATE public.applications a
SET status = 'converted',
    updated_at = NOW()
WHERE status IN ('pending', 'approved')
  AND EXISTS (
    SELECT 1
    FROM public.students s
    WHERE s.email = a.email
  );

COMMIT;

-- Optional later, only after confirming the new admin page works:
-- DROP TABLE public.enrollments;
