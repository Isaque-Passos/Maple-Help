import React from 'react';

interface CategoryCardProps {
  title: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export default function CategoryCard({ title, onClick, icon }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        group relative flex flex-col items-center justify-center p-8
        bg-white border border-gray-100 rounded-3xl
        shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]
        hover:shadow-[0_8px_30px_-5px_rgba(227,24,55,0.15)]
        hover:-translate-y-1.5
        transition-all duration-300 ease-out
        overflow-hidden w-full
      "
    >
      {/* Efeito de brilho/textura no fundo (visível apenas no hover) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-red-50/50 via-transparent to-transparent transition-opacity duration-500 pointer-events-none" />

      {/* Container do Ícone */}
      <div className="
        relative z-10 w-16 h-16 flex items-center justify-center rounded-2xl mb-4
        bg-red-50 text-red-600
        group-hover:bg-[#E31837] group-hover:text-white
        transition-colors duration-300
      ">
        {icon || (
          // Ícone SVG Genérico (Heroicons: Desktop Computer) caso nenhum seja passado
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        )}
      </div>

      {/* Texto */}
      <span className="
        relative z-10 text-lg font-bold text-slate-800
        group-hover:text-red-900
        transition-colors duration-300
      ">
        {title}
      </span>
    </button>
  );
}
