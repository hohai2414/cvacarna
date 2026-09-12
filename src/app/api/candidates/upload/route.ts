import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { PDFParse } from 'pdf-parse'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('cvFile') as File
    const displayName = formData.get('displayName') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No CV file provided' }, { status: 400 })
    }

    // 1. Create candidate record
    const candidateId = uuidv4()
    const candidateCode = `CAN-${Math.floor(Math.random() * 10000)}`

    const { error: candidateError } = await supabase
      .from('candidates')
      .insert({
        id: candidateId,
        organization_id: profile.organization_id,
        created_by: user.id,
        candidate_code: candidateCode,
        display_name: displayName || null,
        consent_status: true,
        consent_recorded_at: new Date().toISOString(),
      })

    if (candidateError) {
      console.error(candidateError)
      return NextResponse.json({ error: 'Failed to create candidate record' }, { status: 500 })
    }

    // 2. Process File
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let extractedText = ''

    if (file.type === 'application/pdf') {
      const parseFunc = PDFParse as unknown as Function;
      const data = await parseFunc(buffer);
      extractedText = data.text
    } else {
      // In a real app, support DOC/DOCX parsing (e.g., using mammoth)
      return NextResponse.json({ error: 'Only PDF is currently supported for automated parsing in this MVP' }, { status: 400 })
    }

    // 3. Simple Redaction (Basic fallback before AI redaction)
    // Here we can remove typical email patterns and phone numbers as a first pass
    let redactedText = extractedText
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED PHONE]')

    // 4. Upload to Supabase Storage
    const documentId = uuidv4()
    const filePath = `${profile.organization_id}/${candidateId}/${documentId}/${file.name}`

    const { error: storageError } = await supabase.storage
      .from('candidate-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      // Continue anyway as we have the text, but log it
    }

    // 5. Save Document Record
    await supabase
      .from('candidate_documents')
      .insert({
        id: documentId,
        organization_id: profile.organization_id,
        candidate_id: candidateId,
        document_type: 'cv',
        storage_path: filePath,
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        extracted_text: extractedText,
        redacted_text: redactedText
      })

    return NextResponse.json({ success: true, candidateId })
  } catch (error: any) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
