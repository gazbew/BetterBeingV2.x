import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
  priority?: boolean;
}

/**
 * Optimized image component with lazy loading, error handling, and loading states
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallback = '/api/placeholder/400/300',
  priority = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Generate optimized image URLs for different screen sizes
  const generateSrcSet = (baseSrc: string, width?: number) => {
    if (!width) return undefined;
    
    return [
      `${baseSrc}?w=${width}&q=75 1x`,
      `${baseSrc}?w=${width * 2}&q=75 2x`,
    ].join(', ');
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && (
        <Skeleton 
          className="absolute inset-0 w-full h-full" 
          style={{ width: width || '100%', height: height || '200px' }}
        />
      )}
      
      <img
        src={hasError ? fallback : src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        srcSet={!hasError ? generateSrcSet(src, width) : undefined}
        sizes={width ? `${width}px` : '100vw'}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
