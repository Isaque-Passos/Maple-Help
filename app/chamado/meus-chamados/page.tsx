'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obterMeusChamados } from '@/app/actions/chamados';
import { useToast } from '@/components/ToastProvider';
import { usePageTitle } from '@/lib/usePageTitle';
import { Chamado } from '@/types/database';

export default function MeusChamadosPage() {
  const router = useRouter();
  const { addToast } = useToast();
  usePageTitle('Meus Chamados');
  
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const dados = await obterMeusChamados();
        setChamados(dados);
      } catch (error) {
        console.error("Erro ao buscar seus chamados:", error);
        addToast('Erro ao carregar seus chamados.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [addToast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Concluído
          </span>
        );
      case 'Em Andamento':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Em Andamento
          </span>
        );
      case 'Pendente':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Botão Voltar */}
        <button 
          onClick={() => router.push('/menu')}
          className="mb-8 flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar para o Menu
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Meus Chamados</h1>
            <p className="text-zinc-500 mt-1">Acompanhe o status das suas solicitações para a TI.</p>
          </div>
          
          <button 
            onClick={() => router.push('/chamado')}
            className="flex items-center gap-2 bg-[#E31837] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Chamado
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 animate-pulse">
                <div className="h-4 bg-zinc-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-zinc-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : chamados.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-zinc-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Você não tem chamados</h3>
            <p className="text-zinc-500">Quando você abrir um novo chamado, ele aparecerá aqui para você acompanhar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {chamados.map(chamado => (
              <div key={chamado.id} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        {chamado.categoria}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-xs text-zinc-500">
                        {new Date(chamado.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">{chamado.local}</h3>
                  </div>
                  <div>
                    {getStatusBadge(chamado.status)}
                  </div>
                </div>
                
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-4">
                  <p className="text-zinc-700 text-sm whitespace-pre-wrap">{chamado.descricao}</p>
                </div>

                {chamado.status === 'Concluído' && chamado.resolucao && (
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-600">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900 mb-1">Solução da TI:</h4>
                        <p className="text-sm text-emerald-800/80 leading-relaxed">{chamado.resolucao}</p>
                        {chamado.tempo_gasto && (
                          <span className="inline-block mt-2 text-xs font-medium text-emerald-600/80">
                            Resolvido em: {chamado.tempo_gasto}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
