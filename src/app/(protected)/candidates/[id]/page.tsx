import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CandidateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch Candidate
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*, assessments(*), candidate_documents(*)')
    .eq('id', id)
    .single()

  if (!candidate) {
    notFound()
  }

  // Fetch Jobs to allow analyzing against them
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, job_title')
    .eq('status', 'open')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Candidate: {candidate.display_name || candidate.candidate_code}</h1>
          <p className="text-muted-foreground mt-2">
            Code: {candidate.candidate_code} • {candidate.email || 'No email provided'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/candidates/${id}/tarot`}>
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              Career Tarot & Numerology
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Uploaded CV and supporting documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidate.candidate_documents.length > 0 ? (
              candidate.candidate_documents.map((doc: any) => (
                <div key={doc.id} className="flex justify-between items-center p-3 border border-border/50 rounded-md">
                  <span className="font-medium text-sm">{doc.original_filename}</span>
                  <span className="text-xs text-muted-foreground">{(doc.file_size / 1024).toFixed(0)} KB</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Run Assessment</CardTitle>
            <CardDescription>Compare candidate CV against an open job.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs && jobs.length > 0 ? (
              <form action={async (formData) => {
                'use server'
                // This would call the OpenAI API route
                // For MVP brevity we can just do a client fetch in a real client component
                // Here we just mock the form structure
              }}>
                <div className="flex gap-4 items-center">
                  <select name="jobId" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id} className="bg-card text-foreground">{job.job_title}</option>
                    ))}
                  </select>
                  <Button type="submit" disabled className="whitespace-nowrap">Run AI Match</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  (In this MVP, AI matching requires client-side trigger to handle loading states effectively)
                </p>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">No open jobs available to run assessment.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Past Assessments</h2>
      {candidate.assessments.length > 0 ? (
        candidate.assessments.map((assessment: any) => (
          <Card key={assessment.id} className="mb-4 bg-card/60 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Score: {assessment.overall_match_score}/100</CardTitle>
              <CardDescription>{assessment.recommendation_label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 mb-4">{assessment.summary}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-green-500 mb-2">Strengths</h4>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    {assessment.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-destructive mb-2">Gaps</h4>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    {assessment.gaps?.map((g: string, i: number) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-muted-foreground">No assessments run yet.</p>
      )}
    </div>
  )
}
