const primary = '#7C3AED';
const primaryLight = '#8B5CF6';
const cyan = '#06B6D4';

export const AppColors = {
  primary,
  primaryLight,
  primaryDark: '#6D28D9',
  cyan,
  accent: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',

  light: {
    background: '#F4F4F8',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0F0F6',
    surfaceTertiary: '#E8E8F0',
    border: '#E2E2EC',
    borderLight: '#EBEBF5',
    text: '#111128',
    textSecondary: '#5B5B7A',
    textTertiary: '#9494B0',
    tint: primary,
    tabIconDefault: '#9494B0',
    tabIconSelected: primary,
    cardShadow: 'rgba(0,0,0,0.08)',
  },
  dark: {
    background: '#0D0D1A',
    surface: '#16162A',
    surfaceSecondary: '#1E1E32',
    surfaceTertiary: '#262640',
    border: '#2A2A46',
    borderLight: '#222236',
    text: '#F0F0FF',
    textSecondary: '#9090C0',
    textTertiary: '#5A5A8A',
    tint: primaryLight,
    tabIconDefault: '#5A5A8A',
    tabIconSelected: primaryLight,
    cardShadow: 'rgba(0,0,0,0.4)',
  },
};

export default {
  light: AppColors.light,
  dark: AppColors.dark,
};
