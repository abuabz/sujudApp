export const typography = {
  fonts: {
    primary: 'Stapel-SemiExpanded',
    regular: 'Stapel-SemiExpanded',
    medium: 'Stapel-SemiExpanded',
    bold: 'Stapel-SemiExpanded',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export type Typography = typeof typography;
