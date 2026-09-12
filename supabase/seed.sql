-- Seed data for Career Arcana
-- NOTE: In a real Supabase environment, you would need to create a user in auth.users first.
-- For local testing, we assume the user ID will be provided or we can create a mock one if needed.
-- Let's use deterministic UUIDs for seed data.

-- Org UUID: 00000000-0000-0000-0000-000000000001
-- User UUID (must match a real auth.users ID later): 00000000-0000-0000-0000-000000000002
-- Job UUID: 00000000-0000-0000-0000-000000000003
-- Candidate UUID: 00000000-0000-0000-0000-000000000004

INSERT INTO organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Corp')
ON CONFLICT (id) DO NOTHING;

-- Please replace the id with an actual auth.users ID after signing up in Supabase
-- INSERT INTO profiles (id, organization_id, full_name, role) 
-- VALUES ('YOUR-AUTH-USER-ID', '00000000-0000-0000-0000-000000000001', 'Demo Recruiter', 'recruiter');

INSERT INTO jobs (id, organization_id, created_by, job_title, department, level, job_description, status)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM profiles LIMIT 1), -- Fallback to whatever profile exists
    'Senior Frontend Engineer',
    'Engineering',
    'Senior',
    'We are looking for a Senior Frontend Engineer with strong experience in React, Next.js, and TypeScript. You should have at least 5 years of experience building scalable web applications. Strong understanding of web performance, accessibility, and modern CSS (Tailwind) is required.',
    'open'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO candidates (id, organization_id, created_by, candidate_code, display_name, email, phone, consent_status)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM profiles LIMIT 1),
    'CAN-001',
    'Alex Doe',
    'alex.doe@example.com',
    '0123456789',
    true
)
ON CONFLICT (id) DO NOTHING;
