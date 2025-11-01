import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
          <stop offset="100%" style={{ stopColor: '#6366f1' }} />
        </linearGradient>
      </defs>
      <path
        fill="url(#logoGradient)"
        d="M100 0L186.6 50v100L100 200l-86.6-50V50L100 0z"
      />
      <path
        fill="#fff"
        d="M140 50 H80 L80 75 H130 L130 95 H80 L80 120 H140 L140 145 H60 L60 50 Z"
        transform="translate(0, 2)"
      />
    </svg>
  );
};