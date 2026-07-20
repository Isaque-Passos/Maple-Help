'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { abrirChamado } from '../actions/chamados';


export default function Home() {
  const router = useRouter();
  const [solicitante, setSolicitante] = useState('');
  const [local, setLocal] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await abrirChamado({ solicitante, local, categoria, descricao });
      
      // Feedback de sucesso com modal customizado
      setShowSuccess(true);
      
      // Limpar todos os campos para o próximo uso
      setSolicitante('');
      setLocal('');
      setCategoria('');
      setDescricao('');
    } catch (error: any) {
      alert(error.message || 'Ocorreu um erro inesperado ao abrir o chamado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/menu')}
          className="mb-8 flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar para o Menu
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <Image 
              src="/maple_bear_chamado_02.png" 
              alt="Mascote Maple Bear" 
              width={120} 
              height={120} 
              className="object-contain mb-4 drop-shadow-md"
            />
            <h1 className="text-3xl font-extrabold text-[#E31837]">
              Maple Help
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700 mb-1">
              Solicitante
            </label>
            <input
              id="solicitante"
              type="text"
              required
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-500"
              placeholder="Nome do professor ou funcionário"
            />
          </div>

          <div>
            <label htmlFor="local" className="block text-sm font-medium text-gray-700 mb-1">
              Local / Sala
            </label>
            <input
              id="local"
              type="text"
              required
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-500"
              placeholder="Ex: Secretaria, Sala de movimento..."
            />
          </div>

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="categoria"
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-colors bg-white text-gray-900"
            >
              <option value="" disabled>Selecione uma categoria</option>
              <option value="Wi-fi | Cabeamento">Wi-fi | Cabeamento</option>
              <option value="Computador | Notebook">Computador | Notebook</option>
              <option value="Televisão | Som">Televisão | Som</option>
              <option value="Ajuda | Duvidas">Ajuda | Duvidas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Problema
            </label>
            <textarea
              id="descricao"
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-colors resize-none text-gray-900 placeholder:text-gray-500"
              placeholder="Descreva com detalhes o problema que está ocorrendo..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E31837] text-white font-semibold py-3 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31837] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : 'Abrir Chamado'}
          </button>
        </form>
      </div>
      </div>
      
      {/* Modal de Sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Tudo Certo!</h2>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed">
              Seu chamado foi aberto com sucesso. A equipe de TI já foi notificada e irá te atender em breve.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
