import React from 'react';

interface LogoProps {
  className?: string;
  size?: string;
}

export default function Logo({ className = "w-9 h-9", size = "w-6 h-6" }: LogoProps) {
  return (
    <div className={`${className} rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 shadow-lg shadow-violet-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
      <svg className={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left User - Hollow/Outline */}
        <circle cx="32" cy="52" r="14" stroke="white" strokeWidth="7" />
        <path d="M12 88C12 76 20 68 32 68C44 68 52 76 52 88" stroke="white" strokeWidth="7" strokeLinecap="round" />
        
        {/* Right User - Solid/Filled */}
        <circle cx="68" cy="28" r="17" fill="white" />
        <path d="M50 62C50 48 58 40 68 40C78 40 86 48 86 62" fill="white" />
      </svg>
    </div>
  );
}
