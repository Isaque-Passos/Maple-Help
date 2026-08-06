import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isAdminEmail } from './lib/utils';
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  // A função getUser() checa a validade do JWT garantindo que a sessão não foi forjada.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmRoute = request.nextUrl.pathname.startsWith('/adm');

  // Proteção da Rota do Painel ADM
  if (isAdmRoute) {
    // Se o usuário não está logado ou o e-mail não é o de um administrador...
    if (!user || !user.email || !isAdminEmail(user.email)) {
      // Cria uma nova URL de redirecionamento seguro
      const url = request.nextUrl.clone();
      // Se ele não estiver logado de forma alguma, manda pro Login. Se estiver logado (mas como professor comum), manda pro Hub.
      url.pathname = user ? '/menu' : '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto arquivos estáticos (.png, favicon, etc) 
     * e requisições internas do Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
