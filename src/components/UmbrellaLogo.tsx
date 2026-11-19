import React from 'react';

interface UmbrellaLogoProps {
  size?: number;
  className?: string;
}

export const UmbrellaLogo: React.FC<UmbrellaLogoProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      aria-label="PT Umbrella Corp Logo"
    >
      {/* Background circle outline */}
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      
      {/* 8 Triangular alternating segments (Umbrella Octagon) */}
      {/* Segment 1: Top (White) */}
      <path d="M50 50 L50 2 A48 48 0 0 1 83.9 16.1 Z" fill="#FFFFFF" stroke="#BE123C" strokeWidth="0.5" />
      
      {/* Segment 2: Top-Right (Red) */}
      <path d="M50 50 L83.9 16.1 A48 48 0 0 1 98 50 Z" fill="#E11D48" />
      
      {/* Segment 3: Bottom-Right (White) */}
      <path d="M50 50 L98 50 A48 48 0 0 1 83.9 83.9 Z" fill="#FFFFFF" stroke="#BE123C" strokeWidth="0.5" />
      
      {/* Segment 4: Bottom (Red) */}
      <path d="M50 50 L83.9 83.9 A48 48 0 0 1 50 98 Z" fill="#E11D48" />
      
      {/* Segment 5: Bottom-Left (White) */}
      <path d="M50 50 L50 98 A48 48 0 0 1 16.1 83.9 Z" fill="#FFFFFF" stroke="#BE123C" strokeWidth="0.5" />
      
      {/* Segment 6: Left (Red) */}
      <path d="M50 50 L16.1 83.9 A48 48 0 0 1 2 50 Z" fill="#E11D48" />
      
      {/* Segment 7: Top-Left (White) */}
      <path d="M50 50 L2 50 A48 48 0 0 1 16.1 16.1 Z" fill="#FFFFFF" stroke="#BE123C" strokeWidth="0.5" />
      
      {/* Segment 8: Top-Left-Center (Red) */}
      <path d="M50 50 L16.1 16.1 A48 48 0 0 1 50 2 Z" fill="#E11D48" />
      
      {/* Center cap circle */}
      <circle cx="50" cy="50" r="10" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
    </svg>
  );
};
