import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const BOARDS_FILE = path.join(DATA_DIR, 'boards.json')
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Generic file operations
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  await ensureDataDir()
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return defaultValue
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// User operations
interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const users = await readJsonFile<User[]>(USERS_FILE, [])
  
  const user: User = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
  }
  
  users.push(user)
  await writeJsonFile(USERS_FILE, users)
  
  return user
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await readJsonFile<User[]>(USERS_FILE, [])
  return users.find(user => user.email === email) || null
}

// Board operations
interface Board {
  id: string
  name: string
  description: string
  userId: string
  createdAt: string
}

export async function createBoard(boardData: Omit<Board, 'id' | 'createdAt'>): Promise<Board & { taskCount: number }> {
  const boards = await readJsonFile<Board[]>(BOARDS_FILE, [])
  
  const board: Board = {
    id: uuidv4(),
    ...boardData,
    createdAt: new Date().toISOString(),
  }
  
  boards.push(board)
  await writeJsonFile(BOARDS_FILE, boards)
  
  return { ...board, taskCount: 0 }
}

export async function getBoards(userId: string): Promise<(Board & { taskCount: number })[]> {
  const boards = await readJsonFile<Board[]>(BOARDS_FILE, [])
  const tasks = await readJsonFile<Task[]>(TASKS_FILE, [])
  
  const userBoards = boards.filter(board => board.userId === userId)
  
  return userBoards.map(board => ({
    ...board,
    taskCount: tasks.filter(task => task.boardId === board.id).length,
  }))
}

export async function getBoard(boardId: string, userId: string): Promise<Board | null> {
  const boards = await readJsonFile<Board[]>(BOARDS_FILE, [])
  return boards.find(board => board.id === boardId && board.userId === userId) || null
}

export async function deleteBoard(boardId: string, userId: string): Promise<void> {
  const boards = await readJsonFile<Board[]>(BOARDS_FILE, [])
  const tasks = await readJsonFile<Task[]>(TASKS_FILE, [])
  
  // Remove board
  const updatedBoards = boards.filter(board => !(board.id === boardId && board.userId === userId))
  await writeJsonFile(BOARDS_FILE, updatedBoards)
  
  // Remove all tasks in the board
  const updatedTasks = tasks.filter(task => task.boardId !== boardId)
  await writeJsonFile(TASKS_FILE, updatedTasks)
}

// Task operations
interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  boardId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export async function createTask(taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const tasks = await readJsonFile<Task[]>(TASKS_FILE, [])
  
  const task: Task = {
    id: uuidv4(),
    ...taskData,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  tasks.push(task)
  await writeJsonFile(TASKS_FILE, tasks)
  
  return task
}

export async function getTasks(boardId: string, userId: string): Promise<Task[]> {
  const tasks = await readJsonFile<Task[]>(TASKS_FILE, [])
  return tasks.filter(task => task.boardId === boardId && task.userId === userId)
}

export async function updateTask(
  taskId: string, 
  userId: string, 
  updates: Partial<Pick<Task, 'title' | 'description' | 'completed'>>
): Promise<Task> {
  const tasks = await readJsonFile<Task[]>(TASKS_FILE, [])
  
  const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === userId)
  if (taskIndex === -1) {
    throw new Error('Task not found')
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  await writeJsonFile(TASKS_FILE, tasks)
  return tasks[taskIndex]
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const tasks = await readJsonFile<Task[]>(TASKS_FILE, [])
  const updatedTasks = tasks.filter(task => !(task.id === taskId && task.userId === userId))
  await writeJsonFile(TASKS_FILE, updatedTasks)
}
