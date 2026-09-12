'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateLifePathNumber } from '@/lib/numerology'
import { AlertTriangle, Sparkles } from 'lucide-react'

const ARCHETYPES = [
  { name: 'The Builder', keyword: 'Structure', positive: 'Creates lasting foundations', shadow: 'Rigidity', reflect: 'Where are you being too rigid?', interview: 'Tell me about a time you had to adapt a solid plan.' },
  { name: 'The Investigator', keyword: 'Analysis', positive: 'Deep understanding', shadow: 'Overthinking', reflect: 'What facts are you ignoring?', interview: 'How do you balance analysis with action?' },
  { name: 'The Connector', keyword: 'Network', positive: 'Brings people together', shadow: 'People-pleasing', reflect: 'Are you authentic in your connections?', interview: 'Describe a time you resolved a conflict.' },
  { name: 'The Navigator', keyword: 'Direction', positive: 'Finds the best path', shadow: 'Fear of committing', reflect: 'What direction are you avoiding?', interview: 'How do you handle ambiguous goals?' },
  { name: 'The Guardian', keyword: 'Protection', positive: 'Maintains standards', shadow: 'Gatekeeping', reflect: 'What are you protecting unnecessarily?', interview: 'When did you have to bend a rule for a good reason?' },
  { name: 'The Catalyst', keyword: 'Change', positive: 'Sparks innovation', shadow: 'Chaos', reflect: 'Are you changing things just for the sake of it?', interview: 'Tell me about a change you led that failed.' },
  { name: 'The Mentor', keyword: 'Guidance', positive: 'Develops others', shadow: 'Controlling', reflect: 'Are you letting others make their own mistakes?', interview: 'How do you adapt your teaching style?' },
  { name: 'The Craftsman', keyword: 'Mastery', positive: 'High quality work', shadow: 'Perfectionism', reflect: 'When is "good enough" actually better?', interview: 'Tell me about a time you compromised on quality to meet a deadline.' },
  { name: 'The Strategist', keyword: 'Vision', positive: 'Sees the big picture', shadow: 'Detachment', reflect: 'Are you ignoring the operational details?', interview: 'How do you ensure your strategy is executable?' },
  { name: 'The Explorer', keyword: 'Discovery', positive: 'Finds new opportunities', shadow: 'Lack of focus', reflect: 'What are you running away from?', interview: 'How do you decide which new idea to pursue?' },
  { name: 'The Visionary', keyword: 'Future', positive: 'Inspires others', shadow: 'Impracticality', reflect: 'Is your vision grounded in reality?', interview: 'Tell me about a vision you had to scale back.' },
  { name: 'The Integrator', keyword: 'Synthesis', positive: 'Combines disparate parts', shadow: 'Compromise', reflect: 'Are you losing the essence in the blend?', interview: 'Describe a time you had to align conflicting teams.' },
]

export default function CareerTarotPage() {
  const [dob, setDob] = useState('')
  const [lifePath, setLifePath] = useState<number | null>(null)
  const [cards, setCards] = useState<typeof ARCHETYPES | null>(null)

  const handleNumerology = (e: React.FormEvent) => {
    e.preventDefault()
    setLifePath(calculateLifePathNumber(dob))
  }

  const drawCards = () => {
    const shuffled = [...ARCHETYPES].sort(() => 0.5 - Math.random())
    setCards(shuffled.slice(0, 3))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Sparkles className="text-yellow-500" /> Career Arcana Reflection
        </h1>
        <p className="text-muted-foreground mt-2">
          Explore deeper dimensions of the career journey through archetypes and numerology.
        </p>
      </div>

      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="text-destructive w-6 h-6 shrink-0" />
        <p className="text-sm text-foreground/80 font-medium">
          Tarot và thần số học trong ứng dụng này chỉ nhằm mục đích giải trí và tự phản tư. Kết quả không phải là phép đo tâm lý đã được xác thực, không phản ánh năng lực nghề nghiệp và không được sử dụng để sàng lọc, xếp hạng hoặc đưa ra quyết định tuyển dụng.
        </p>
      </div>

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Numerology: Life Path Number</CardTitle>
          <CardDescription>Optionally calculate the candidate's life path number for self-reflection.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNumerology} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1 max-w-sm">
              <Label htmlFor="dob">Date of Birth (Optional)</Label>
              <Input 
                id="dob" 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">Calculate</Button>
          </form>

          {lifePath !== null && (
            <div className="mt-6 p-6 bg-primary/10 rounded-lg text-center border border-primary/20">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Life Path Number</h3>
              <div className="text-5xl font-bold text-primary mb-4">{lifePath}</div>
              <p className="text-sm text-foreground/80">
                Number {lifePath} focuses on personal growth and inner discovery. 
                Remember, this is purely for entertainment and reflection!
              </p>
              <Button variant="ghost" size="sm" className="mt-4 text-destructive" onClick={() => { setLifePath(null); setDob('') }}>
                Clear Result
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Career Tarot Reading</CardTitle>
          <CardDescription>Draw 3 archetypal cards for Past, Present, and Future.</CardDescription>
        </CardHeader>
        <CardContent>
          {!cards ? (
            <div className="flex justify-center py-12">
              <Button onClick={drawCards} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
                Draw 3 Cards
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {['Past', 'Present', 'Future'].map((pos, idx) => (
                <div key={pos} className="flex flex-col h-full">
                  <h3 className="text-center font-bold text-lg mb-4 text-muted-foreground uppercase tracking-widest">{pos}</h3>
                  <div className="bg-gradient-to-b from-card to-background border border-border/50 rounded-xl p-6 flex-1 shadow-lg flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="text-primary w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-primary mb-1">{cards[idx].name}</h4>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{cards[idx].keyword}</span>
                    
                    <div className="space-y-4 text-sm w-full text-left">
                      <div>
                        <span className="font-semibold text-green-500">Light:</span> {cards[idx].positive}
                      </div>
                      <div>
                        <span className="font-semibold text-destructive">Shadow:</span> {cards[idx].shadow}
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <span className="font-semibold">Reflect:</span> <br/>
                        <span className="text-muted-foreground italic">{cards[idx].reflect}</span>
                      </div>
                      <div className="pt-2">
                        <span className="font-semibold">Interview Q:</span> <br/>
                        <span className="text-muted-foreground">{cards[idx].interview}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-span-full flex justify-center mt-8">
                <Button variant="outline" onClick={drawCards}>Redraw Cards</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
