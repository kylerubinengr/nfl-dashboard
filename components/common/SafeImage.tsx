"use client";

import Image from 'next/image';
import { useState } from 'react';
import { DEFAULT_NFL_LOGO } from '@/constants/teams';

interface SafeImageProps {
  src: string | undefined | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackClassName?: string;
  initials?: string;
  color?: string;
}

export const SafeImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  fallbackClassName,
  initials = '?',
  color = '#e2e8f0' 
}: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_NFL_LOGO);
  const [hasError, setHasError] = useState(!src);

  const handleError = () => {
    if (imgSrc !== DEFAULT_NFL_LOGO) {
      setImgSrc(DEFAULT_NFL_LOGO);
    }
  };

  if (hasError || !src) {
    return (
      <div 
        className={fallbackClassName}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '50%',
          fontSize: `${Math.min(width, height) / 2}px`
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
};
