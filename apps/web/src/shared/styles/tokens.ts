/**
 * Design Tokens for HomeChef
 * Centralized design values for consistency across the app
 */

// Color palette
export const colors = {
  // Brand orange - Primary CTA and brand identity
  brand: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  // Spice red - For accents and warnings
  spice: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  // Fresh green - For success states
  fresh: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
  },
  // Golden - For ratings and premium elements
  golden: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  // Cream - For backgrounds
  cream: {
    50: '#fffbf5',
    100: '#fef7ed',
    200: '#fdf2e3',
  },
} as const;

// Typography scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    display: ['Playfair Display', 'Georgia', 'serif'],
    accent: ['Caveat', 'cursive'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Spacing scale (8px base)
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  18: '4.5rem',    // 72px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
} as const;

// Border radius scale
export const borderRadius = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
  '3xl': '1.5rem',
  '4xl': '2rem',
  full: '9999px',
} as const;

// Shadow scale - Premium soft shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  // Premium soft shadows
  'soft-sm': '0 2px 8px -2px rgb(0 0 0 / 0.08)',
  'soft-md': '0 4px 16px -4px rgb(0 0 0 / 0.1)',
  'soft-lg': '0 8px 24px -6px rgb(0 0 0 / 0.12)',
  'soft-xl': '0 16px 40px -8px rgb(0 0 0 / 0.15)',
  'soft-2xl': '0 24px 56px -12px rgb(0 0 0 / 0.18)',
  // Card shadows
  card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.02)',
  'card-hover': '0 8px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -2px rgb(0 0 0 / 0.04)',
  // Elevated
  elevated: '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
  'elevated-lg': '0 12px 32px -4px rgb(0 0 0 / 0.12), 0 4px 8px -2px rgb(0 0 0 / 0.06)',
  // Modal
  modal: '0 24px 48px -12px rgb(0 0 0 / 0.2), 0 12px 24px -8px rgb(0 0 0 / 0.1)',
  // Glow
  'glow-brand': '0 0 24px -4px rgb(249 115 22 / 0.35)',
  'glow-golden': '0 0 24px -4px rgb(251 191 36 / 0.35)',
} as const;

// Animation timing functions
export const easing = {
  // Premium smooth easing - best for most UI interactions
  premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
  // Bounce easing - for playful interactions
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Smooth easing - for subtle transitions
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Linear
  linear: 'linear',
  // Standard easing
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Animation durations
export const durations = {
  instant: '0ms',
  fast: '150ms',
  normal: '200ms',
  moderate: '300ms',
  slow: '400ms',
  slower: '500ms',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

// Breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Icon sizes
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      xs: '1.75rem',   // 28px
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '2.75rem',   // 44px
      xl: '3rem',      // 48px
    },
    padding: {
      xs: '0 0.5rem',
      sm: '0 0.75rem',
      md: '0 1rem',
      lg: '0 1.25rem',
      xl: '0 1.5rem',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '0.875rem',
      lg: '1rem',
      xl: '1rem',
    },
    borderRadius: '0.75rem', // rounded-lg
  },
  card: {
    padding: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
    borderRadius: '1.25rem', // rounded-2xl
  },
  input: {
    height: {
      sm: '2.25rem',  // 36px
      md: '2.5rem',   // 40px
      lg: '2.75rem',  // 44px
    },
    padding: {
      sm: '0 0.75rem',
      md: '0 1rem',
      lg: '0 1.25rem',
    },
    borderRadius: '0.5rem', // rounded-md
  },
  avatar: {
    size: {
      xs: '1.5rem',   // 24px
      sm: '2rem',     // 32px
      md: '2.5rem',   // 40px
      lg: '3rem',     // 48px
      xl: '4rem',     // 64px
      '2xl': '5rem',  // 80px
    },
  },
  badge: {
    height: {
      sm: '1.25rem',  // 20px
      md: '1.5rem',   // 24px
      lg: '1.75rem',  // 28px
    },
    padding: {
      sm: '0 0.5rem',
      md: '0 0.625rem',
      lg: '0 0.75rem',
    },
    fontSize: {
      sm: '0.625rem', // 10px
      md: '0.75rem',  // 12px
      lg: '0.875rem', // 14px
    },
    borderRadius: '9999px', // rounded-full
  },
} as const;

// Export all tokens
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  easing,
  durations,
  zIndex,
  breakpoints,
  iconSizes,
  components,
} as const;

export default tokens;
