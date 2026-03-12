import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { UIComponent } from '@/types';
import { AppColors } from '@/constants/colors';
import { BlurView } from 'expo-blur';

interface Props {
  component: UIComponent;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function PreviewContent({ component }: { component: UIComponent }) {
  const p = component.props;
  switch (component.type) {
    case 'Text':
      return (
        <Text style={{ fontSize: Math.min(p.fontSize ?? 16, 18), color: p.color ?? '#111128', fontWeight: (p.fontWeight ?? '400') as any, textAlign: p.textAlign ?? 'left' }} numberOfLines={2}>
          {p.content ?? 'Text'}
        </Text>
      );
    case 'Button':
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#7C3AED', borderRadius: p.borderRadius ?? 12, paddingVertical: 10, paddingHorizontal: 18, alignSelf: p.fullWidth ? 'stretch' : 'flex-start', alignItems: 'center' }}>
          <Text style={{ color: p.textColor ?? '#FFF', fontWeight: '600', fontSize: 14 }}>{p.label ?? 'Button'}</Text>
          {p.actionType && p.actionType !== 'none' && (
            <Text style={{ color: (p.textColor ?? '#FFF') + 'CC', fontSize: 10, marginTop: 2 }}>
              {p.actionType === 'navigate' ? `→ ${p.actionTarget || 'Screen'}` : '⚡ Alert'}
            </Text>
          )}
        </View>
      );
    case 'TextInput':
      return (
        <View style={{ borderWidth: p.borderWidth ?? 1.5, borderColor: p.borderColor ?? '#E2E2EC', borderRadius: p.borderRadius ?? 10, backgroundColor: p.backgroundColor ?? '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10 }}>
          <Text style={{ color: '#9494B0', fontSize: 14 }}>{p.placeholder ?? 'Type here...'}</Text>
        </View>
      );
    case 'Image':
      return (
        <View style={{ height: Math.min(p.height ?? 120, 120), borderRadius: p.borderRadius ?? 12, backgroundColor: '#E2E2EC', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <MaterialIcons name="image" size={32} color="#9494B0" />
        </View>
      );
    case 'Card':
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#FFFFFF', borderRadius: p.borderRadius ?? 16, padding: Math.min(p.padding ?? 16, 16), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: p.titleColor ?? '#111128' }}>{p.title ?? 'Card Title'}</Text>
          <Text style={{ fontSize: 12, color: p.subtitleColor ?? '#5B5B7A', marginTop: 2 }} numberOfLines={2}>{p.subtitle ?? 'Subtitle text'}</Text>
        </View>
      );
    case 'Header':
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#7C3AED', paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
          {p.showBack && <MaterialIcons name="arrow-back" size={20} color={p.textColor ?? '#FFF'} style={{ marginRight: 8 }} />}
          <Text style={{ color: p.textColor ?? '#FFF', fontWeight: '700', fontSize: 16 }}>{p.title ?? 'Header'}</Text>
        </View>
      );
    case 'Footer':
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#F4F4F8', paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: p.textColor ?? '#9494B0', fontSize: 12 }}>{p.text ?? '© 2026'}</Text>
        </View>
      );
    case 'Spacer':
      return (
        <View style={{ height: Math.min(p.height ?? 24, 40), borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{p.height ?? 24}px space</Text>
        </View>
      );
    case 'Divider':
      return <View style={{ height: p.thickness ?? 1, backgroundColor: p.color ?? '#E2E2EC', marginVertical: 4 }} />;
    case 'ScrollView':
      return (
        <View style={{ minHeight: 48, backgroundColor: '#F0F2F8', borderRadius: 8, padding: 12, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D5DB' }}>
          <MaterialIcons name="swap-vert" size={18} color="#9CA3AF" />
          <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{p.label ?? 'Scroll Area'}</Text>
        </View>
      );
    case 'FlatList':
      return (
        <View style={{ gap: 4 }}>
          {Array.from({ length: Math.min(p.itemCount ?? 3, 3) }).map((_, i) => (
            <View key={i} style={{ backgroundColor: p.itemBackgroundColor ?? '#FFFFFF', borderRadius: p.itemBorderRadius ?? 10, padding: Math.min(p.itemPadding ?? 12, 12) }}>
              <Text style={{ fontSize: 13, color: p.itemColor ?? '#111128' }}>{p.itemText ?? 'Item'} {i + 1}</Text>
            </View>
          ))}
        </View>
      );
    case 'Tabs':
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#FFFFFF', borderRadius: p.borderRadius ?? 10, padding: 4 }}>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {(p.tabs ?? ['Tab 1', 'Tab 2']).map((tab: string, i: number) => (
              <View key={i} style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: i === 0 ? (p.activeColor ?? '#7C3AED') + '20' : 'transparent' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: i === 0 ? (p.activeColor ?? '#7C3AED') : (p.inactiveColor ?? '#9CA3AF') }}>{tab}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'Accordion':
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#FFFFFF', borderRadius: p.borderRadius ?? 12, overflow: 'hidden' }}>
          <View style={{ backgroundColor: p.headerColor ?? '#F4F4F8', flexDirection: 'row', alignItems: 'center', padding: 14 }}>
            <Text style={{ flex: 1, fontWeight: '700', fontSize: 14, color: p.titleColor ?? '#111128' }}>{p.title ?? 'Section'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={p.titleColor ?? '#111128'} />
          </View>
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 13, color: p.contentColor ?? '#5B5B7A' }} numberOfLines={2}>{p.content ?? 'Content'}</Text>
          </View>
        </View>
      );
    case 'Carousel':
      return (
        <View>
          <View style={{ height: Math.min(p.height ?? 140, 140), borderRadius: p.borderRadius ?? 14, backgroundColor: '#E2E2EC', flexDirection: 'row', overflow: 'hidden' }}>
            {Array.from({ length: Math.min(p.imageCount ?? 3, 3) }).map((_, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: `hsl(${220 + i * 30}, 60%, 80%)`, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="image" size={24} color="#FFF" />
              </View>
            ))}
          </View>
          {p.showDots !== false && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 8 }}>
              {Array.from({ length: p.imageCount ?? 3 }).map((_, i) => (
                <View key={i} style={{ width: i === 0 ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === 0 ? (p.dotColor ?? '#7C3AED') : '#D1D5DB' }} />
              ))}
            </View>
          )}
        </View>
      );
    case 'Chart':
      const values: number[] = p.values ?? [65, 80, 45, 90];
      const labels: string[] = p.labels ?? ['A', 'B', 'C', 'D'];
      const max = Math.max(...values);
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#FFFFFF', borderRadius: p.borderRadius ?? 14, padding: 14 }}>
          {p.title && <Text style={{ fontWeight: '700', fontSize: 13, color: p.textColor ?? '#111128', marginBottom: 8 }}>{p.title}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 60 }}>
            {values.slice(0, 6).map((v, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View style={{ width: '100%', height: Math.max(4, (v / max) * 48), backgroundColor: p.barColor ?? '#7C3AED', borderRadius: 4 }} />
                <Text style={{ fontSize: 9, color: p.textColor ?? '#111128' }}>{labels[i] ?? ''}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'WebView':
      return (
        <View style={{ height: Math.min(p.height ?? 140, 140), borderRadius: p.borderRadius ?? 12, backgroundColor: '#F4F4F8', overflow: 'hidden', borderWidth: 1, borderColor: '#E2E2EC' }}>
          {p.showHeader !== false && (
            <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#E2E2EC' }}>
              <MaterialIcons name="lock" size={12} color="#10B981" />
              <Text style={{ fontSize: 11, color: '#5B5B7A', flex: 1 }} numberOfLines={1}>{p.url ?? 'https://example.com'}</Text>
            </View>
          )}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <MaterialIcons name="open-in-browser" size={28} color="#9CA3AF" />
            <Text style={{ fontSize: 11, color: '#9CA3AF' }}>WebView</Text>
          </View>
        </View>
      );
    case 'MapView':
      return (
        <View style={{ height: Math.min(p.height ?? 140, 140), borderRadius: p.borderRadius ?? 14, overflow: 'hidden', backgroundColor: '#E8F4E8' }}>
          <View style={StyleSheet.absoluteFillObject}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * 28, height: 1, backgroundColor: '#C8E6C8' }} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: i * 60, width: 1, backgroundColor: '#C8E6C8' }} />
            ))}
          </View>
          <View style={{ position: 'absolute', top: '40%', left: '45%' }}>
            <MaterialIcons name="place" size={28} color="#EF4444" />
          </View>
          <View style={{ position: 'absolute', bottom: 6, right: 8 }}>
            <Text style={{ fontSize: 10, color: '#5B5B7A', backgroundColor: 'rgba(255,255,255,0.8)', padding: 3, borderRadius: 4 }}>Map View</Text>
          </View>
        </View>
      );
    case 'FormField':
      return (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: p.labelColor ?? '#5B5B7A' }}>{p.label ?? 'Label'}</Text>
            {p.required && <Text style={{ color: '#EF4444', fontSize: 12 }}>*</Text>}
          </View>
          <View style={{ backgroundColor: p.inputBg ?? '#F4F4F8', borderRadius: p.borderRadius ?? 10, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderColor: '#E2E2EC' }}>
            <Text style={{ color: '#9494B0', fontSize: p.fontSize ?? 14 }}>{p.placeholder ?? 'Enter value...'}</Text>
          </View>
        </View>
      );
    case 'Badge':
      return (
        <View style={{ alignSelf: (p.alignSelf ?? 'flex-start') as any }}>
          <View style={{ backgroundColor: p.backgroundColor ?? '#EF4444', borderRadius: p.borderRadius ?? 20, paddingHorizontal: p.paddingHorizontal ?? 12, paddingVertical: p.paddingVertical ?? 5 }}>
            <Text style={{ color: p.textColor ?? '#FFFFFF', fontSize: p.fontSize ?? 12, fontWeight: '700' }}>{p.text ?? 'Badge'}</Text>
          </View>
        </View>
      );
    case 'View':
    default:
      return (
        <View style={{ minHeight: Math.min(p.minHeight ?? 48, 60), backgroundColor: p.backgroundColor === 'transparent' ? '#F0F2F8' : p.backgroundColor ?? '#F0F2F8', borderRadius: p.borderRadius ?? 0, borderWidth: p.borderWidth ?? 1, borderColor: p.borderColor ?? '#E2E2EC', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Container</Text>
        </View>
      );
  }
}

export default function CanvasItem({ component, isSelected, onSelect, onMoveUp, onMoveDown, onDelete, onDuplicate, isFirst, isLast }: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;

  return (
    <TouchableOpacity
      onPress={() => { Haptics.selectionAsync(); onSelect(); }}
      activeOpacity={0.9}
      testID={`canvas-item-${component.id}`}
      style={[
        styles.wrapper,
        {
          borderColor: isSelected ? AppColors.primary : theme.border,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.6)',
          borderRadius: 16,
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
    >
      <View style={styles.preview}>
        <PreviewContent component={component} />
      </View>
      {isSelected && (
        <View style={[styles.toolbar, { backgroundColor: AppColors.primary }]}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
          <View style={styles.typeChip}>
            <Text style={styles.typeLabel}>{component.type}</Text>
          </View>
          <View style={styles.toolBtns}>
            <TouchableOpacity onPress={onMoveUp} disabled={isFirst} style={[styles.toolBtn, isFirst && styles.toolBtnDisabled]}>
              <MaterialIcons name="keyboard-arrow-up" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onMoveDown} disabled={isLast} style={[styles.toolBtn, isLast && styles.toolBtnDisabled]}>
              <MaterialIcons name="keyboard-arrow-down" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDuplicate} style={styles.toolBtn}>
              <Feather name="copy" size={15} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onDelete(); }} style={styles.toolBtn}>
              <MaterialIcons name="delete-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginVertical: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  preview: { padding: 12 },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, gap: 4, overflow: 'hidden' },
  typeChip: { flex: 1 },
  typeLabel: { color: '#FFF', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  toolBtns: { flexDirection: 'row', gap: 4 },
  toolBtn: { width: 32, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' },
  toolBtnDisabled: { opacity: 0.3 },
});
