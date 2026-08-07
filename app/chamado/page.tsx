'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { abrirChamado } from '../actions/chamados';
import { supabase } from '@/lib/supabase';
import { extractFirstName } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/components/ToastProvider';

export default function ChamadoPage() {
  usePageTitle('Abrir Chamado');
  const router = useRouter();
  const { addToast } = useToast();
  const [solicitante, setSolicitante] = useState('');
  const [local, setLocal] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [anexo, setAnexo] = useState<File | null>(null);

  // Estado de validação inline (#6)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isFieldInvalid = (field: string, value: string) => touched[field] && !value.trim();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setPrimeiroNome(extractFirstName(session.user.email));
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let anexo_url = null;
      
      if (anexo) {
        // Validação client-side do anexo
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (anexo.size > MAX_FILE_SIZE) {
          throw new Error('O arquivo excede o limite de 5MB.');
        }

        if (!validTypes.includes(anexo.type)) {
          throw new Error('Formato inválido. Use JPEG, PNG ou WEBP.');
        }

        // Criar um nome único para o arquivo
        const fileExt = anexo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chamados-anexos')
          .upload(fileName, anexo);
          
        if (uploadError) {
          throw new Error('Erro ao fazer upload da imagem: ' + uploadError.message);
        }
        
        // Salvamos apenas o caminho do arquivo, e não a URL pública, 
        // já que agora usamos um bucket privado e URLs assinadas.
        anexo_url = fileName;
      }

      try {
        await abrirChamado({ solicitante, local, categoria, descricao, anexo_url });
      } catch (chamadoError: unknown) {
        // Se a criação do chamado falhar, deleta o anexo (evita arquivos órfãos)
        if (anexo_url) {
          await supabase.storage.from('chamados-anexos').remove([anexo_url]);
        }
        throw chamadoError;
      }
      
      // Feedback de sucesso com modal customizado
      setShowSuccess(true);
      
      // Limpar todos os campos para o próximo uso
      setSolicitante('');
      setLocal('');
      setCategoria('');
      setDescricao('');
      setAnexo(null);
      setTouched({});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao abrir o chamado.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const MAX_DESC = 500;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/menu')}
          className="mb-8 flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar para o Menu
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
          {/* Cabeçalho responsivo (#11) */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between relative mb-10 mt-2 gap-4">
            {/* Título */}
            <div className="flex flex-col z-10 text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-[#E31837] tracking-tight">
                Maple Help
              </h1>
              <p className="text-gray-500 font-medium mt-1">Central de Suporte TI</p>
            </div>

            {/* Mascote e Balão — responsivo (#11) */}
            <div className="relative flex items-center">
              {/* Balão de Fala — oculto em mobile, visível em md+ */}
              <div className="hidden md:block absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-red-50 border border-red-100 rounded-2xl rounded-tr-none shadow-sm px-4 py-3 min-w-[200px]">
                <p className="text-slate-800 font-medium text-sm leading-relaxed">
                  {primeiroNome ? `Olá, ${primeiroNome}! Qual o problema de hoje?` : 'Olá! Qual o problema de hoje?'}
                </p>
                {/* Seta do balão (Triângulo) */}
                <div className="absolute top-0 -right-2 w-0 h-0 border-t-[10px] border-t-red-50 border-r-[10px] border-r-transparent"></div>
              </div>

              {/* Imagem do Mascote */}
              <div className="relative z-10 md:translate-x-4">
                <Image 
                  src="/maple_bear_chamado_02.png" 
                  alt="Mascote Maple Bear" 
                  width={140} 
                  height={140} 
                  className="object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Saudação mobile — visível apenas em telas pequenas (#11) */}
            <p className="md:hidden text-sm text-slate-700 font-medium text-center bg-red-50 border border-red-100 rounded-xl px-4 py-2 w-full">
              {primeiroNome ? `Olá, ${primeiroNome}! Qual o problema de hoje?` : 'Olá! Qual o problema de hoje?'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700 mb-1">
              Solicitante <span className="text-[#E31837]">*</span>
            </label>
            <input
              id="solicitante"
              type="text"
              required
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, solicitante: true }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-500 ${
                isFieldInvalid('solicitante', solicitante) ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Nome do professor ou funcionário"
            />
            {isFieldInvalid('solicitante', solicitante) && (
              <p className="text-xs text-red-500 mt-1 font-medium">Este campo é obrigatório</p>
            )}
          </div>

          <div>
            <label htmlFor="local" className="block text-sm font-medium text-gray-700 mb-1">
              Local / Sala <span className="text-[#E31837]">*</span>
            </label>
            <input
              id="local"
              type="text"
              required
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, local: true }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-500 ${
                isFieldInvalid('local', local) ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ex: Secretaria, Sala de movimento..."
            />
            {isFieldInvalid('local', local) && (
              <p className="text-xs text-red-500 mt-1 font-medium">Este campo é obrigatório</p>
            )}
          </div>

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria <span className="text-[#E31837]">*</span>
            </label>
            <select
              id="categoria"
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, categoria: true }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-colors bg-white text-gray-900 ${
                isFieldInvalid('categoria', categoria) ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="" disabled>Selecione uma categoria</option>
              <option value="Wi-fi | Cabeamento">Wi-fi | Cabeamento</option>
              <option value="Computador | Notebook">Computador | Notebook</option>
              <option value="Televisão | Som">Televisão | Som</option>
              <option value="Ajuda | Duvidas">Ajuda | Duvidas</option>
              <option value="Outros">Outros</option>
            </select>
            {isFieldInvalid('categoria', categoria) && (
              <p className="text-xs text-red-500 mt-1 font-medium">Selecione uma categoria</p>
            )}
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Problema <span className="text-[#E31837]">*</span>
            </label>
            <textarea
              id="descricao"
              required
              rows={4}
              maxLength={MAX_DESC}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, descricao: true }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:border-transparent transition-colors resize-none text-gray-900 placeholder:text-gray-500 ${
                isFieldInvalid('descricao', descricao) ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Descreva com detalhes o problema que está ocorrendo..."
            ></textarea>
            <div className="flex justify-between items-center mt-1">
              {isFieldInvalid('descricao', descricao) ? (
                <p className="text-xs text-red-500 font-medium">Este campo é obrigatório</p>
              ) : (
                <span />
              )}
              <span className={`text-xs font-medium ${descricao.length > MAX_DESC * 0.9 ? 'text-amber-600' : 'text-gray-400'}`}>
                {descricao.length}/{MAX_DESC}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="anexo" className="block text-sm font-medium text-gray-700 mb-1">
              Anexo <span className="text-gray-400 text-xs font-normal ml-1">- Opcional</span>
            </label>
            <div className="relative">
              <input
                id="anexo"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (file.size > 5 * 1024 * 1024) {
                      addToast('O arquivo excede o limite de 5MB.', 'error');
                      return;
                    }
                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                      addToast('Formato inválido. Use JPEG, PNG ou WEBP.', 'error');
                      return;
                    }
                    setAnexo(file);
                  }
                }}
              />
              <label
                htmlFor="anexo"
                className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:border-[#E31837] hover:text-[#E31837] cursor-pointer transition-all"
              >
                {anexo ? (
                  <span className="flex items-center gap-2 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Arquivo selecionado: {anexo.name}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Clique aqui para anexar uma foto ou print
                  </span>
                )}
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Envie uma foto ou print da tela mostrando o problema para ajudar a TI.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E31837] text-white font-semibold py-3 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31837] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : 'Abrir Chamado'}
          </button>
        </form>
      </div>
      </div>
      
      {/* Modal de Sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center mx-auto mb-6">
              <Image 
                src="/maple_bear_concluido.png" 
                alt="Chamado Concluído" 
                width={180} 
                height={180} 
                className="object-contain drop-shadow-sm"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Tudo Certo!</h2>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed">
              Seu chamado foi aberto com sucesso. A equipe de TI já foi notificada e irá te atender em breve.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
