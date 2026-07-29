'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { extractFirstName } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/components/ToastProvider';
import { obterChamadosAbertos, assumirChamado, finalizarChamado, deletarChamado } from '../actions/chamados';
import { Chamado } from '@/types/database';
import { ChamadoCard } from '@/components/ChamadoCard';
import { ChamadoModal } from '@/components/ChamadoModal';

export default function Dashboard() {
  usePageTitle('Painel ADM');
  const router = useRouter();
  const { addToast } = useToast();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [adminName, setAdminName] = useState<string>('TI');

  const fetchChamados = async () => {
    try {
      const data = await obterChamadosAbertos();
      setChamados(data);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Buscar usuário logado
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setAdminName(extractFirstName(session.user.email));
      }
    };
    getSession();

    fetchChamados();

    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chamados' },
        () => {
          fetchChamados();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssumir = async (id: string) => {
    try {
      await assumirChamado(id, adminName);
      await fetchChamados();
      
      // Atualiza o modal aberto se necessário
      setChamadoSelecionado(prev => prev ? { ...prev, status: 'Em Andamento', responsavel: adminName } : null);
      addToast(`Chamado assumido por ${adminName}.`, 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao assumir chamado.';
      addToast(message, 'error');
    }
  };

  const handleConcluir = async (id: string, resolucao: string) => {
    try {
      await finalizarChamado(id, resolucao);
      await fetchChamados();
      setChamadoSelecionado(null); // Fecha o modal após concluir
      addToast('Chamado concluído com sucesso!', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao concluir chamado.';
      addToast(message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletarChamado(id);
      await fetchChamados();
      setChamadoSelecionado(null);
      addToast('Chamado removido.', 'warning');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar chamado.';
      addToast(message, 'error');
    }
  };

  // Separação dos chamados nas colunas do Kanban
  const pendentes = chamados.filter(c => c.status === 'Pendente');
  const emAndamento = chamados.filter(c => c.status === 'Em Andamento');
  // Nota: A função obterChamadosAbertos já filtra os concluídos, mas se viermos a buscar todos no futuro, mantemos a coluna pronta.
  const concluidos = chamados.filter(c => c.status === 'Concluído');

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        {/* Skeleton do botão Voltar */}
        <div className="mb-6 h-5 w-40 bg-zinc-200 rounded animate-pulse" />
        
        {/* Skeleton do cabeçalho */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="h-8 w-64 bg-zinc-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-80 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-zinc-200 rounded-lg animate-pulse" />
        </div>

        {/* Skeleton do Kanban (#10) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((col) => (
            <div key={col} className="flex flex-col bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 animate-pulse" />
                <div className="h-5 w-28 bg-zinc-300 rounded animate-pulse" />
              </div>
              <div className="flex flex-col gap-3">
                {[0, 1].map((card) => (
                  <div key={card} className="bg-white p-4 rounded-2xl border border-zinc-200 animate-pulse">
                    <div className="h-4 w-32 bg-zinc-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-zinc-200 rounded mb-3" />
                    <div className="h-6 w-20 bg-zinc-200 rounded-full mb-3" />
                    <div className="h-3 w-full bg-zinc-200 rounded mb-1" />
                    <div className="h-3 w-3/4 bg-zinc-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <button 
        onClick={() => router.push('/menu')}
        className="mb-6 flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Voltar para o Menu
      </button>

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Painel de Administração</h1>
          <p className="text-zinc-500 mt-1">Gestão de chamados de TI e Manutenção em tempo real.</p>
        </div>
        
        <button 
          onClick={() => router.push('/adm/relatorios')}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Ver Relatórios
        </button>
      </div>
      
      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna Pendentes */}
        <div className="flex flex-col bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200 shadow-inner">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E31837]" />
            <h2 className="font-bold text-zinc-800">Pendentes ({pendentes.length})</h2>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pb-4">
            {pendentes.length === 0 ? (
              <p className="text-zinc-400 text-sm italic p-4 text-center">Nenhum chamado pendente.</p>
            ) : (
              pendentes.map(chamado => (
                <ChamadoCard key={chamado.id} chamado={chamado} onClick={() => setChamadoSelecionado(chamado)} />
              ))
            )}
          </div>
        </div>

        {/* Coluna Em Andamento */}
        <div className="flex flex-col bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200 shadow-inner">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h2 className="font-bold text-zinc-800">Em Andamento ({emAndamento.length})</h2>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pb-4">
            {emAndamento.length === 0 ? (
              <p className="text-zinc-400 text-sm italic p-4 text-center">Nenhum chamado em andamento.</p>
            ) : (
              emAndamento.map(chamado => (
                <ChamadoCard key={chamado.id} chamado={chamado} onClick={() => setChamadoSelecionado(chamado)} />
              ))
            )}
          </div>
        </div>

        {/* Coluna Concluídos (Recentemente) */}
        <div className="flex flex-col bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200 shadow-inner">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <h2 className="font-bold text-zinc-800">Recentes (Hoje)</h2>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pb-4">
            {concluidos.length === 0 ? (
              <p className="text-zinc-400 text-sm italic p-4 text-center">Os chamados concluídos somem da fila principal e vão para os relatórios.</p>
            ) : (
              concluidos.map(chamado => (
                <ChamadoCard key={chamado.id} chamado={chamado} onClick={() => setChamadoSelecionado(chamado)} />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal de Detalhes */}
      {chamadoSelecionado && (
        <ChamadoModal 
          chamado={chamadoSelecionado}
          onClose={() => setChamadoSelecionado(null)}
          onAssumir={handleAssumir}
          onConcluir={handleConcluir}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
