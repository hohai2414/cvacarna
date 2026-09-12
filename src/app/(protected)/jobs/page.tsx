import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function JobsPage() {
  const supabase = await createClient()
  
  // Note: We need the user's organization_id to fetch jobs.
  // Assuming the RLS policy automatically filters by organization_id for authenticated users.
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Jobs</h1>
          <p className="text-muted-foreground mt-2">
            Manage your open positions and configurations.
          </p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!jobs || jobs.length === 0 ? (
          <Card className="col-span-full border-dashed bg-transparent">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p>No jobs found.</p>
              <Link href="/jobs/new" className="mt-4">
                <Button variant="outline">Create your first job</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="bg-card/60 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{job.job_title}</CardTitle>
                  <span className={`px-2 py-1 text-xs rounded-full ${job.status === 'open' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    {job.status}
                  </span>
                </div>
                <CardDescription>{job.department} • {job.level}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3 text-muted-foreground">
                  {job.job_description}
                </p>
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary">View Details</Button>
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
