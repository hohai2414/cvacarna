import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function CandidatesPage() {
  const supabase = await createClient()
  
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('*, candidate_documents(id)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Candidates</h1>
          <p className="text-muted-foreground mt-2">
            Manage your candidate profiles and CVs.
          </p>
        </div>
        <Link href="/candidates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Candidate
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!candidates || candidates.length === 0 ? (
          <Card className="col-span-full border-dashed bg-transparent">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p>No candidates found.</p>
              <Link href="/candidates/new" className="mt-4">
                <Button variant="outline">Upload a CV</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          candidates.map((candidate) => (
            <Card key={candidate.id} className="bg-card/60 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{candidate.display_name || candidate.candidate_code}</CardTitle>
                </div>
                <CardDescription>{candidate.email || 'No email'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Added: {new Date(candidate.created_at).toLocaleDateString()}</p>
                  <p>Documents: {candidate.candidate_documents?.[0] ? 'Yes' : 'No'}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-end gap-2">
                  <Link href={`/candidates/${candidate.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
