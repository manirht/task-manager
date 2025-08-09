# 🚀 My TaskBoard - Full-Stack Next.js Application

Welcome to **My TaskBoard**, a full-stack task management application built entirely with Next.js. This project allows users to register, log in, create distinct task boards, and manage their to-dos seamlessly. It's designed to be secure, scalable, and user-friendly, with a polished UI built using **shadcn/ui** and **Tailwind CSS**.

## ✨ Features

* 🔐 **Secure User Authentication**: Sign-up and login functionality using JWTs stored in secure, `HttpOnly` cookies.

* 🗂️ **Multi-Board Organization**: Create, rename, and delete multiple task boards (e.g., "Work", "Personal", "Groceries").

* 📝 **Complete Task Management**: Within each board, users can:

  * Add, update, and delete tasks.

  * Mark tasks as complete or pending.

  * Assign titles, descriptions, and due dates.

* 🔒 **Authorization & Privacy**: Users can only access and modify their own boards and tasks.

* 📱 **Responsive Design**: A clean and polished UI that works smoothly on both desktop and mobile devices.

* ⚡ **RESTful API**: A complete backend API built with Next.js API Routes for all user, board, and task operations.

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router)

* **Styling**: [Tailwind CSS](https://tailwindcss.com/)

* **UI Components**: [shadcn/ui](https://ui.shadcn.com/)

* **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/) via `jose`

* **Password Hashing**: `bcryptjs`

* **Icons**: [Lucide React](https://lucide.dev/)

* **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or newer) and `npm` installed on your system.

### 2. Clone the Repository
>git clone <YOUR_REPOSITORY_URL>
>cd your-project-directory

### 3. Install Dependencies

Install all the required packages using npm.
npm install
### 4. Set Up Environment Variables

This step is **crucial** for authentication to work correctly.

* Create a new file named `.env.local` in the root of your project.

* Add the following line to it. This secret is used to sign the JSON Web Tokens (JWTs).

JWT_SECRET=your-super-secret-and-long-random-string

> **Security Note**: Your `JWT_SECRET` should be a long, complex, and random string to ensure your application's security. You can generate a strong secret using an online tool or by running `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your terminal.

### 5. Run the Development Server

Start the Next.js development server.
>npm run dev

Your application should now be running at [http://localhost:3000](http://localhost:3000).

## 🌐 API Endpoints

All backend logic is handled via Next.js API Routes. Here are the primary endpoints:

* `POST /api/auth/register`: Register a new user.

* `POST /api/auth/login`: Log in a user and set the auth cookie.

* `POST /api/auth/logout`: Log out a user and clear the auth cookie.

* `GET /api/boards`: Get all boards for the authenticated user.

* `POST /api/boards`: Create a new board.

* `PUT /api/boards/[boardId]`: Update a board's name.

* `DELETE /api/boards/[boardId]`: Delete a board and all its tasks.

* `POST /api/boards/[boardId]/tasks`: Create a new task within a board.

* `PUT /api/tasks/[taskId]`: Update a task (title, description, status, etc.).

* `DELETE /api/tasks/[taskId]`: Delete a task.

## ☁️ Deployment

This application is ready to be deployed on any platform that supports Next.js, such as:

* [Vercel](https://vercel.com/) (Recommended)

* [Netlify](https://www.netlify.com/)

* [AWS Amplify](https://aws.amazon.com/amplify/)

When deploying, remember to set the `JWT_SECRET` environment variable in your hosting provider's settings.
