import React from 'react';

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

export const AlignTopIcon: React.FC<IconProps> = ({ className, strokeWidth = 2 }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16" />
    <path d="m8 12 4-4 4 4" />
    <path d="M12 20V8" />
  </svg>
);

export const AlignMiddleIcon: React.FC<IconProps> = ({ className, strokeWidth = 2 }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12h16" />
    <path d="m8 6 4 4 4-4" />
    <path d="m8 18 4-4 4 4" />
  </svg>
);

export const AlignBottomIcon: React.FC<IconProps> = ({ className, strokeWidth = 2 }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 20h16" />
    <path d="M12 4v12" />
    <path d="m8 12 4 4 4-4" />
  </svg>
);
