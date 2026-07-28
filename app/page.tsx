'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.toLowerCase().endsWith('@maplebeararaxa.com.br')) {
      alert('Acesso negado: Utilize seu e-mail institucional (@maplebeararaxa.com.br)');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert('Erro ao criar conta: ' + error.message);
      } else {
        alert('Conta criada com sucesso! Você já pode fazer login no sistema.');
        setIsSignUp(false); // Volta para a tela de login
      }
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert('E-mail ou senha incorretos.');
        setLoading(false);
      } else {
        router.push('/menu'); // Vai pro Hub
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#111315] flex items-center justify-center p-4">
      
      {/* Container Principal */}
      <div className="w-full max-w-[1000px] h-auto md:h-[600px] bg-[#111315] rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Lado Esquerdo - Formulário */}
        <div className="w-full md:w-1/2 bg-white p-10 md:p-14 flex flex-col justify-center relative rounded-r-[2rem] z-10 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.5)]">
          
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
            {isSignUp ? 'Criar Conta' : 'Login'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Endereço de E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                  placeholder="Seu e-mail Maple Bear"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                  placeholder="Sua senha"
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-[#E31837] rounded border-gray-300 focus:ring-[#E31837]" />
                  <span className="text-sm font-bold text-gray-600">Lembrar-me</span>
                </label>
                <a href="#" className="text-sm font-bold text-[#E31837] hover:underline">Esqueceu a senha?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E31837] text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-70 mt-4"
            >
              {loading ? 'Aguarde...' : (isSignUp ? 'Finalizar Cadastro' : 'Entrar no Sistema')}
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-gray-500 mt-8">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem cadastro?'} {' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-gray-900 hover:text-[#E31837] hover:underline transition-colors"
            >
              {isSignUp ? 'Faça Login aqui' : 'Criar uma conta'}
            </button>
          </p>
        </div>
        
        {/* Lado Direito - Imagem e Logo */}
        <div className="hidden md:flex w-1/2 bg-zinc-800 items-center justify-center p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#E31837]/5 to-transparent z-0 pointer-events-none"></div>
          {/* Logo da Maple Bear Centralizada */}
          <div className="relative z-10 animate-pulse-slow">
            <Image 
              src="/maple_bear_login.png" 
              alt="Maple Bear Login" 
              width={350} 
              height={350}
              className="object-contain drop-shadow-[0_0_40px_rgba(227,24,55,0.4)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
