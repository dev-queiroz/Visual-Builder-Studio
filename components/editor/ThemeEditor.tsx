import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Switch,
  Alert,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProjectTheme, DEFAULT_THEME } from '@/types';
import { AppColors } from '@/constants/colors';

const PRESET_COLORS = [
  '#7C3AED', '#6366F1', '#3B82F6', '#06B6D4', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#F97316', '#8B5CF6',
  '#111128', '#1E1B4B', '#064E3B', '#1C1917', '#0F172A',
  '#FFFFFF', '#F4F4F8', '#F0FDF4', '#FFFBEB', '#FFF5F5',
];

const PRESET_THEMES = [
  { name: 'Violet', primary: '#7C3AED', secondary: '#06B6D4', bg: '#F4F4F8', surface: '#FFFFFF', text: '#111128' },
  { name: 'Ocean', primary: '#0EA5E9', secondary: '#6366F1', bg: '#F0F9FF', surface: '#FFFFFF', text: '#0C4A6E' },
  { name: 'Emerald', primary: '#10B981', secondary: '#F59E0B', bg: '#F0FDF4', surface: '#FFFFFF', text: '#064E3B' },
  { name: 'Sunset', primary: '#F97316', secondary: '#EF4444', bg: '#FFF7ED', surface: '#FFFFFF', text: '#431407' },
  { name: 'Midnight', primary: '#818CF8', secondary: '#34D399', bg: '#0F172A', surface: '#1E293B', text: '#F1F5F9' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#A855F7', bg: '#FFF1F2', surface: '#FFFFFF', text: '#881337' },
];

interface ColorRowProps {
  label: string;
  value: string;
  onPress: () => void;
  isDark: boolean;
}

function ColorRow({ label, value, onPress, isDark }: ColorRowProps) {
  const theme = isDark ? AppColors.dark : AppColors.light;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.colorRow, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
      activeOpacity={0.8}
    >
      <View style={[styles.colorDot, { backgroundColor: value }]} />
      <Text style={[styles.colorLabel, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.colorHex, { color: theme.textSecondary }]}>{value}</Text>
      <MaterialIcons name="chevron-right" size={18} color={theme.textTertiary} />
    </TouchableOpacity>
  );
}

interface ColorPickerModalProps {
  visible: boolean;
  label: string;
  value: string;
  onClose: () => void;
  onChange: (color: string) => void;
}

function ColorPickerModal({ visible, label, value, onClose, onChange }: ColorPickerModalProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlayFull} activeOpacity={1} onPress={onClose}>
        <View style={[styles.colorPickerModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.colorPickerTitle, { color: theme.text }]}>{label}</Text>
          <View style={styles.swatchGrid}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => { onChange(c); onClose(); }}
                style={[
                  styles.swatch,
                  { backgroundColor: c, borderColor: c === value ? AppColors.primary : 'transparent', borderWidth: 3 },
                ]}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface Props {
  visible: boolean;
  theme: ProjectTheme;
  onClose: () => void;
  onChange: (theme: Partial<ProjectTheme>) => void;
  onApplyToAll: () => void;
}

export default function ThemeEditor({ visible, theme: projectTheme, onClose, onChange, onApplyToAll }: Props) {
  const isDark = useColorScheme() === 'dark';
  const appTheme = isDark ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();
  const [colorPicker, setColorPicker] = useState<keyof ProjectTheme | null>(null);

  const t = projectTheme ?? DEFAULT_THEME;

  const handlePreset = (preset: (typeof PRESET_THEMES)[0]) => {
    Haptics.selectionAsync();
    onChange({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.bg,
      surfaceColor: preset.surface,
      textColor: preset.text,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.panel, { backgroundColor: appTheme.surface }]}>
          <View style={[styles.topBar, { borderBottomColor: appTheme.border }]}>
            <View style={[styles.pill, { backgroundColor: appTheme.border }]} />
            <View style={styles.titleRow}>
              <MaterialIcons name="palette" size={20} color={AppColors.primary} />
              <Text style={[styles.title, { color: appTheme.text }]}>Theme Editor</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={18} color={appTheme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Preset Themes */}
            <Text style={[styles.sectionLabel, { color: appTheme.textSecondary }]}>Preset Themes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
              {PRESET_THEMES.map((preset) => (
                <TouchableOpacity
                  key={preset.name}
                  onPress={() => handlePreset(preset)}
                  style={styles.presetChip}
                  activeOpacity={0.8}
                >
                  <View style={styles.presetSwatches}>
                    <View style={[styles.presetSwatch, { backgroundColor: preset.primary }]} />
                    <View style={[styles.presetSwatch, { backgroundColor: preset.secondary }]} />
                    <View style={[styles.presetSwatch, { backgroundColor: preset.bg }]} />
                  </View>
                  <Text style={[styles.presetName, { color: appTheme.text }]}>{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Colors */}
            <Text style={[styles.sectionLabel, { color: appTheme.textSecondary }]}>Colors</Text>
            <ColorRow label="Primary" value={t.primaryColor} isDark={isDark} onPress={() => setColorPicker('primaryColor')} />
            <ColorRow label="Secondary" value={t.secondaryColor} isDark={isDark} onPress={() => setColorPicker('secondaryColor')} />
            <ColorRow label="Background" value={t.backgroundColor} isDark={isDark} onPress={() => setColorPicker('backgroundColor')} />
            <ColorRow label="Surface" value={t.surfaceColor} isDark={isDark} onPress={() => setColorPicker('surfaceColor')} />
            <ColorRow label="Text" value={t.textColor} isDark={isDark} onPress={() => setColorPicker('textColor')} />

            {/* Border Radius */}
            <Text style={[styles.sectionLabel, { color: appTheme.textSecondary }]}>Border Radius</Text>
            <View style={[styles.radiusRow, { backgroundColor: appTheme.surfaceSecondary, borderColor: appTheme.border }]}>
              <View style={styles.radiusLabelRow}>
                <Text style={[styles.colorLabel, { color: appTheme.text }]}>Global Radius</Text>
                <Text style={[styles.colorHex, { color: appTheme.textSecondary }]}>{t.borderRadius}px</Text>
              </View>
              <View style={[styles.sliderTrack, { backgroundColor: appTheme.surfaceTertiary }]}>
                <View style={[styles.sliderFill, { width: `${(t.borderRadius / 32) * 100}%`, backgroundColor: AppColors.primary }]} />
                <View style={styles.sliderBtns}>
                  <TouchableOpacity onPress={() => onChange({ borderRadius: Math.max(0, t.borderRadius - 2) })}
                    style={[styles.sliderBtn, { backgroundColor: appTheme.surface }]}>
                    <Text style={{ color: appTheme.text, fontWeight: '700', fontSize: 16 }}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onChange({ borderRadius: Math.min(32, t.borderRadius + 2) })}
                    style={[styles.sliderBtn, { backgroundColor: appTheme.surface }]}>
                    <Text style={{ color: appTheme.text, fontWeight: '700', fontSize: 16 }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Mode */}
            <Text style={[styles.sectionLabel, { color: appTheme.textSecondary }]}>Mode</Text>
            <View style={styles.modeRow}>
              {(['light', 'dark', 'auto'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => onChange({ mode })}
                  style={[
                    styles.modeBtn,
                    {
                      backgroundColor: t.mode === mode ? AppColors.primary : appTheme.surfaceSecondary,
                      borderColor: t.mode === mode ? AppColors.primary : appTheme.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={mode === 'light' ? 'wb-sunny' : mode === 'dark' ? 'nights-stay' : 'brightness-auto'}
                    size={16}
                    color={t.mode === mode ? '#FFF' : appTheme.textSecondary}
                  />
                  <Text style={{ color: t.mode === mode ? '#FFF' : appTheme.text, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' }}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Apply Theme',
                  'This will update all component colors to match this theme. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Apply', onPress: onApplyToAll },
                  ]
                );
              }}
              style={[styles.applyBtn, { backgroundColor: AppColors.primary }]}
              activeOpacity={0.85}
            >
              <MaterialIcons name="auto-fix-high" size={18} color="#FFF" />
              <Text style={styles.applyBtnText}>Apply Theme to All Components</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Color Picker Modals */}
        {(['primaryColor', 'secondaryColor', 'backgroundColor', 'surfaceColor', 'textColor'] as const).map((key) => (
          <ColorPickerModal
            key={key}
            visible={colorPicker === key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            value={(t as any)[key]}
            onClose={() => setColorPicker(null)}
            onChange={(c) => onChange({ [key]: c })}
          />
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  topBar: {
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  pill: { width: 36, height: 4, borderRadius: 2, marginBottom: 10 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  title: { fontSize: 18, fontWeight: '700', flex: 1 },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 2,
  },
  presetRow: { gap: 10, paddingVertical: 4 },
  presetChip: { alignItems: 'center', gap: 6 },
  presetSwatches: { flexDirection: 'row', gap: 3 },
  presetSwatch: { width: 20, height: 20, borderRadius: 5 },
  presetName: { fontSize: 11, fontWeight: '600' },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  colorHex: { fontSize: 13 },
  radiusRow: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  radiusLabelRow: { flexDirection: 'row', alignItems: 'center' },
  sliderTrack: {
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 8 },
  sliderBtns: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  sliderBtn: {
    width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  applyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  overlayFull: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  colorPickerModal: {
    width: '100%', maxWidth: 360, borderRadius: 16, padding: 20, borderWidth: 1, gap: 16,
  },
  colorPickerTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  swatch: { width: 36, height: 36, borderRadius: 8 },
});
