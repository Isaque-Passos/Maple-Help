import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// E-mails autorizados (duplicado aqui pois middleware roda no edge runtime
// e não pode importar lib/utils.ts diretamente em alguns cenários)
const ADMIN_EMAILS = [
  'isaque.santos@maplebeararaxa.com.br',
  'jose.reis@maplebeararaxa.com.br',
  'pedro.ashidani@maplebeararaxa.com.br'
];

export async function proxy(request: NextRequest) {
  // Só proteger rotas /adm/*
  if (!request.nextUrl.pathname.startsWith('/adm')) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Se as variáveis não estão configuradas, redirecionar por segurança
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Extrair o token de autenticação dos cookies do Supabase
  // O Supabase armazena o token em cookies com padrão sb-<project-ref>-auth-token
  const cookies = request.cookies;
  let accessToken: string | null = null;

  // Procurar pelo cookie de auth do Supabase
  for (const [name, cookie] of cookies) {
    if (name.includes('auth-token')) {
      try {
        // O cookie pode ser um JSON com access_token ou o token direto
        const parsed = JSON.parse(cookie.value);
        if (parsed.access_token) {
          accessToken = parsed.access_token;
        } else if (Array.isArray(parsed) && parsed[0]) {
          // Formato chunked: pode ser base64 encoded
          accessToken = parsed[0];
        }
      } catch {
        // Se não for JSON, pode ser o token direto
        accessToken = cookie.value;
      }
      break;
    }
  }

  if (!accessToken) {
    // Sem token → redirecionar para login
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verificar o token com o Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.email) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Verificar se o e-mail é de um administrador
    if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      // Redirecionar para o menu com indicação de acesso negado
      const url = new URL('/menu', request.url);
      url.searchParams.set('unauthorized', '1');
      return NextResponse.redirect(url);
    }

    // Admin autorizado — permitir acesso
    return NextResponse.next();
  } catch {
    // Erro ao verificar — redirecionar por segurança
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: '/adm/:path*',
};
