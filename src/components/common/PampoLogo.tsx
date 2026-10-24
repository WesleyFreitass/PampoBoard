import React from 'react';

interface PampoLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  withText?: boolean;
  withFrame?: boolean;
  textSubtitle?: string;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: { box: 'w-6 h-6', textSize: 'text-sm' },
  sm: { box: 'w-8 h-8', textSize: 'text-base' },
  md: { box: 'w-10 h-10', textSize: 'text-lg' },
  lg: { box: 'w-12 h-12', textSize: 'text-xl' },
  xl: { box: 'w-16 h-16', textSize: 'text-2xl' },
  '2xl': { box: 'w-20 h-20', textSize: 'text-3xl' },
};

export const PampoLogo: React.FC<PampoLogoProps> = ({
  size = 'md',
  withText = false,
  withFrame = false,
  textSubtitle,
  className = '',
  onClick,
}) => {
  const currentSize = typeof size === 'string' ? sizeMap[size] || sizeMap.md : null;
  const customStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  const logoIcon = (
    <div
      style={customStyle}
      className={`relative inline-flex items-center justify-center transition-all duration-200 select-none flex-shrink-0 ${
        currentSize ? currentSize.box : ''
      } ${
        withFrame
          ? 'rounded-xl bg-[#0e0f14] border border-white/10 shadow-lg shadow-black/50'
          : 'bg-transparent'
      } ${className}`}
    >
      <img
        src="/pampo-logo.png"
        alt="PampoBoard Logo"
        className="w-full h-full object-contain pointer-events-none drop-shadow-sm filter"
        loading="eager"
      />
    </div>
  );

  if (!withText) {
    return onClick ? (
      <button
        type="button"
        onClick={onClick}
        className="group inline-flex items-center justify-center focus:outline-none transition-transform hover:scale-105 active:scale-95"
      >
        {logoIcon}
      </button>
    ) : (
      logoIcon
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 group select-none ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
    >
      {logoIcon}
      <div className="flex flex-col text-left">
        <div className={`font-black tracking-tight leading-none ${currentSize?.textSize || 'text-lg'} text-current`}>
          <span>Pampo</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 ml-1">
            Board
          </span>
        </div>
        {textSubtitle && (
          <span className="text-[10px] font-semibold text-neutral-400 tracking-wider uppercase mt-1">
            {textSubtitle}
          </span>
        )}
      </div>
    </div>
  );
};
