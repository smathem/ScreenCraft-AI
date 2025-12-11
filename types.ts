export type FrameStyle = 'none' | 'macos-dark' | 'macos-light' | 'glass';
export type BackgroundPattern = 'none' | 'dots' | 'grid';

export interface PromoConfig {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient';
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: 'to-r' | 'to-b' | 'to-br';
  backgroundPattern: BackgroundPattern;
  
  // Image properties
  imageScale: number; // 0.1 to 1.5 (relative to "fit")
  imageRadius: number;
  imageShadow: number;
  imageOffset: { x: number; y: number }; // Offset from center
  imageRotation: number; // -15 to 15 degrees
  frameStyle: FrameStyle;

  // Text properties
  title: string;
  titleFontSize: number;
  titleOffset: { x: number; y: number }; // Offset from center

  subtitle: string;
  subtitleFontSize: number;
  subtitleOffset: { x: number; y: number }; // Offset from center
  
  textColor: string;
  fontFamily: string;
  showText: boolean;
}

export interface GeneratedMetadata {
  title: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
}

export const PRESETS = {
  'twitter': { width: 1600, height: 900, label: 'Twitter / X (16:9)' },
  'instagram-sq': { width: 1080, height: 1080, label: 'Instagram Square (1:1)' },
  'instagram-port': { width: 1080, height: 1350, label: 'Instagram Portrait (4:5)' },
  'dribbble': { width: 1600, height: 1200, label: 'Dribbble Shot (4:3)' },
  'producthunt': { width: 1270, height: 760, label: 'Product Hunt' },
  'youtube': { width: 1920, height: 1080, label: 'YouTube Thumbnail' },
};

export const DEFAULT_CONFIG: PromoConfig = {
  width: 1600,
  height: 900,
  backgroundColor: '#3b82f6',
  backgroundType: 'gradient',
  gradientStart: '#4f46e5', // Indigo 600
  gradientEnd: '#ec4899',   // Pink 500
  gradientDirection: 'to-br',
  backgroundPattern: 'dots',
  
  imageScale: 0.85,
  imageRadius: 12,
  imageShadow: 80,
  imageOffset: { x: 0, y: 50 },
  imageRotation: 0,
  frameStyle: 'macos-dark',

  title: 'Showcase Your Work',
  titleFontSize: 64,
  titleOffset: { x: 0, y: -300 }, // Positioned higher up relative to center

  subtitle: 'Transform screenshots into professional assets',
  subtitleFontSize: 32,
  subtitleOffset: { x: 0, y: -240 },

  textColor: '#ffffff',
  fontFamily: 'Inter',
  showText: true,
};