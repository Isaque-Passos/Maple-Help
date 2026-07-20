import { Chamado } from '@/types/database';

interface ChamadoCardProps {
  chamado: Chamado;
  onClick: () => void;
}

export function ChamadoCard({ chamado, onClick }: ChamadoCardProps) {
  // Cores dinâmicas por categoria (opcional para dar mais vida ao visual)
  const getCategoriaCor = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'hardware': return 'bg-purple-100 text-purple-700';
      case 'software': return 'bg-blue-100 text-blue-700';
      case 'rede': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer group flex flex-col gap-3 relative overflow-hidden"
    >
      {/* Detalhe de cor lateral dependendo do status */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        chamado.status === 'Pendente' ? 'bg-[#E31837]' : 
        chamado.status === 'Em Andamento' ? 'bg-amber-400' : 'bg-green-500'
      }`} />

      <div className="flex justify-between items-start ml-2">
        <div>
          <h3 className="font-bold text-zinc-900 group-hover:text-[#E31837] transition-colors line-clamp-1">
            {chamado.solicitante}
          </h3>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">{chamado.local}</p>
        </div>
        
        {chamado.responsavel && chamado.status === 'Em Andamento' && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-200 shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
            </svg>
            {chamado.responsavel}
          </div>
        )}
      </div>
      
      <div className="ml-2">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoriaCor(chamado.categoria)}`}>
          {chamado.categoria}
        </span>
      </div>

      <div className="ml-2 mt-1">
        <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
          {chamado.descricao}
        </p>
      </div>
      
      <div className="ml-2 mt-2 pt-3 border-t border-zinc-100 flex justify-between items-center text-xs text-zinc-400">
        <span>Aberto em:</span>
        <span className="font-medium">
          {new Date(chamado.data_criacao).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}
