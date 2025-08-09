// lib/data.ts
import { v4 as uuidv4 } from 'uuid'

// In-memory data storage
const data = {
  users: [] as User[],
  boards: [] as Board[],
  tasks: [] as Task[],
};

// User operations
interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const user: User = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
  };
  data.users.push(user);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return data.users.find(user => user.email === email) || null;
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
  const board: Board = {
    id: uuidv4(),
    ...boardData,
    createdAt: new Date().toISOString(),
  };
  data.boards.push(board);
  return { ...board, taskCount: 0 };
}

export async function getBoards(userId: string): Promise<(Board & { taskCount: number })[]> {
  const userBoards = data.boards.filter(board => board.userId === userId);
  return userBoards.map(board => ({
    ...board,
    taskCount: data.tasks.filter(task => task.boardId === board.id).length,
  }));
}

export async function getBoard(boardId: string, userId: string): Promise<Board | null> {
  return data.boards.find(board => board.id === boardId && board.userId === userId) || null;
}

export async function deleteBoard(boardId: string, userId: string): Promise<void> {
  // Remove board
  data.boards = data.boards.filter(board => !(board.id === boardId && board.userId === userId));
  // Remove all tasks in the board
  data.tasks = data.tasks.filter(task => task.boardId !== boardId);
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
  dueDate?: string
  completedAt?: string
}

export async function createTask(taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Task> {
  const task: Task = {
    id: uuidv4(),
    ...taskData,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: undefined,
  };
  data.tasks.push(task);
  return task;
}

export async function getTasks(boardId: string, userId: string): Promise<Task[]> {
  return data.tasks.filter(task => task.boardId === boardId && task.userId === userId);
}

export async function getTasksByBoard(boardId: string): Promise<Task[]> {
  return data.tasks.filter(task => task.boardId === boardId);
}

export async function updateTask(
  taskId: string, 
  userId: string, 
  updates: Partial<Pick<Task, 'title' | 'description' | 'completed' | 'dueDate'>>
): Promise<Task> {
  const taskIndex = data.tasks.findIndex(task => task.id === taskId && task.userId === userId);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  
  const updatedTask = {
    ...data.tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  // Handle completion status changes
  if (updates.completed !== undefined) {
    if (updates.completed) {
      updatedTask.completedAt = updatedTask.completedAt || new Date().toISOString();
    } else {
      updatedTask.completedAt = undefined;
    }
  }
  
  data.tasks[taskIndex] = updatedTask;
  return updatedTask;
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  data.tasks = data.tasks.filter(task => !(task.id === taskId && task.userId === userId));
}