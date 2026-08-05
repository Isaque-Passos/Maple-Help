'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.toLowerCase().endsWith('@maplebeararaxa.com.br')) {
      addToast('Acesso negado: Utilize seu e-mail institucional (@maplebeararaxa.com.br)', 'error');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/menu`
        }
      });
      if (error) {
        addToast('Erro ao criar conta: ' + error.message, 'error');
      } else {
        addToast('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de fazer login.', 'success');
        setIsSignUp(false); // Volta para a tela de login
      }
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        addToast('E-mail ou senha incorretos.', 'error');
        setLoading(false);
      } else {
        router.push('/menu'); // Vai pro Hub
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail.toLowerCase().endsWith('@maplebeararaxa.com.br')) {
      addToast('Utilize seu e-mail institucional (@maplebeararaxa.com.br)', 'error');
      return;
    }

    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/`,
    });

    if (error) {
      addToast('Erro ao enviar e-mail de recuperação: ' + error.message, 'error');
    } else {
      addToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
      setShowResetPassword(false);
      setResetEmail('');
    }
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111315] flex items-center justify-center p-4">
      
      {/* Container Principal */}
      <div className="w-full max-w-[1000px] h-auto md:h-[600px] bg-[#111315] rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Lado Esquerdo - Formulário */}
        <div className="w-full md:w-1/2 bg-white p-10 md:p-14 flex flex-col justify-center relative rounded-r-[2rem] z-10 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.5)]">
          
          {/* Logo mobile — visível apenas em telas pequenas (#5) */}
          <div className="flex md:hidden items-center justify-center mb-6">
            <Image
              src="/maple_bear_login.png"
              alt="Maple Bear"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 hidden md:flex">
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* "Lembrar-me" removido (#1) — Supabase já persiste sessão por padrão */}
            {!isSignUp && (
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm font-bold text-[#E31837] hover:underline transition-colors"
                >
                  Esqueceu a senha?
                </button>
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

      {/* Modal de Recuperação de Senha (#1) */}
      {showResetPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowResetPassword(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Recuperar Senha</h2>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Digite seu e-mail institucional e enviaremos um link para redefinir sua senha.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all font-medium"
                  placeholder="seu.nome@maplebeararaxa.com.br"
                  autoFocus
                />
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2.5 rounded-xl font-bold bg-[#E31837] text-white hover:bg-red-700 shadow-md transition-all disabled:opacity-50"
                  >
                    {resetLoading ? 'Enviando...' : 'Enviar Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
