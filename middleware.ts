import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/board']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  const token = request.cookies.get('auth-token')?.value

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If accessing a public route with a valid token, redirect to dashboard
  if (isPublicRoute && token) {
    try {
      const user = await verifyToken(token)
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // If token verification fails, continue to public route
      console.error('Middleware token verification error:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
