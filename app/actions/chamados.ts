/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Chamado } from '@/types/database';

async function getSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Ignorar erro se for chamado de um Server Component
          }
        },
      },
    }
  );
}

/**
 * Cria um novo chamado no sistema.
 * @param dados Dados do chamado (solicitante, local, categoria, descricao).
 * @returns O chamado recém-criado.
 */
export async function abrirChamado(dados: Omit<Chamado, 'id' | 'status' | 'resolucao' | 'data_criacao' | 'data_resolucao' | 'responsavel' | 'tempo_gasto'>) {
  try {
    const supabase = await getSupabase();
    const { solicitante, local, categoria, descricao, anexo_url } = dados;
    
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
          anexo_url,
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
    const supabase = await getSupabase();
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
export async function obterChamadosConcluidos(mes: number, ano: number, page: number = 1, limit: number = 50) {
  try {
    const supabase = await getSupabase();
    // Definimos o início e fim do mês para criar o range de datas
    const dataInicio = new Date(ano, mes - 1, 1).toISOString();
    const dataFim = new Date(ano, mes, 1).toISOString();
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('chamados')
      .select('*', { count: 'exact' })
      .eq('status', 'Concluído')
      .gte('data_resolucao', dataInicio) // Maior ou igual ao início do mês
      .lt('data_resolucao', dataFim)     // Menor que o primeiro dia do próximo mês
      .order('data_resolucao', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    return { 
      data: data as Chamado[], 
      count: count || 0 
    };
  } catch (error: any) {
    console.error('Erro em obterChamadosConcluidos:', error);
    throw new Error(`Não foi possível carregar o relatório de concluídos: ${error.message}`);
  }
}

/**
 * Busca TODOS os chamados concluídos de um mês específico (sem paginação).
 * Útil para exportação Excel e cálculo de métricas.
 */
export async function obterTodosChamadosConcluidos(mes: number, ano: number) {
  try {
    const supabase = await getSupabase();
    const dataInicio = new Date(ano, mes - 1, 1).toISOString();
    const dataFim = new Date(ano, mes, 1).toISOString();

    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .eq('status', 'Concluído')
      .gte('data_resolucao', dataInicio)
      .lt('data_resolucao', dataFim)
      .order('data_resolucao', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Chamado[];
  } catch (error: any) {
    console.error('Erro em obterTodosChamadosConcluidos:', error);
    throw new Error(`Não foi possível carregar os dados para exportação: ${error.message}`);
  }
}

/**
 * Finaliza um chamado atualizando o status, a resolução e data/hora atual.
 * @param id ID (uuid) do chamado.
 * @param resolucao Texto informando como o chamado foi concluído.
 * @returns O chamado atualizado.
 */
export async function finalizarChamado(id: string, resolucao: string, tempo_gasto: string) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('chamados')
      .update({ 
        status: 'Concluído', 
        resolucao,
        tempo_gasto,
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
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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

/**
 * Busca todos os chamados abertos pelo usuário logado atualmente.
 * Usado na tela "Meus Chamados".
 */
export async function obterMeusChamados() {
  try {
    const supabase = await getSupabase();
    
    // Pega a sessão atual para descobrir quem é o usuário
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Usuário não autenticado.');
    }
    
    const userId = sessionData.session.user.id;

    // Busca apenas os chamados onde user_id bate com o usuário atual
    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .eq('user_id', userId)
      .order('data_criacao', { ascending: false });

    if (error) {
      if (error.code === '42703') { // Column does not exist
         console.warn("A coluna user_id não existe no banco. Os dados retornarão vazios.");
         return [] as Chamado[];
      }
      throw error;
    }

    return data as Chamado[];
  } catch (error: any) {
    console.error('Erro em obterMeusChamados:', error);
    throw new Error(`Não foi possível carregar seus chamados: ${error.message}`);
  }
}
