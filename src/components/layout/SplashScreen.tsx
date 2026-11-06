import React, { useEffect, useState } from 'react';
import { EmergenxLogo } from '../brand/EmergenxLogo';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Initializing urban road network graph...');

  useEffect(() => {
    const steps = [
      { at: 20, text: 'Synchronizing arterial traffic signal phases...' },
      { at: 45, text: 'Connecting authorized emergency fleet transponders...' },
      { at: 70, text: 'Calibrating multi-factor route scoring engine...' },
      { at: 90, text: 'Establishing Google Routes & offline OSRM solvers...' },
      { at: 100, text: 'Fleet Command Center Ready.' },
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        const currentStep = steps.find((s) => s.at >= next);
        if (currentStep) {
          setStepText(currentStep.text);
        }
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F5F7F9] text-[#292D32] p-6 selection:bg-[#32B8BF] selection:text-white">
      {/* Background subtle dots */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center bg-white p-8 rounded-3xl border border-[#E6EAEE] shadow-xl">
        {/* Brand Logo with gentle scale entrance */}
        <div className="mb-6 transform transition-transform duration-700 hover:scale-105">
          <EmergenxLogo size="xl" showTagline={true} />
        </div>

        {/* Tagline */}
        <h2 className="text-base font-bold tracking-tight text-[#292D32] mb-1">
          Intelligent Fleet Coordination & Green Wave Dispatch
        </h2>
        <p className="text-xs font-semibold text-[#0A699F] mb-6 font-mono">
          Every Emergency. Every Second. Every Road.
        </p>

        {/* Loading Progress Bar */}
        <div className="w-full bg-[#F5F7F9] border border-[#E6EAEE] rounded-full h-2.5 overflow-hidden mb-3 p-0.5">
          <div
            className="bg-gradient-to-r from-[#32B8BF] to-[#16A4E8] h-full rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Text & Percentage */}
        <div className="flex items-center justify-between w-full text-xs font-mono text-[#858F99] mb-6">
          <span className="truncate pr-2">{stepText}</span>
          <span className="text-[#292D32] font-bold tabular-nums shrink-0">{progress}%</span>
        </div>

        {/* Skip button for quick evaluation */}
        <button
          onClick={onComplete}
          className="text-xs text-[#0A699F] hover:text-[#0A699F]/80 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
        >
          Skip initialization and enter dashboard
        </button>
      </div>

      {/* Footer System Badge */}
      <div className="absolute bottom-6 text-center text-[11px] text-[#858F99] font-mono">
        EMERGENX Enterprise Fleet Dashboard · Connected to Google Routes API & Simulation Engine
      </div>
    </div>
  );
};
