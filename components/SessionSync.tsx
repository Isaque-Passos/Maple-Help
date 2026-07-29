'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function SessionSync() {
  useEffect(() => {
    // Sincroniza o token de autenticação do LocalStorage (padrão do cliente web) 
    // com os Cookies (necessário para o middleware/proxy Server-Side funcionar)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        // Define o cookie com duração de 1 semana
        document.cookie = `sb-auth-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; secure`;
      } else {
        // Remove o cookie no logout
        document.cookie = `sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
