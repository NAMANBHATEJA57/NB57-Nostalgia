import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const payload = await decrypt(sessionCookie);

  // If there is no valid session payload (invalid/expired JWT)
  if (!payload?.userId) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If valid, allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
