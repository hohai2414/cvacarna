'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewJobPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const department = formData.get('department') as string
    const level = formData.get('level') as string
    const description = formData.get('description') as string

    try {
      // Get current user profile to get org ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found. Please contact admin.')

      const { data: newJob, error: insertError } = await supabase
        .from('jobs')
        .insert({
          organization_id: profile.organization_id,
          created_by: user.id,
          job_title: title,
          department,
          level,
          job_description: description,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/jobs/${newJob.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Create New Job</h1>
        <p className="text-muted-foreground mt-2">
          Define the job requirements to match candidates against.
        </p>
      </div>

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Enter the primary information for this position.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" name="title" required placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" required placeholder="e.g. Engineering" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input id="level" name="level" required placeholder="e.g. Senior, Mid-level, Entry" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description & Requirements</Label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={8}
                  className="w-full min-h-[150px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Paste the full job description here..."
                />
              </div>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
