-- Migration: Initial Schema for Career Arcana
-- --------------------------------------------------------

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. profiles (links to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'recruiter', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    department TEXT NOT NULL,
    level TEXT NOT NULL,
    job_description TEXT NOT NULL,
    scoring_config JSONB NOT NULL DEFAULT '{"must_have_skills": 30, "relevant_experience": 25, "achievements_and_impact": 20, "domain_knowledge": 10, "tools_and_technology": 10, "job_relevant_education_or_language": 5}',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    candidate_code TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    phone TEXT,
    consent_status BOOLEAN NOT NULL DEFAULT false,
    consent_recorded_at TIMESTAMPTZ,
    retention_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. candidate_documents
CREATE TABLE candidate_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('cv', 'supporting_document')),
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    extracted_text TEXT,
    redacted_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    overall_match_score NUMERIC,
    confidence_score NUMERIC,
    recommendation_label TEXT CHECK (recommendation_label IN ('Strong evidence', 'Moderate evidence', 'Limited evidence', 'Insufficient information')),
    summary TEXT,
    strengths JSONB,
    gaps JSONB,
    missing_information JSONB,
    interview_questions JSONB,
    model_name TEXT,
    prompt_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. assessment_criteria
CREATE TABLE assessment_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    criterion_name TEXT NOT NULL,
    weight NUMERIC NOT NULL,
    score NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('met', 'partially_met', 'not_evidenced', 'not_applicable')),
    jd_requirement TEXT NOT NULL,
    cv_evidence TEXT NOT NULL,
    evidence_location TEXT NOT NULL,
    explanation TEXT NOT NULL,
    confidence NUMERIC NOT NULL
);

-- 8. reflection_readings
CREATE TABLE reflection_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    reading_type TEXT NOT NULL CHECK (reading_type IN ('tarot', 'numerology')),
    input_data JSONB,
    cards JSONB,
    reflection_text TEXT,
    disclaimer_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- --------------------------------------------------------
-- 10. Triggers for updated_at
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- --------------------------------------------------------
-- 11. Row Level Security (RLS) Policies
-- --------------------------------------------------------
-- Helper function to get current user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;


-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflection_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- Organizations: users can only see their own organization
CREATE POLICY "Users can view their own organization"
ON organizations FOR SELECT
USING (id = get_user_org_id());

-- Profiles: users can see profiles in their own org
CREATE POLICY "Users can view profiles in their org"
ON profiles FOR SELECT
USING (organization_id = get_user_org_id());

CREATE POLICY "Admins can update profiles in their org"
ON profiles FOR UPDATE
USING (organization_id = get_user_org_id() AND get_user_role() = 'admin');

-- Jobs: All users in org can view, Admins/Recruiters can insert/update/delete
CREATE POLICY "Users can view jobs in their org"
ON jobs FOR SELECT
USING (organization_id = get_user_org_id());

CREATE POLICY "Recruiters and admins can insert jobs"
ON jobs FOR INSERT
WITH CHECK (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

CREATE POLICY "Recruiters and admins can update jobs"
ON jobs FOR UPDATE
USING (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

-- Candidates: All users in org can view, Admins/Recruiters can insert/update, Recruiter/Admin can delete based on retention
CREATE POLICY "Users can view candidates in their org"
ON candidates FOR SELECT
USING (organization_id = get_user_org_id());

CREATE POLICY "Recruiters and admins can insert candidates"
ON candidates FOR INSERT
WITH CHECK (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

CREATE POLICY "Recruiters and admins can update candidates"
ON candidates FOR UPDATE
USING (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

CREATE POLICY "Recruiters and admins can delete candidates"
ON candidates FOR DELETE
USING (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

-- Candidate Documents
CREATE POLICY "Users can view candidate documents in their org"
ON candidate_documents FOR SELECT
USING (organization_id = get_user_org_id());

CREATE POLICY "Recruiters and admins can insert candidate documents"
ON candidate_documents FOR INSERT
WITH CHECK (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

CREATE POLICY "Recruiters and admins can delete candidate documents"
ON candidate_documents FOR DELETE
USING (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

-- Assessments
CREATE POLICY "Users can view assessments in their org"
ON assessments FOR SELECT
USING (organization_id = get_user_org_id());

CREATE POLICY "Recruiters and admins can insert assessments"
ON assessments FOR INSERT
WITH CHECK (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

-- Assessment Criteria
CREATE POLICY "Users can view assessment criteria in their org"
ON assessment_criteria FOR SELECT
USING (EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_criteria.assessment_id AND a.organization_id = get_user_org_id()));

CREATE POLICY "Recruiters and admins can insert assessment criteria"
ON assessment_criteria FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_criteria.assessment_id AND a.organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter')));

-- Reflection Readings
CREATE POLICY "Users can view reflection readings in their org"
ON reflection_readings FOR SELECT
USING (organization_id = get_user_org_id());

CREATE POLICY "Recruiters and admins can insert reflection readings"
ON reflection_readings FOR INSERT
WITH CHECK (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

CREATE POLICY "Recruiters and admins can delete reflection readings"
ON reflection_readings FOR DELETE
USING (organization_id = get_user_org_id() AND get_user_role() IN ('admin', 'recruiter'));

-- Audit Logs
CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
USING (organization_id = get_user_org_id() AND get_user_role() = 'admin');

CREATE POLICY "All authenticated users can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (organization_id = get_user_org_id());


-- --------------------------------------------------------
-- 12. Storage Policies
-- --------------------------------------------------------
-- Note: Run these after creating the bucket in Supabase UI or using HTTP API.
-- Bucket name: 'candidate-documents'
-- INSERT policy
-- CREATE POLICY "Users can upload candidate documents"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'candidate-documents' AND
--   auth.role() = 'authenticated' AND
--   (storage.foldername(name))[1] = get_user_org_id()::text
-- );

-- SELECT policy
-- CREATE POLICY "Users can view documents in their org"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'candidate-documents' AND
--   auth.role() = 'authenticated' AND
--   (storage.foldername(name))[1] = get_user_org_id()::text
-- );

-- DELETE policy
-- CREATE POLICY "Recruiters and admins can delete documents"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'candidate-documents' AND
--   auth.role() = 'authenticated' AND
--   (storage.foldername(name))[1] = get_user_org_id()::text AND
--   get_user_role() IN ('admin', 'recruiter')
-- );
