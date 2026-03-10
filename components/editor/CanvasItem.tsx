import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  TextInput,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { UIComponent } from '@/types';
import { AppColors } from '@/constants/colors';

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
        <Text
          style={{
            fontSize: Math.min(p.fontSize ?? 16, 18),
            color: p.color ?? '#111128',
            fontWeight: (p.fontWeight ?? '400') as any,
            textAlign: p.textAlign ?? 'left',
          }}
          numberOfLines={2}
        >
          {p.content ?? 'Text'}
        </Text>
      );

    case 'Button':
      return (
        <View
          style={{
            backgroundColor: p.backgroundColor ?? '#7C3AED',
            borderRadius: p.borderRadius ?? 12,
            paddingVertical: 10,
            paddingHorizontal: 18,
            alignSelf: p.fullWidth ? 'stretch' : 'flex-start',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: p.textColor ?? '#FFF', fontWeight: '600', fontSize: 14 }}>
            {p.label ?? 'Button'}
          </Text>
        </View>
      );

    case 'TextInput':
      return (
        <View
          style={{
            borderWidth: p.borderWidth ?? 1.5,
            borderColor: p.borderColor ?? '#E2E2EC',
            borderRadius: p.borderRadius ?? 10,
            backgroundColor: p.backgroundColor ?? '#FFFFFF',
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: '#9494B0', fontSize: 14 }}>{p.placeholder ?? 'Type here...'}</Text>
        </View>
      );

    case 'Image':
      return (
        <View
          style={{
            height: Math.min(p.height ?? 120, 120),
            borderRadius: p.borderRadius ?? 12,
            backgroundColor: '#E2E2EC',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="image" size={32} color="#9494B0" />
          <Text style={{ color: '#9494B0', fontSize: 11, marginTop: 4 }}>Image</Text>
        </View>
      );

    case 'Card':
      return (
        <View
          style={{
            backgroundColor: p.backgroundColor ?? '#FFFFFF',
            borderRadius: p.borderRadius ?? 16,
            padding: Math.min(p.padding ?? 16, 16),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text style={{ fontWeight: '700', fontSize: 14, color: p.titleColor ?? '#111128' }}>
            {p.title ?? 'Card Title'}
          </Text>
          <Text style={{ fontSize: 12, color: p.subtitleColor ?? '#5B5B7A', marginTop: 2 }}>
            {p.subtitle ?? 'Subtitle text'}
          </Text>
        </View>
      );

    case 'Header':
      return (
        <View
          style={{
            backgroundColor: p.backgroundColor ?? '#7C3AED',
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {p.showBack && (
            <MaterialIcons name="arrow-back" size={20} color={p.textColor ?? '#FFF'} style={{ marginRight: 8 }} />
          )}
          <Text style={{ color: p.textColor ?? '#FFF', fontWeight: '700', fontSize: 16 }}>
            {p.title ?? 'Header'}
          </Text>
        </View>
      );

    case 'Footer':
      return (
        <View
          style={{
            backgroundColor: p.backgroundColor ?? '#F4F4F8',
            paddingVertical: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: p.textColor ?? '#9494B0', fontSize: 12 }}>
            {p.text ?? '© 2026 My App'}
          </Text>
        </View>
      );

    case 'Spacer':
      return (
        <View
          style={{
            height: Math.min(p.height ?? 24, 40),
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{p.height ?? 24}px space</Text>
        </View>
      );

    case 'Divider':
      return (
        <View
          style={{
            height: p.thickness ?? 1,
            backgroundColor: p.color ?? '#E2E2EC',
            marginVertical: 4,
          }}
        />
      );

    case 'ScrollView':
      return (
        <View
          style={{
            minHeight: 48,
            backgroundColor: (p.backgroundColor === 'transparent' ? '#F0F2F8' : p.backgroundColor) ?? '#F0F2F8',
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: '#D1D5DB',
          }}
        >
          <MaterialIcons name="swap-vert" size={18} color="#9CA3AF" />
          <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>{p.label ?? 'Scroll Area'}</Text>
        </View>
      );

    case 'FlatList':
      return (
        <View style={{ gap: 4 }}>
          {Array.from({ length: Math.min(p.itemCount ?? 3, 3) }).map((_, i) => (
            <View
              key={i}
              style={{
                backgroundColor: p.itemBackgroundColor ?? '#FFFFFF',
                borderRadius: p.itemBorderRadius ?? 10,
                padding: Math.min(p.itemPadding ?? 12, 12),
              }}
            >
              <Text style={{ fontSize: 13, color: p.itemColor ?? '#111128' }}>
                {p.itemText ?? 'List item'} {i + 1}
              </Text>
            </View>
          ))}
          {(p.itemCount ?? 3) > 3 && (
            <Text style={{ color: '#9CA3AF', fontSize: 11, textAlign: 'center' }}>
              +{(p.itemCount ?? 3) - 3} more items
            </Text>
          )}
        </View>
      );

    case 'View':
    default:
      return (
        <View
          style={{
            minHeight: Math.min(p.minHeight ?? 48, 60),
            backgroundColor:
              p.backgroundColor === 'transparent' ? '#F0F2F8' : p.backgroundColor ?? '#F0F2F8',
            borderRadius: p.borderRadius ?? 0,
            borderWidth: p.borderWidth ?? 1,
            borderColor: p.borderColor ?? '#E2E2EC',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Container</Text>
        </View>
      );
  }
}

export default function CanvasItem({
  component,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  isFirst,
  isLast,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;

  const handleSelect = () => {
    Haptics.selectionAsync();
    onSelect();
  };

  return (
    <TouchableOpacity
      onPress={handleSelect}
      activeOpacity={0.85}
      style={[
        styles.wrapper,
        {
          borderColor: isSelected ? AppColors.primary : 'transparent',
          borderWidth: isSelected ? 2 : 2,
          backgroundColor: isSelected ? AppColors.primary + '08' : 'transparent',
        },
      ]}
    >
      <View style={styles.preview}>
        <PreviewContent component={component} />
      </View>

      {isSelected && (
        <View style={[styles.toolbar, { backgroundColor: AppColors.primary }]}>
          <TouchableOpacity
            onPress={onMoveUp}
            disabled={isFirst}
            style={[styles.toolBtn, isFirst && styles.toolBtnDisabled]}
          >
            <MaterialIcons name="keyboard-arrow-up" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMoveDown}
            disabled={isLast}
            style={[styles.toolBtn, isLast && styles.toolBtnDisabled]}
          >
            <MaterialIcons name="keyboard-arrow-down" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDuplicate} style={styles.toolBtn}>
            <Feather name="copy" size={15} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onDelete();
            }}
            style={styles.toolBtn}
          >
            <MaterialIcons name="delete-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 10,
    marginHorizontal: 12,
    marginVertical: 4,
    overflow: 'hidden',
  },
  preview: {
    padding: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
  },
  toolBtn: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    opacity: 1,
  },
  toolBtnDisabled: {
    opacity: 0.3,
  },
});
