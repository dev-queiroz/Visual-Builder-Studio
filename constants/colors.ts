export const AppColors = {
  primary: '#8B5CF6', // Vibrant Violet
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  cyan: '#06B6D4',
  accent: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',

  light: {
    background: '#F8FAFC',
    surface: 'rgba(255, 255, 255, 0.8)', // Glass effect base
    surfaceSecondary: '#F1F5F9',
    surfaceTertiary: '#E2E8F0',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    tint: '#8B5CF6',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#8B5CF6',
    cardShadow: 'rgba(0,0,0,0.05)',
    glassBackground: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
  },
  dark: {
    background: '#020617', // Deep Slate/Black
    surface: 'rgba(15, 23, 42, 0.8)', // Glass effect base
    surfaceSecondary: '#1E293B',
    surfaceTertiary: '#334155',
    border: '#1E293B',
    borderLight: '#334155',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#475569',
    tint: '#A78BFA',
    tabIconDefault: '#475569',
    tabIconSelected: '#A78BFA',
    cardShadow: 'rgba(0,0,0,0.3)',
    glassBackground: 'rgba(15, 23, 42, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

export default {
  light: AppColors.light,
  dark: AppColors.dark,
};
