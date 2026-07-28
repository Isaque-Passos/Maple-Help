'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="sticky top-6 z-50 w-full max-w-5xl mx-auto px-4 md:px-0 mb-12">
      <header className="bg-white/85 backdrop-blur-lg shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] border border-gray-100 rounded-3xl md:rounded-full flex flex-col md:flex-row justify-between items-center px-8 py-4 transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(227,24,55,0.08)]">
        
        {/* Lado Esquerdo: Logotipo */}
        <h1 className="text-2xl font-extrabold text-[#E31837] tracking-tight drop-shadow-sm">
          Maple Help
        </h1>
        
        {/* Lado Direito: Usuário e Sair */}
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span className="text-gray-500 font-medium text-sm">
            Olá, {userName}
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm px-5 py-2.5 bg-white border border-gray-200 shadow-sm rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 font-bold transition-all duration-300"
          >
            Sair
          </button>
        </div>
      </header>
    </div>
  );
}
