'use client';

import { useEffect } from 'react';

/**
 * Hook para definir o título da aba do browser dinamicamente.
 * Necessário porque as páginas são 'use client' e não podem
 * exportar `metadata` estática do Next.js.
 * 
 * @param title Título da página (será concatenado com "— Maple Help")
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Maple Help`;
    return () => {
      document.title = 'Maple Help';
    };
  }, [title]);
}
