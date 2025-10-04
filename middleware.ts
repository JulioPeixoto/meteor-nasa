import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from 'next-intl/middleware';
import { i18n } from './i18n/request';

const intlMiddleware = createIntlMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
  localePrefix: 'always'
});

export default withAuth(
  function middleware(req) {
    console.log('🔥 MIDDLEWARE EXECUTADO - Rota:', req.nextUrl.pathname);
    
    const { nextUrl } = req;
    const isLoggedIn = !!req.nextauth.token;
    
    console.log('🔐 Status de login:', isLoggedIn);
    console.log('👤 Usuário:', req.nextauth.token?.email || 'não logado');

    const intlResponse = intlMiddleware(req);
    
    const publicPaths = ["/login"];
    
    const isPublicPath = publicPaths.some((path) =>
      nextUrl.pathname === path || 
      nextUrl.pathname === `/en${path}` ||
      nextUrl.pathname === `/pt${path}` ||
      nextUrl.pathname.startsWith(`${path}/`) ||
      nextUrl.pathname.startsWith(`/en${path}/`) ||
      nextUrl.pathname.startsWith(`/pt${path}/`)
    );

    if (isPublicPath) {
      console.log('✅ Rota pública permitida');
      if (isLoggedIn) {
        console.log('🔄 Usuário logado tentando acessar login - redirecionando');
        return NextResponse.redirect(new URL("/", nextUrl));
      }
      return intlResponse;
    }

    if (!isLoggedIn) {
      console.log('❌ Acesso negado - redirecionando para login');
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    console.log('✅ Usuário autenticado - acesso permitido');
    return intlResponse;
  },
  {
    callbacks: {
      authorized: () => true,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};