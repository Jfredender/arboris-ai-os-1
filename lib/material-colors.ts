
/**
 * Material Design 3 Color System
 * Google Dark Theme Palette
 */

export const materialColors = {
  // Surface colors (elevation system)
  surface: {
    base: '#121212',
    elevated1: '#1E1E1E',
    elevated2: '#2C2C2C',
    elevated3: '#383838',
  },

  // Primary colors
  primary: {
    main: '#8AB4F8', // Google Blue 300
    light: '#A8C7FA',
    dark: '#669DF6',
    container: '#1E3A5F',
  },

  // Secondary colors (botanical theme)
  secondary: {
    main: '#81C995', // Soft green
    light: '#A3D9B1',
    dark: '#5FB87A',
    container: '#1E3B28',
  },

  // Text colors
  text: {
    primary: '#E8EAED', // 95% opacity
    secondary: '#9AA0A6', // 60% opacity
    disabled: '#5F6368', // 38% opacity
  },

  // Utility colors
  divider: '#3C4043',
  error: '#F28B82',
  warning: '#FDD663',
  success: '#81C995',
  info: '#8AB4F8',

  // Glassmorphism
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
  },
};

/**
 * Material Design 3 Elevation System
 */
export const elevation = {
  none: 'shadow-none',
  level1: 'shadow-[0_1px_2px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.15)]',
  level2: 'shadow-[0_1px_5px_rgba(0,0,0,0.3),0_2px_2px_rgba(0,0,0,0.15)]',
  level3: 'shadow-[0_1px_8px_rgba(0,0,0,0.3),0_3px_4px_rgba(0,0,0,0.15)]',
  level4: 'shadow-[0_2px_12px_rgba(0,0,0,0.3),0_4px_5px_rgba(0,0,0,0.15)]',
  level5: 'shadow-[0_4px_16px_rgba(0,0,0,0.3),0_6px_6px_rgba(0,0,0,0.15)]',
};

/**
 * Material Design 3 Animation Tokens
 */
export const motion = {
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    decelerated: 'cubic-bezier(0.0, 0.0, 0, 1.0)',
    accelerated: 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
  },
};

/**
 * Material Design 3 Typography Scale
 */
export const typography = {
  displayLarge: 'text-[57px] leading-[64px] font-normal',
  displayMedium: 'text-[45px] leading-[52px] font-normal',
  displaySmall: 'text-[36px] leading-[44px] font-normal',
  headlineLarge: 'text-[32px] leading-[40px] font-normal',
  headlineMedium: 'text-[28px] leading-[36px] font-normal',
  headlineSmall: 'text-[24px] leading-[32px] font-normal',
  titleLarge: 'text-[22px] leading-[28px] font-medium',
  titleMedium: 'text-[16px] leading-[24px] font-medium',
  titleSmall: 'text-[14px] leading-[20px] font-medium',
  bodyLarge: 'text-[16px] leading-[24px] font-normal',
  bodyMedium: 'text-[14px] leading-[20px] font-normal',
  bodySmall: 'text-[12px] leading-[16px] font-normal',
  labelLarge: 'text-[14px] leading-[20px] font-medium',
  labelMedium: 'text-[12px] leading-[16px] font-medium',
  labelSmall: 'text-[11px] leading-[16px] font-medium',
};

/**
 * Material Design 3 Shape System
 */
export const shape = {
  none: 'rounded-none',
  extraSmall: 'rounded-[4px]',
  small: 'rounded-[8px]',
  medium: 'rounded-[12px]',
  large: 'rounded-[16px]',
  extraLarge: 'rounded-[28px]',
  full: 'rounded-full',
};

/**
 * Material Design 3 State Layer Opacity
 */
export const stateLayer = {
  hover: 0.08,
  focus: 0.12,
  pressed: 0.12,
  dragged: 0.16,
};
