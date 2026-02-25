import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isAppPage = req.nextUrl.pathname.startsWith('/app');

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/app/dashboard', req.url));
      }
      return null;
    }

    if (isAppPage && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ['/app/:path*', '/auth/:path*'],
};
