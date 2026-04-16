import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect all /executive routes
  if (pathname.startsWith('/executive')) {
    const sessionCookie = request.cookies.get('gic_auth_session')?.value;
    
    if (!sessionCookie) {
      // Not authenticated, redirect to root directory
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/executive/:path*',
  ],
};
