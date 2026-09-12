export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          full_name: string
          role: 'admin' | 'recruiter' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          full_name: string
          role: 'admin' | 'recruiter' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          full_name?: string
          role?: 'admin' | 'recruiter' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          job_title: string
          department: string
          level: string
          job_description: string
          scoring_config: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          job_title: string
          department: string
          level: string
          job_description: string
          scoring_config?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string
          job_title?: string
          department?: string
          level?: string
          job_description?: string
          scoring_config?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          candidate_code: string
          display_name: string | null
          email: string | null
          phone: string | null
          consent_status: boolean
          consent_recorded_at: string | null
          retention_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          candidate_code: string
          display_name?: string | null
          email?: string | null
          phone?: string | null
          consent_status?: boolean
          consent_recorded_at?: string | null
          retention_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string
          candidate_code?: string
          display_name?: string | null
          email?: string | null
          phone?: string | null
          consent_status?: boolean
          consent_recorded_at?: string | null
          retention_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      candidate_documents: {
        Row: {
          id: string
          organization_id: string
          candidate_id: string
          document_type: 'cv' | 'supporting_document'
          storage_path: string
          original_filename: string
          mime_type: string
          file_size: number
          extracted_text: string | null
          redacted_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          candidate_id: string
          document_type: 'cv' | 'supporting_document'
          storage_path: string
          original_filename: string
          mime_type: string
          file_size: number
          extracted_text?: string | null
          redacted_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          candidate_id?: string
          document_type?: 'cv' | 'supporting_document'
          storage_path?: string
          original_filename?: string
          mime_type?: string
          file_size?: number
          extracted_text?: string | null
          redacted_text?: string | null
          created_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          organization_id: string
          job_id: string
          candidate_id: string
          created_by: string
          overall_match_score: number | null
          confidence_score: number | null
          recommendation_label: 'Strong evidence' | 'Moderate evidence' | 'Limited evidence' | 'Insufficient information' | null
          summary: string | null
          strengths: Json | null
          gaps: Json | null
          missing_information: Json | null
          interview_questions: Json | null
          model_name: string | null
          prompt_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          job_id: string
          candidate_id: string
          created_by: string
          overall_match_score?: number | null
          confidence_score?: number | null
          recommendation_label?: 'Strong evidence' | 'Moderate evidence' | 'Limited evidence' | 'Insufficient information' | null
          summary?: string | null
          strengths?: Json | null
          gaps?: Json | null
          missing_information?: Json | null
          interview_questions?: Json | null
          model_name?: string | null
          prompt_version?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          job_id?: string
          candidate_id?: string
          created_by?: string
          overall_match_score?: number | null
          confidence_score?: number | null
          recommendation_label?: 'Strong evidence' | 'Moderate evidence' | 'Limited evidence' | 'Insufficient information' | null
          summary?: string | null
          strengths?: Json | null
          gaps?: Json | null
          missing_information?: Json | null
          interview_questions?: Json | null
          model_name?: string | null
          prompt_version?: string | null
          created_at?: string
        }
      }
    }
  }
}
