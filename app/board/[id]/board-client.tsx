"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

interface Board {
  id: string
  name: string
  description: string
}

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
  updatedAt: string
  dueDate?: string
  completedAt?: string
}

interface BoardClientProps {
  board: Board
  initialTasks: Task[]
}

export default function BoardClient({ board, initialTasks }: BoardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/boards/${board.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          dueDate: newTaskDueDate || null
        }),
      })

      if (response.ok) {
        const newTask = await response.json()
        setTasks([...tasks, newTask])
        setNewTaskTitle('')
        setNewTaskDescription('')
        setNewTaskDueDate('')
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTask = async () => {
    if (!editingTask || !editingTask.title.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/boards/${board.id}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          dueDate: editingTask.dueDate || null
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task))
        setEditingTask(null)
        setIsEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/boards/${board.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          completed,
          completedAt: completed ? new Date().toISOString() : null
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task))
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      const response = await fetch(`/api/boards/${board.id}/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId))
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  // Check if task was completed on time
  const isCompletedOnTime = (task: Task) => {
    if (!task.completedAt || !task.dueDate) return false
    return new Date(task.completedAt) <= new Date(task.dueDate)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const completedTasks = tasks.filter(task => task.completed)
  const pendingTasks = tasks.filter(task => !task.completed)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
                {board.description && (
                  <p className="text-sm text-gray-600">{board.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </Badge>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task to your {board.name} board
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="taskTitle">Task Title *</Label>
                      <Input
                        id="taskTitle"
                        placeholder="Enter task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="taskDescription">Description (Optional)</Label>
                      <Textarea
                        id="taskDescription"
                        placeholder="Enter task description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taskDueDate">Due Date (Optional)</Label>
                      <Input
                        id="taskDueDate"
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask} disabled={loading || !newTaskTitle.trim()}>
                      {loading ? 'Creating...' : 'Create Task'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Tasks */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Tasks ({pendingTasks.length})
            </h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => 
                            handleToggleComplete(task.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-base">{task.title}</CardTitle>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              <span>Created: {formatDate(task.createdAt)}</span>
                            </div>
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                <span>Due: {formatDate(task.dueDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTask(task)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending tasks. Great job!</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Completed Tasks ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <Card key={task.id} className="opacity-75 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => 
                            handleToggleComplete(task.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-base line-through text-gray-600">
                            {task.title}
                          </CardTitle>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1 line-through">
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-2">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              <span>Completed: {formatDate(task.updatedAt)}</span>
                            </div>
                            {task.dueDate && (
                              <>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  <span>Due: {formatDate(task.dueDate)}</span>
                                </div>
                                <div className="mt-1">
                                  {isCompletedOnTime(task) ? (
                                    <Badge variant="default">On Time</Badge>
                                  ) : (
                                    <Badge variant="destructive">Late</Badge>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {completedTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No completed tasks yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update your task details
              </DialogDescription>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editTaskTitle">Task Title *</Label>
                  <Input
                    id="editTaskTitle"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      title: e.target.value
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editTaskDescription">Description</Label>
                  <Textarea
                    id="editTaskDescription"
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      description: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="editTaskDueDate">Due Date</Label>
                  <Input
                    id="editTaskDueDate"
                    type="date"
                    value={editingTask.dueDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      dueDate: e.target.value ? e.target.value + 'T00:00:00' : undefined
                    })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTask} disabled={loading}>
                {loading ? 'Updating...' : 'Update Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}