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
 * E-mails autorizados para acessar o painel de administração.
 * Centralizado para evitar divergência entre client e server.
 */
export const ADMIN_EMAILS = [
  'isaque.santos@maplebeararaxa.com.br',
  'jose.reis@maplebeararaxa.com.br',
  'pedro.ashidani@maplebeararaxa.com.br'
];

/**
 * Verifica se um e-mail pertence a um administrador.
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
