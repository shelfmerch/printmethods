import type { DpiQuality } from '@/types/editor';

interface DpiIndicatorProps {
  dpi: number;
  quality: DpiQuality;
  isStretched?: boolean;
  widthInches?: number;
  heightInches?: number;
  x: number;
  y: number;
}

const qualityConfig: Record<DpiQuality, { label: string; color: string; bg: string; dot: string }> = {
  excellent: { 
    label: 'High resolution', 
    color: 'text-green-600', 
    bg: 'bg-green-500/10 border-green-500/20',
    dot: 'bg-green-500'
  },
  acceptable: { 
    label: 'Medium resolution', 
    color: 'text-amber-600', 
    bg: 'bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-500'
  },
  low: { 
    label: 'Low resolution', 
    color: 'text-red-600', 
    bg: 'bg-red-500/10 border-red-500/20',
    dot: 'bg-red-500'
  },
};

export function DpiIndicator({ dpi, quality, isStretched, widthInches, heightInches, x, y }: DpiIndicatorProps) {
  const config = qualityConfig[quality];

  return (
    <div
      className={`absolute pointer-events-none z-[100] px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 flex items-center gap-2 ${config.bg}`}
      style={{ 
        left: `${x}px`, 
        top: `${y}px`, 
        transform: 'translate(-50%, -100%) translateY(-20px)',
      }}
    >
      {/* Status Dot */}
      <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${config.dot}`} />
      
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className={`font-bold text-xs ${config.color}`}>{dpi} DPI</span>
        <span className={`text-[10px] font-semibold opacity-80 ${config.color}`}>— {config.label}</span>
      </div>

      {/* {isStretched && (
        // <div className="border-l border-current/20 pl-2 ml-1">
        //   <span className="text-[9px] text-amber-700 font-bold uppercase tracking-tighter">
        //     Distorted
        //   </span>
        // </div>
      )} */}
    </div>
  );
}
