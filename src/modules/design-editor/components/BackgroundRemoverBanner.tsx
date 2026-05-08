import React, { useState } from 'react';
import { X, Crown, Eraser } from 'lucide-react';

interface BackgroundRemoverBannerProps {
  onClick: () => void;
}

export function BackgroundRemoverBanner({ onClick }: BackgroundRemoverBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className="relative flex items-center gap-3 p-3 bg-slate-100 rounded-lg border cursor-pointer hover:bg-slate-200 transition-colors mb-4 group"
      onClick={onClick}
    >
      <button 
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Icon/Thumbnail area */}
      <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
        {/* We simulate the half-bg / half-transparent effect */}
        <div className="absolute inset-0 bg-blue-100 w-1/2"></div>
        <div 
          className="absolute inset-0 w-1/2 left-1/2" 
          style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 0)', backgroundSize: '4px 4px' }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Eraser className="w-4 h-4 text-slate-700 drop-shadow-md" />
        </div>
      </div>

      {/* Text area */}
      <div className="flex flex-col pr-2">
        <div className="flex items-center gap-1.5 line-clamp-1">
          <Crown className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
          <span className="font-semibold text-xs text-slate-800">Background Remover</span>
        </div>
        <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
          Remove the background of your imag...
        </div>
      </div>
    </div>
  );
}
