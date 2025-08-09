import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { getBoard, getTasks } from '@/lib/data'
import { cookies } from 'next/headers'
import BoardClient from './board-client'

interface BoardPageProps {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      redirect('/login')
    }

    const user = await verifyToken(token)
    if (!user) {
      redirect('/login')
    }

    const board = await getBoard(id, user.id)
    if (!board) {
      redirect('/dashboard')
    }

    const tasks = await getTasks(id, user.id)

    return <BoardClient board={board} initialTasks={tasks} />
  } catch (error) {
    console.error('Board page error:', error)
    redirect('/dashboard')
  }
}
