'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authenticateUser } from '@/lib/auth'

export async function logout(redirectTo: string = '') {
  cookies().delete('authToken')
  if (redirectTo) {
    redirect(redirectTo)
  }
}

export async function login(email: string, password: string) {
  const user = authenticateUser(email, password)
  if (user) {
    cookies().set('authToken', user.id.toString(), { path: '/' })
    redirect('/dashboard')
  }

  return {
    error: 'Invalid email or password'
  }
}