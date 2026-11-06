import React from 'react';

export const EmergenxLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; showTagline?: boolean }> = ({
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Modern Connected Mobility Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-[#32B8BF] to-[#16A4E8] p-1.5 shadow-sm text-white ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer shield/hexagon shape */}
          <path
            d="M50 8 L85 24 V54 C85 75 50 92 50 92 C50 92 15 75 15 54 V24 L50 8Z"
            fill="white"
            fillOpacity="0.18"
            stroke="white"
            strokeWidth="5"
          />
          {/* Synchronized arterial green wave crossroads */}
          <path
            d="M50 20 V80 M20 50 H80"
            stroke="white"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {/* Signal node beacons */}
          <circle cx="50" cy="50" r="10" fill="white" />
          <circle cx="50" cy="50" r="4.5" fill="#FE595B" />
          <circle cx="50" cy="24" r="3.5" fill="white" />
          <circle cx="76" cy="50" r="3.5" fill="white" />
          <circle cx="50" cy="76" r="3.5" fill="white" />
          <circle cx="24" cy="50" r="3.5" fill="white" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-[#292D32] ${textSizes[size]}`}>
            EMERGEN<span className="text-[#32B8BF]">X</span>
          </span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] border border-[#E6EAEE] uppercase tracking-wider">
            FLEET
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-[#858F99] font-medium tracking-normal mt-0.5">
            AI Multi-Emergency Mobility & Coordination
          </span>
        )}
      </div>
    </div>
  );
};
