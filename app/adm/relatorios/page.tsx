'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obterChamadosConcluidos, obterTodosChamadosConcluidos } from '@/app/actions/chamados';
import { useToast } from '@/components/ToastProvider';
import { usePageTitle } from '@/lib/usePageTitle';
import { Chamado } from '@/types/database';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function RelatoriosPage() {
  const router = useRouter();
  const { addToast } = useToast();
  usePageTitle('Relatórios');
  
  // Estado para filtros
  const hoje = new Date();
  const [mes, setMes] = useState<number>(hoje.getMonth() + 1);
  const [ano, setAno] = useState<number>(hoje.getFullYear());
  
  // Estado para dados
  const [chamados, setChamados] = useState<Chamado[]>([]); // Apenas da página atual
  const [todosChamados, setTodosChamados] = useState<Chamado[]>([]); // Todos do mês para métricas
  const [totalChamados, setTotalChamados] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estado de paginação
  const [page, setPage] = useState<number>(1);
  const limit = 50;

  // Opções para os selects
  const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];
  const anos = [2026, 2027];

  // Buscar dados da página atual
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data, count } = await obterChamadosConcluidos(mes, ano, page, limit);
        setChamados(data);
        setTotalChamados(count);
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
        addToast('Erro ao carregar relatórios.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [mes, ano, page]);

  // Buscar todos os dados para métricas sempre que mudar mês/ano
  useEffect(() => {
    async function fetchTodos() {
      try {
        const dados = await obterTodosChamadosConcluidos(mes, ano);
        setTodosChamados(dados);
      } catch (error) {
        console.error("Erro ao buscar dados para métricas", error);
      }
    }
    fetchTodos();
    setPage(1); // Reseta a página para 1 quando muda a data
  }, [mes, ano]);
  
  const totalPages = Math.ceil(totalChamados / limit) || 1;

  // Encontrar categoria mais afetada (usando todosChamados)
  const categoriasContagem = todosChamados.reduce((acc, c) => {
    acc[c.categoria] = (acc[c.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoriaMaisAfetada = Object.entries(categoriasContagem).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Encontrar tempo médio de resolução (usando todosChamados)
  const mediaAtendimento = () => {
    if (todosChamados.length === 0) return '0h';
    
    let totalMs = 0;
    todosChamados.forEach(c => {
      if (c.data_resolucao && c.data_criacao) {
        const diff = new Date(c.data_resolucao).getTime() - new Date(c.data_criacao).getTime();
        totalMs += diff;
      }
    });
    
    const mediaMs = totalMs / todosChamados.length;
    const mediaHoras = mediaMs / (1000 * 60 * 60);
    
    if (mediaHoras < 1) {
      const mediaMinutos = Math.round(mediaMs / (1000 * 60));
      return `${mediaMinutos} min`;
    }
    if (mediaHoras > 24) {
      const mediaDias = (mediaHoras / 24).toFixed(1);
      return `${mediaDias} dias`;
    }
    return `${mediaHoras.toFixed(1)}h`;
  };

  // Função para Exportar para Excel (.xlsx)
  const exportarParaExcel = async () => {
    if (chamados.length === 0) {
      addToast('Não há dados para exportar neste período.', 'warning');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    
    // Aba 1: Resumo
    const sheetResumo = workbook.addWorksheet('Resumo');
    
    sheetResumo.columns = [
      { header: 'Métrica / Categoria', key: 'metrica', width: 35 },
      { header: 'Valor', key: 'valor', width: 20 },
    ];
    
    // Estilo cabeçalho Resumo
    sheetResumo.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheetResumo.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE31837' } }; // Vermelho Maple Bear
    
    sheetResumo.addRow({ metrica: 'Total de Chamados Concluídos', valor: totalChamados });
    sheetResumo.addRow({ metrica: 'Categoria Mais Afetada', valor: categoriaMaisAfetada });
    sheetResumo.addRow({ metrica: 'Média de Tempo de Atendimento', valor: mediaAtendimento() });
    
    sheetResumo.addRow([]);
    sheetResumo.addRow({ metrica: 'CONTAGEM POR CATEGORIA', valor: '' });
    sheetResumo.getRow(6).font = { bold: true };
    
    Object.entries(categoriasContagem).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      sheetResumo.addRow({ metrica: cat, valor: count });
    });

    // Aba 2: Dados
    const sheetDados = workbook.addWorksheet('Dados Completos');
    
    sheetDados.columns = [
      { header: 'Data Abertura', key: 'data_criacao', width: 20 },
      { header: 'Data Conclusão', key: 'data_resolucao', width: 20 },
      { header: 'Responsável', key: 'responsavel', width: 20 },
      { header: 'Solicitante', key: 'solicitante', width: 25 },
      { header: 'Local/Sala', key: 'local', width: 20 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Descrição do Problema', key: 'descricao', width: 50 },
      { header: 'Resolução Aplicada', key: 'resolucao', width: 50 },
      { header: 'Tempo Gasto', key: 'tempo_gasto', width: 15 },
    ];

    // Estilo cabeçalho Dados
    sheetDados.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheetDados.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE31837' } };

    // Exportar todos os chamados do mês e não só os da página atual
    todosChamados.forEach(c => {
      sheetDados.addRow({
        data_criacao: new Date(c.data_criacao).toLocaleString('pt-BR'),
        data_resolucao: c.data_resolucao ? new Date(c.data_resolucao).toLocaleString('pt-BR') : '',
        responsavel: c.responsavel || 'Desconhecido',
        solicitante: c.solicitante,
        local: c.local,
        categoria: c.categoria,
        descricao: c.descricao,
        resolucao: c.resolucao,
        tempo_gasto: c.tempo_gasto || '-',
      });
    });

    // Ajustar quebra de texto (wrap) e alinhamento
    sheetDados.getColumn('descricao').alignment = { wrapText: true, vertical: 'top' };
    sheetDados.getColumn('resolucao').alignment = { wrapText: true, vertical: 'top' };
    sheetDados.getColumn('data_criacao').alignment = { vertical: 'top' };
    sheetDados.getColumn('data_resolucao').alignment = { vertical: 'top' };
    sheetDados.getColumn('solicitante').alignment = { vertical: 'top' };

    // Gerar arquivo e disparar download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Relatorio-Maple-Help-${mes.toString().padStart(2, '0')}-${ano}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      {/* Botão Voltar */}
      <button 
        onClick={() => router.push('/adm')}
        className="mb-6 flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium text-sm gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Voltar para o Painel ADM
      </button>

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Relatórios Mensais</h1>
          <p className="text-zinc-500 mt-1">Acompanhamento e exportação de chamados concluídos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={mes} 
            onChange={(e) => setMes(Number(e.target.value))}
            className="px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] text-zinc-700 bg-white"
          >
            {meses.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select 
            value={ano} 
            onChange={(e) => setAno(Number(e.target.value))}
            className="px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] text-zinc-700 bg-white"
          >
            {anos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <button 
            onClick={exportarParaExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar Planilha Excel
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-center">
          <h3 className="text-zinc-500 font-medium text-sm mb-1 uppercase tracking-wide">Total Concluídos</h3>
          <p className="text-4xl font-bold text-zinc-900">{loading ? '-' : totalChamados}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-center">
          <h3 className="text-zinc-500 font-medium text-sm mb-1 uppercase tracking-wide">Maior Incidência</h3>
          <p className="text-2xl font-bold text-zinc-900 truncate">{loading ? '-' : categoriaMaisAfetada}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-center">
          <h3 className="text-zinc-500 font-medium text-sm mb-1 uppercase tracking-wide">Média de Atendimento</h3>
          <p className="text-4xl font-bold text-zinc-900">{loading ? '-' : mediaAtendimento()}</p>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E31837]"></div>
          </div>
        ) : chamados.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Nenhum chamado concluído encontrado neste período.
          </div>
        ) : (
          <div className="overflow-x-auto flex flex-col justify-between">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-zinc-600 text-xs font-bold uppercase tracking-wider border-b border-zinc-200">
                  <th className="px-6 py-4">Abertura</th>
                  <th className="px-6 py-4">Conclusão</th>
                  <th className="px-6 py-4">Solicitante</th>
                  <th className="px-6 py-4">Categoria / Local</th>
                  <th className="px-6 py-4">Tempo Gasto</th>
                  <th className="px-6 py-4 min-w-[200px]">Resolução</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {chamados.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                      {new Date(c.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                      {c.data_resolucao ? new Date(c.data_resolucao).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900">{c.solicitante}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-900 font-medium">{c.categoria}</div>
                      <div className="text-zinc-500 text-xs">{c.local}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                        </svg>
                        {c.tempo_gasto || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-green-50 text-green-800 p-3 rounded-lg text-xs border border-green-100/50 leading-relaxed">
                        <span className="font-bold block mb-1">Solução Aplicada:</span>
                        {c.resolucao}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 bg-zinc-50/30">
                <p className="text-sm text-zinc-500">
                  Mostrando de <span className="font-semibold text-zinc-800">{((page - 1) * limit) + 1}</span> a <span className="font-semibold text-zinc-800">{Math.min(page * limit, totalChamados)}</span> de <span className="font-semibold text-zinc-800">{totalChamados}</span> resultados
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm font-medium border border-zinc-300 rounded-md bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-zinc-600 font-medium px-2">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm font-medium border border-zinc-300 rounded-md bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
