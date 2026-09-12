# Career Arcana

Career Arcana is a Mystic Professional Applicant Tracking System (ATS) built with Next.js 15. It uniquely combines an evidence-based Job Match AI feature for Recruiters with a fun, introspective Career Tarot and Numerology experience.

## Features

- **Evidence-Based Job Match**: Upload a candidate's CV (PDF) and define a Job Description. Our AI (OpenAI GPT-4o) evaluates the CV against your criteria and extracts direct quotes as evidence.
- **Data Privacy & Redaction**: Basic PII redaction ensures fair AI evaluation. Role Level Security (RLS) ensures organizations only see their own data.
- **Career Tarot & Numerology**: A purely entertainment and self-reflection module for candidates or recruiters to explore career archetypes (e.g., The Builder, The Strategist) and Life Path numbers. 

## Tech Stack
- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS v4, shadcn/ui
- Backend: Supabase (Auth, Postgres DB, Storage)
- AI & Validation: OpenAI SDK, Zod, pdf-parse
- Styling: Custom "Mystic Professional" theme (Navy and Champagne Gold)

## Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com/) account
- An [OpenAI](https://openai.com/) API Key

## Setup Instructions

### 1. Supabase Setup
1. Create a new project in Supabase.
2. Go to the SQL Editor and execute the code found in `supabase/migrations/20240101000000_init.sql`. This sets up tables, RLS, and triggers.
3. In Supabase Storage, create a new **Private** bucket named `candidate-documents`.
4. Run the SQL in `supabase/seed.sql` to populate some mock organization data.
5. Setup Email Auth in Supabase Authentication settings (Enable Magic Link).

### 2. Local Environment Variables
Create a `.env.local` file at the root of the project by copying `.env.example`:
```bash
cp .env.example .env.local
```
Fill in the credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: From Supabase Project Settings -> API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase Project Settings -> API
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase Project Settings -> API (Used only securely on the server)
- `OPENAI_API_KEY`: Your OpenAI API Key

### 3. Install & Run
```bash
npm install
npm run dev
```
Open `http://localhost:3000/login` to sign in.

## Deployment
This project is ready to be deployed to Vercel. 
Simply push to GitHub, import into Vercel, and add the same Environment Variables you used in `.env.local`.

## Unit Testing
Run tests using Vitest (to be installed) or your preferred test runner for the Numerology logic in `src/lib/numerology.test.ts`.

## Disclaimer
> Tarot và thần số học trong ứng dụng này chỉ nhằm mục đích giải trí và tự phản tư. Kết quả không phải là phép đo tâm lý đã được xác thực, không phản ánh năng lực nghề nghiệp và không được sử dụng để sàng lọc, xếp hạng hoặc đưa ra quyết định tuyển dụng.
