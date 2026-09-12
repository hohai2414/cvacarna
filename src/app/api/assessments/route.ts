import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CriterionSchema = z.object({
  criterion_name: z.string(),
  weight: z.number(),
  score: z.number().describe("0 to 100 based on evidence strength"),
  status: z.enum(["met", "partially_met", "not_evidenced", "not_applicable"]),
  jd_requirement: z.string(),
  cv_evidence: z.string().describe("Must extract literal quotes or direct summaries from CV"),
  evidence_location: z.string(),
  explanation: z.string(),
  confidence: z.number().describe("0 to 100 based on clarity of information"),
})

const AssessmentSchema = z.object({
  overall_match_score: z.number(),
  confidence_score: z.number(),
  recommendation_label: z.enum(["Strong evidence", "Moderate evidence", "Limited evidence", "Insufficient information"]),
  summary: z.string(),
  criteria: z.array(CriterionSchema),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  missing_information: z.array(z.string()),
  interview_questions: z.array(
    z.object({
      question: z.string(),
      reason: z.string(),
      related_criterion: z.string(),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, candidateId } = await request.json()

    // 1. Fetch Job Description
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    // 2. Fetch Candidate Document (redacted text)
    const { data: document } = await supabase
      .from('candidate_documents')
      .select('redacted_text')
      .eq('candidate_id', candidateId)
      .single()

    if (!job || !document) {
      return NextResponse.json({ error: 'Job or Document not found' }, { status: 404 })
    }

    // 3. Call OpenAI Structured Outputs
    const prompt = `
      You are an expert HR Technology AI.
      Analyze the candidate's CV against the Job Description.
      Provide evidence-based mapping.
      DO NOT hallucinate. If evidence is missing, mark as not_evidenced.
      Do not use name, age, gender, or sensitive info for scoring.

      JOB DETAILS:
      Title: ${job.job_title}
      Description: ${job.job_description}
      Scoring Config: ${JSON.stringify(job.scoring_config)}

      CANDIDATE CV (REDACTED):
      ${document.redacted_text}
    `

    const completion = await (openai.beta as any).chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: "You are a precise, unbiased evidence-based recruiter AI." },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(AssessmentSchema, "assessment"),
    })

    const assessmentResult = completion.choices[0].message.parsed

    if (!assessmentResult) {
      throw new Error("Failed to parse OpenAI output")
    }

    // 4. Save to Database
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        organization_id: job.organization_id,
        job_id: jobId,
        candidate_id: candidateId,
        created_by: user.id,
        overall_match_score: assessmentResult.overall_match_score,
        confidence_score: assessmentResult.confidence_score,
        recommendation_label: assessmentResult.recommendation_label,
        summary: assessmentResult.summary,
        strengths: assessmentResult.strengths,
        gaps: assessmentResult.gaps,
        missing_information: assessmentResult.missing_information,
        interview_questions: assessmentResult.interview_questions,
        model_name: "gpt-4o",
        prompt_version: "v1.0"
      })
      .select()
      .single()

    if (assessmentError) throw assessmentError

    // Insert criteria
    const criteriaRecords = assessmentResult.criteria.map((c: z.infer<typeof CriterionSchema>) => ({
      assessment_id: assessment.id,
      criterion_name: c.criterion_name,
      weight: c.weight,
      score: c.score,
      status: c.status,
      jd_requirement: c.jd_requirement,
      cv_evidence: c.cv_evidence,
      evidence_location: c.evidence_location,
      explanation: c.explanation,
      confidence: c.confidence
    }))

    const { error: criteriaError } = await supabase
      .from('assessment_criteria')
      .insert(criteriaRecords)

    if (criteriaError) throw criteriaError

    return NextResponse.json({ success: true, assessmentId: assessment.id })

  } catch (error: any) {
    console.error('Assessment Error:', error)
    return NextResponse.json({ error: error.message || 'Error during AI analysis' }, { status: 500 })
  }
}
