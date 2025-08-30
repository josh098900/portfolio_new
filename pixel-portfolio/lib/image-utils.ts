/**
 * Image utility functions for optimized asset handling
 */

/**
 * Generate optimized image props for next/image
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
}

/**
 * Get optimized image props with default settings
 */
export const getOptimizedImageProps = (
  src: string,
  alt: string,
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps => {
  return {
    src,
    alt,
    placeholder: 'empty',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    ...options,
  };
};

/**
 * Generate placeholder blur data URL for pixel art style
 */
export const generatePixelBlurDataURL = (
  width: number = 8,
  height: number = 8,
  color: string = '#1a1a2e'
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

/**
 * Common image sizes for the portfolio
 */
export const IMAGE_SIZES = {
  avatar: { width: 200, height: 200 },
  projectCard: { width: 400, height: 300 },
  projectHero: { width: 800, height: 600 },
  skillIcon: { width: 64, height: 64 },
  thumbnail: { width: 150, height: 150 },
} as const;

/**
 * Get responsive image sizes string
 */
export const getResponsiveSizes = (breakpoints: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string => {
  const { mobile = '100vw', tablet = '50vw', desktop = '33vw' } = breakpoints;
  return `(max-width: 768px) ${mobile}, (max-width: 1200px) ${tablet}, ${desktop}`;
};

/**
 * Asset path helpers
 */
export const ASSET_PATHS = {
  images: '/images',
  icons: '/icons',
  sprites: '/sprites',
  projects: '/images/projects',
  skills: '/icons/skills',
} as const;

/**
 * Get full asset path
 */
export const getAssetPath = (
  category: keyof typeof ASSET_PATHS,
  filename: string
): string => {
  return `${ASSET_PATHS[category]}/${filename}`;
};

/**
 * Check if image exists (client-side only)
 */
export const checkImageExists = async (src: string): Promise<boolean> => {
  if (typeof window === 'undefined') return true;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

/**
 * Get fallback image path
 */
export const getFallbackImage = (type: 'project' | 'avatar' | 'skill'): string => {
  switch (type) {
    case 'project':
      return '/images/placeholder-project.svg';
    case 'avatar':
      return '/images/pixelavatar.png';
    case 'skill':
      return '/icons/skills/default.svg';
    default:
      return '/images/placeholder-project.svg';
  }
};