"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, LogOut, Clipboard, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
}

interface Board {
  id: string
  name: string
  description: string
  createdAt: string
  taskCount: number
}

interface DashboardClientProps {
  user: User
  initialBoards: Board[]
}

export default function DashboardClient({ user, initialBoards }: DashboardClientProps) {
  const [boards, setBoards] = useState<Board[]>(initialBoards)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBoardName,
          description: newBoardDescription,
        }),
      })

      if (response.ok) {
        const newBoard = await response.json()
        setBoards([...boards, newBoard])
        setNewBoardName('')
        setNewBoardDescription('')
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create board:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board? All tasks will be lost.')) {
      return
    }

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBoards(boards.filter(board => board.id !== boardId))
      }
    } catch (error) {
      console.error('Failed to delete board:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TaskBoards</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Boards</h2>
            <p className="text-gray-600">Organize your tasks across different boards</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
                <DialogDescription>
                  Create a new board to organize your tasks
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="boardName">Board Name</Label>
                  <Input
                    id="boardName"
                    placeholder="e.g., Work, Personal, Groceries"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="boardDescription">Description (Optional)</Label>
                  <Input
                    id="boardDescription"
                    placeholder="Brief description of this board"
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBoard} disabled={loading || !newBoardName.trim()}>
                  Create Board
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-12">
            <Clipboard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No boards yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first board.</p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Board
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Card key={board.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{board.name}</CardTitle>
                      {board.description && (
                        <CardDescription className="mt-1">
                          {board.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {board.taskCount} {board.taskCount === 1 ? 'task' : 'tasks'}
                    </span>
                    <Link href={`/board/${board.id}`}>
                      <Button size="sm">Open Board</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
