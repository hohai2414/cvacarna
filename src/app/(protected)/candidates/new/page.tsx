'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewCandidatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!consent) {
      setError('You must confirm that you have a valid basis to process this data.')
      return
    }

    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    // Send to server action or API route for processing
    try {
      const response = await fetch('/api/candidates/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload CV')
      }

      router.push(`/candidates/${result.candidateId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Upload Candidate CV</h1>
        <p className="text-muted-foreground mt-2">
          Upload a resume to automatically extract and redact information.
        </p>
      </div>

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
            <CardDescription>Only PDF, DOC, and DOCX formats are supported.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Candidate Name (Optional)</Label>
              <Input id="displayName" name="displayName" placeholder="e.g. Alex Doe" />
              <p className="text-xs text-muted-foreground">Will be kept strictly for management, not used in AI evaluation.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvFile">CV Document *</Label>
              <Input id="cvFile" name="cvFile" type="file" accept=".pdf,.doc,.docx" required className="cursor-pointer" />
            </div>

            <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-md border border-border/50">
              <input 
                type="checkbox" 
                id="consent" 
                className="mt-1"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="consent" className="text-sm font-medium">Data Processing Consent</Label>
                <p className="text-sm text-muted-foreground">
                  I confirm that I have a legitimate and lawful basis to process this candidate's personal data. 
                  The CV will be redacted to remove PII before being evaluated by AI.
                </p>
              </div>
            </div>
            
            {error && <div className="text-sm text-destructive font-medium">{error}</div>}
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t border-border/50 pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading || !consent}>
              {loading ? 'Processing CV...' : 'Upload & Process'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
