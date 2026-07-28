'use server';

import { supabase } from '@/lib/supabase';
import { Chamado } from '@/types/database';

/**
 * Cria um novo chamado no sistema.
 * @param dados Dados do chamado (solicitante, local, categoria, descricao).
 * @returns O chamado recém-criado.
 */
export async function abrirChamado(dados: Omit<Chamado, 'id' | 'status' | 'resolucao' | 'data_criacao' | 'data_resolucao' | 'responsavel'>) {
  try {
    const { solicitante, local, categoria, descricao } = dados;
    
    // Status será salvo como 'Pendente' para alinhar com a estrutura do BD.
    // data_criacao geralmente tem valor default de now() no banco, então omitimos.
    const { data, error } = await supabase
      .from('chamados')
      .insert([
        { 
          solicitante, 
          local, 
          categoria, 
          descricao,
          status: 'Pendente'
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Chamado;
  } catch (error: any) {
    console.error('Erro em abrirChamado:', error);
    throw new Error(`Não foi possível abrir o chamado: ${error.message}`);
  }
}

/**
 * Retorna todos os chamados onde o status seja diferente de 'Concluído'.
 * @returns Lista de chamados pendentes/abertos.
 */
export async function obterChamadosAbertos() {
  try {
    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Chamado[];
  } catch (error: any) {
    console.error('Erro em obterChamadosAbertos:', error);
    throw new Error(`Não foi possível carregar os chamados abertos: ${error.message}`);
  }
}

/**
 * Retorna os chamados concluídos filtrados por mês/ano.
 * Ideal para exibição de relatórios gerenciais.
 * @param mes Mês (1 a 12).
 * @param ano Ano.
 * @returns Lista de chamados concluídos no período especificado.
 */
export async function obterChamadosConcluidos(mes: number, ano: number) {
  try {
    // Definimos o início e fim do mês para criar o range de datas
    const dataInicio = new Date(ano, mes - 1, 1).toISOString();
    const dataFim = new Date(ano, mes, 1).toISOString();

    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .eq('status', 'Concluído')
      .gte('data_resolucao', dataInicio) // Maior ou igual ao início do mês
      .lt('data_resolucao', dataFim)     // Menor que o primeiro dia do próximo mês
      .order('data_resolucao', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Chamado[];
  } catch (error: any) {
    console.error('Erro em obterChamadosConcluidos:', error);
    throw new Error(`Não foi possível carregar o relatório de concluídos: ${error.message}`);
  }
}

/**
 * Finaliza um chamado atualizando o status, a resolução e data/hora atual.
 * @param id ID (uuid) do chamado.
 * @param resolucao Texto informando como o chamado foi concluído.
 * @returns O chamado atualizado.
 */
export async function finalizarChamado(id: string, resolucao: string) {
  try {
    const { data, error } = await supabase
      .from('chamados')
      .update({ 
        status: 'Concluído', 
        resolucao,
        data_resolucao: new Date().toISOString() // Preenche com o timestamp de agora
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Chamado;
  } catch (error: any) {
    console.error('Erro em finalizarChamado:', error);
    throw new Error(`Não foi possível finalizar o chamado: ${error.message}`);
  }
}

/**
 * Altera o status do chamado para 'Em Andamento' indicando que alguém assumiu a tarefa.
 * @param id ID (uuid) do chamado.
 * @returns O chamado atualizado.
 */
export async function assumirChamado(id: string, responsavel: string) {
  try {
    const { data, error } = await supabase
      .from('chamados')
      .update({ 
        status: 'Em Andamento',
        responsavel 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Chamado;
  } catch (error: any) {
    console.error('Erro em assumirChamado:', error);
    throw new Error(`Não foi possível assumir o chamado: ${error.message}`);
  }
}

/**
 * Exclui um chamado do banco de dados (Útil para testes).
 * @param id ID (uuid) do chamado.
 */
export async function deletarChamado(id: string) {
  try {
    const { error } = await supabase
      .from('chamados')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Erro em deletarChamado:', error);
    throw new Error(`Não foi possível deletar o chamado: ${error.message}`);
  }
}
