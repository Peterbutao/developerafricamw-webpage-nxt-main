-- Supabase Storage Setup for Certificates
-- Run this in Supabase SQL Editor to set up certificate storage

-- ============================================================================
-- STEP 1: Add certificate_url column to students table
-- ============================================================================
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS certificate_url TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_certificate_url ON public.students(certificate_url);

-- ============================================================================
-- STEP 2: Create storage bucket (via Dashboard or API)
-- ============================================================================
-- NOTE: Storage bucket creation cannot be done via SQL directly.
-- You must create the bucket via Supabase Dashboard or using the JavaScript client.
--
-- Via Supabase Dashboard:
-- 1. Go to Storage > Buckets
-- 2. Click "Create bucket"
-- 3. Name: certificates
-- 4. Public: Yes (for public access to certificates)
--
-- Via JavaScript (in browser console or admin initialization):
-- supabase.storage.createBucket('certificates', { public: true })
-- ============================================================================

-- ============================================================================
-- STEP 3: Storage Policies (run via Dashboard SQL editor or CLI)
-- ============================================================================
-- These policies must be created in the Storage > Policies section of Supabase Dashboard.
-- Copy and paste each policy in the SQL editor in the Dashboard.

-- Policy 1: Allow admin users to upload certificates
-- CREATE POLICY "admin can upload certificates"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'certificates'
--   AND EXISTS (
--     SELECT 1 FROM profiles
--     WHERE id = auth.uid()
--     AND role = 'admin'
--   )
-- );

-- Policy 2: Allow admin users to update certificates
-- CREATE POLICY "admin can update certificates"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (
--   bucket_id = 'certificates'
--   AND EXISTS (
--     SELECT 1 FROM profiles
--     WHERE id = auth.uid()
--     AND role = 'admin'
--   )
-- );

-- Policy 3: Allow public read access (anyone can view certificates)
-- CREATE POLICY "public can view certificates"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'certificates');

-- ============================================================================
-- STEP 4: Verification Query
-- ============================================================================
-- After setup, verify with:
-- SELECT id, name, studentid, certificate_id, certificate_url 
-- FROM public.students 
-- WHERE completed = true AND certificate_url IS NOT NULL
