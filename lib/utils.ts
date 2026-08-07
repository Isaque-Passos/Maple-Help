/**
 * Utilitários compartilhados do Maple Help.
 * Centraliza lógica duplicada em um único local.
 */

/**
 * Extrai o primeiro nome de um e-mail institucional.
 * Padrão esperado: nome.sobrenome@maplebeararaxa.com.br
 * 
 * @example extractFirstName('joao.silva@maplebeararaxa.com.br') → 'Joao'
 * @example extractFirstName('admin@maplebear.com') → 'Admin'
 */
export function extractFirstName(email: string): string {
  const beforeAt = email.split('@')[0];
  const firstName = beforeAt.split('.')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

/**
 * Retorna os e-mails autorizados para acessar o painel de administração.
 * Lê a partir das variáveis de ambiente.
 */
export function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || '';
  if (envEmails) {
    return envEmails.split(',').map(e => e.trim().toLowerCase());
  }
  
  // Sem fallback hardcoded por segurança em produção
  return [];
}

/**
 * Verifica se um e-mail pertence a um administrador.
 */
export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase());
}
