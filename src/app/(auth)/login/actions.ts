'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const dummyPassword = 'CareerArcana123!@#_user'

  // Cố gắng đăng nhập
  let { error } = await supabase.auth.signInWithPassword({
    email,
    password: dummyPassword,
  })

  // Nếu chưa có tài khoản, tự động tạo mới
  if (error) {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: dummyPassword,
    })

    if (signUpError) {
      return { error: signUpError.message }
    }
  }

  redirect('/dashboard')
}
