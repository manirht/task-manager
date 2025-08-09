import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { getBoards } from '@/lib/data'
import { cookies } from 'next/headers'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      redirect('/login')
    }

    const user = await verifyToken(token)
    if (!user) {
      redirect('/login')
    }

    const boards = await getBoards(user.id)

    return <DashboardClient user={user} initialBoards={boards} />
  } catch (error) {
    console.error('Dashboard error:', error)
    redirect('/login')
  }
}
