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
  xs: { box: 'w-6 h-6', rounded: 'rounded-md', textSize: 'text-sm' },
  sm: { box: 'w-8 h-8', rounded: 'rounded-lg', textSize: 'text-base' },
  md: { box: 'w-10 h-10', rounded: 'rounded-xl', textSize: 'text-lg' },
  lg: { box: 'w-12 h-12', rounded: 'rounded-xl', textSize: 'text-xl' },
  xl: { box: 'w-16 h-16', rounded: 'rounded-2xl', textSize: 'text-2xl' },
  '2xl': { box: 'w-20 h-20', rounded: 'rounded-3xl', textSize: 'text-3xl' },
};

export const PampoLogo: React.FC<PampoLogoProps> = ({
  size = 'md',
  withText = false,
  withFrame = true,
  textSubtitle,
  className = '',
  onClick,
}) => {
  const currentSize = typeof size === 'string' ? sizeMap[size] || sizeMap.md : null;
  const customStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  const logoIcon = (
    <div
      style={customStyle}
      className={`relative overflow-hidden transition-all duration-200 select-none ${
        currentSize ? currentSize.box : ''
      } ${
        withFrame
          ? `${currentSize?.rounded || 'rounded-xl'} bg-[#0e0f14] border border-white/10 shadow-lg shadow-black/50 group-hover:border-cyan-500/40 group-hover:shadow-cyan-500/10`
          : ''
      } ${className}`}
    >
      <img
        src="/pampo-logo.jpg"
        alt="PampoBoard Logo"
        className="w-full h-full object-cover scale-105 pointer-events-none"
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
      className={`inline-flex items-center gap-3 group select-none ${onClick ? 'cursor-pointer' : ''}`}
    >
      {logoIcon}
      <div className="flex flex-col text-left">
        <div className={`font-black tracking-tight leading-none ${currentSize?.textSize || 'text-lg'} text-white`}>
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
