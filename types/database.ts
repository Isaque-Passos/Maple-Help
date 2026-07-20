export interface Chamado {
  id: string; // uuid
  solicitante: string;
  local: string;
  categoria: string;
  descricao: string;
  status: string; // default 'Pendente'
  resolucao: string | null;
  data_criacao: string; // timestamptz
  data_resolucao: string | null; // timestamptz
  responsavel: string | null;
}
