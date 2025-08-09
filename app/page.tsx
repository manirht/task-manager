import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export default async function HomePage() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (token) {
      const user = await verifyToken(token)
      if (user) {
        redirect('/dashboard')
      }
    }
  } catch (error) {
    // If there's any error with token verification, continue to login
    console.error('Token verification error:', error)
  }

  redirect('/login')
}
