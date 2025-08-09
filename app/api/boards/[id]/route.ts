import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { deleteBoard } from '@/lib/data'
import { cookies } from 'next/headers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteBoard(id, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete board error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
