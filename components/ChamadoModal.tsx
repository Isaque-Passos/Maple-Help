import { Chamado } from '@/types/database';
import { useState, useEffect, useRef } from 'react';
import { ConfirmModal } from './ConfirmModal';

interface ChamadoModalProps {
  chamado: Chamado;
  onClose: () => void;
  onAssumir: (id: string) => Promise<void>;
  onConcluir: (id: string, resolucao: string, tempo_gasto: string) => Promise<void>;
  onDelete?: (id: string) => void;
}

export function ChamadoModal({ chamado, onClose, onAssumir, onConcluir, onDelete }: ChamadoModalProps) {
  const [resolucao, setResolucao] = useState('');
  const [tempoGasto, setTempoGasto] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar com ESC e travar scroll do body (#7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Auto-focus para acessibilidade
    modalRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, showDeleteConfirm]);

  const handleAssumir = async () => {
    setLoading(true);
    await onAssumir(chamado.id);
    setLoading(false);
  };

  const handleConcluir = async () => {
    let hasError = false;

    if (!tempoGasto.trim()) {
      const input = document.getElementById('tempo-input');
      input?.classList.add('ring-2', 'ring-red-400');
      setTimeout(() => input?.classList.remove('ring-2', 'ring-red-400'), 2000);
      hasError = true;
    }

    if (!resolucao.trim()) {
      const textarea = document.getElementById('resolucao-textarea');
      textarea?.classList.add('ring-2', 'ring-red-400');
      setTimeout(() => textarea?.classList.remove('ring-2', 'ring-red-400'), 2000);
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    await onConcluir(chamado.id, resolucao, tempoGasto);
    setLoading(false);
  };

  return (
    <>
      {/* Backdrop — clicável para fechar (#7) */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chamado-modal-title"
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header do Modal */}
          <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                chamado.status === 'Pendente' ? 'bg-[#E31837]' : 
                chamado.status === 'Em Andamento' ? 'bg-amber-400 text-zinc-900' : 'bg-green-500'
              }`}>
                {chamado.status}
              </span>
              <h2 id="chamado-modal-title" className="text-lg font-bold text-zinc-800">Detalhes do Chamado</h2>
              
              {chamado.responsavel && (
                <span className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-zinc-200/50 text-zinc-700 rounded-lg text-xs font-semibold border border-zinc-300/50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                  </svg>
                  Atendido por: {chamado.responsavel}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {onDelete && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                  title="Apagar Chamado de Teste"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.158 0c-.36-.05-.72-.109-1.08-.166m-1.08-.166V4.41a2.25 2.25 0 00-2.25-2.25h-5.62a2.25 2.25 0 00-2.25 2.25v.38m10.8 0c-.36-.05-.72-.109-1.08-.166M7.5 5.79c.36-.05.72-.109 1.08-.166M7.5 5.79c-.36.05-.72.109-1.08.166M4.772 5.79c-.342.052-.682.107-1.022.166" />
                  </svg>
                </button>
              )}
              
              <button 
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors flex-shrink-0"
                aria-label="Fechar modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Corpo do Modal (Scrollable) */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Solicitante</p>
                <p className="text-zinc-900 font-medium">{chamado.solicitante}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Local</p>
                <p className="text-zinc-900 font-medium">{chamado.local}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Categoria</p>
                <p className="text-zinc-900 font-medium">{chamado.categoria}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Data de Abertura</p>
                <p className="text-zinc-900 font-medium">
                  {new Date(chamado.data_criacao).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">Descrição do Problema</p>
              <p className="text-zinc-800 whitespace-pre-wrap leading-relaxed">{chamado.descricao}</p>
              
              {chamado.anexo_url && (
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">Anexo</p>
                  <a href={chamado.anexo_url} target="_blank" rel="noopener noreferrer" className="block max-w-sm rounded-lg overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                    <img 
                      src={chamado.anexo_url} 
                      alt="Anexo do Chamado" 
                      className="w-full h-auto object-cover max-h-64"
                      loading="lazy"
                    />
                  </a>
                </div>
              )}
            </div>

            {/* Área de Resolução para Chamados em Andamento */}
            {chamado.status === 'Em Andamento' && (
              <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 space-y-4">
                <div>
                  <label htmlFor="tempo-input" className="block text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">
                    Tempo Gasto <span className="text-[#E31837]">*</span>
                  </label>
                  <input
                    id="tempo-input"
                    type="text"
                    value={tempoGasto}
                    onChange={(e) => setTempoGasto(e.target.value)}
                    placeholder="Ex: 30m, 1h 20m..."
                    className="w-full p-3 bg-white text-zinc-900 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#E31837] focus:border-[#E31837] outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="resolucao-textarea" className="block text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">
                    Notas de Resolução <span className="text-[#E31837]">*</span>
                  </label>
                  <textarea
                    id="resolucao-textarea"
                    value={resolucao}
                    onChange={(e) => setResolucao(e.target.value)}
                    placeholder="Descreva o que foi feito para resolver o problema..."
                    className="w-full p-4 bg-white text-zinc-900 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-[#E31837] focus:border-[#E31837] outline-none transition-all resize-none min-h-[120px]"
                  />
                </div>
              </div>
            )}

            {/* Exibir resolução se já concluído */}
            {chamado.status === 'Concluído' && chamado.resolucao && (
              <div className="mt-6 bg-green-50 p-4 rounded-2xl border border-green-100">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">Solução Aplicada</p>
                <p className="text-green-900 whitespace-pre-wrap">{chamado.resolucao}</p>
                <div className="flex items-center gap-4 mt-3 border-t border-green-200/50 pt-2 text-xs text-green-700 font-medium">
                  {chamado.data_resolucao && (
                    <p>
                      Resolvido em: {new Date(chamado.data_resolucao).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  )}
                  {chamado.tempo_gasto && (
                    <p>
                      • Tempo gasto: {chamado.tempo_gasto}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Ações */}
          {(chamado.status === 'Pendente' || chamado.status === 'Em Andamento') && (
            <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                Cancelar
              </button>
              
              {chamado.status === 'Pendente' && (
                <button
                  onClick={handleAssumir}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#E31837] text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Assumir Chamado'}
                </button>
              )}

              {chamado.status === 'Em Andamento' && (
                <button
                  onClick={handleConcluir}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Concluir Chamado'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Delete (#2 — substitui confirm()) */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Apagar Chamado"
          message="Tem certeza que deseja apagar este chamado? Esta ação não pode ser desfeita."
          confirmLabel="Apagar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete?.(chamado.id);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
