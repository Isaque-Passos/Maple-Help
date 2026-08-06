import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// E-mails autorizados
function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || '';
  if (envEmails) {
    return envEmails.split(',').map(e => e.trim().toLowerCase());
  }
  return [
    'isaque.santos@maplebeararaxa.com.br',
    'jose.reis@maplebeararaxa.com.br',
    'pedro.ashidani@maplebeararaxa.com.br'
  ];
}

export async function proxy(request: NextRequest) {
  // Só proteger rotas /adm/*
  if (!request.nextUrl.pathname.startsWith('/adm')) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.email) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!getAdminEmails().includes(user.email.toLowerCase())) {
      const url = new URL('/menu', request.url);
      url.searchParams.set('unauthorized', '1');
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: '/adm/:path*',
};
