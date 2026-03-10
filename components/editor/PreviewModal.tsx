import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  Image,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppScreen, UIComponent } from '@/types';
import { AppColors } from '@/constants/colors';

function PreviewComponent({ component }: { component: UIComponent }) {
  const p = component.props;
  switch (component.type) {
    case 'Text':
      return (
        <Text
          style={{
            fontSize: p.fontSize ?? 16,
            color: p.color ?? '#111128',
            fontWeight: (p.fontWeight ?? '400') as any,
            textAlign: p.textAlign ?? 'left',
          }}
        >
          {p.content ?? 'Text'}
        </Text>
      );

    case 'Button':
      return (
        <TouchableOpacity
          style={{
            backgroundColor: p.backgroundColor ?? '#7C3AED',
            borderRadius: p.borderRadius ?? 12,
            paddingVertical: p.paddingVertical ?? 14,
            paddingHorizontal: p.paddingHorizontal ?? 24,
            alignItems: 'center',
            alignSelf: p.fullWidth ? 'stretch' : 'flex-start',
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: p.textColor ?? '#FFF',
              fontWeight: (p.fontWeight ?? '600') as any,
              fontSize: p.fontSize ?? 16,
            }}
          >
            {p.label ?? 'Button'}
          </Text>
        </TouchableOpacity>
      );

    case 'TextInput':
      return (
        <View
          style={{
            borderWidth: p.borderWidth ?? 1.5,
            borderColor: p.borderColor ?? '#E2E2EC',
            borderRadius: p.borderRadius ?? 10,
            backgroundColor: p.backgroundColor ?? '#FFFFFF',
            padding: p.padding ?? 14,
          }}
        >
          <Text style={{ color: '#9494B0', fontSize: p.fontSize ?? 16 }}>
            {p.placeholder ?? 'Type here...'}
          </Text>
        </View>
      );

    case 'Image':
      return (
        <View
          style={{
            height: p.height ?? 200,
            borderRadius: p.borderRadius ?? 12,
            backgroundColor: '#E2E2EC',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="image" size={48} color="#9494B0" />
          <Text style={{ color: '#9494B0', fontSize: 12, marginTop: 8 }}>
            {p.uri ? 'Image' : 'No URL set'}
          </Text>
        </View>
      );

    case 'Card':
      return (
        <View
          style={{
            backgroundColor: p.backgroundColor ?? '#FFFFFF',
            borderRadius: p.borderRadius ?? 16,
            padding: p.padding ?? 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text style={{ fontWeight: '700', fontSize: p.titleSize ?? 18, color: p.titleColor ?? '#111128' }}>
            {p.title ?? 'Card Title'}
          </Text>
          <Text style={{ fontSize: p.subtitleSize ?? 14, color: p.subtitleColor ?? '#5B5B7A', marginTop: 4 }}>
            {p.subtitle ?? 'Subtitle text'}
          </Text>
        </View>
      );

    case 'Header':
      return (
        <View
          style={{
            backgroundColor: p.backgroundColor ?? '#7C3AED',
            paddingVertical: p.paddingVertical ?? 18,
            paddingHorizontal: p.paddingHorizontal ?? 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {p.showBack && (
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={p.textColor ?? '#FFF'}
              style={{ marginRight: 12 }}
            />
          )}
          <Text
            style={{
              color: p.textColor ?? '#FFF',
              fontWeight: '700',
              fontSize: p.fontSize ?? 20,
            }}
          >
            {p.title ?? 'Header'}
          </Text>
        </View>
      );

    case 'Footer':
      return (
        <View
          style={{
            backgroundColor: p.backgroundColor ?? '#F4F4F8',
            paddingVertical: p.paddingVertical ?? 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: p.textColor ?? '#9494B0', fontSize: p.fontSize ?? 13 }}>
            {p.text ?? '© 2026 My App'}
          </Text>
        </View>
      );

    case 'Spacer':
      return <View style={{ height: p.height ?? 24 }} />;

    case 'Divider':
      return (
        <View
          style={{
            height: p.thickness ?? 1,
            backgroundColor: p.color ?? '#E2E2EC',
            marginVertical: p.marginVertical ?? 8,
          }}
        />
      );

    case 'ScrollView':
      return (
        <View
          style={{
            minHeight: p.minHeight ?? 80,
            backgroundColor: p.backgroundColor === 'transparent' ? '#F8F8FF' : p.backgroundColor,
            borderRadius: 8,
            padding: p.padding ?? 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="swap-vert" size={24} color="#9CA3AF" />
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{p.label ?? 'Scroll Area'}</Text>
        </View>
      );

    case 'FlatList':
      return (
        <View style={{ gap: p.gap ?? 10 }}>
          {Array.from({ length: p.itemCount ?? 3 }).map((_, i) => (
            <View
              key={i}
              style={{
                backgroundColor: p.itemBackgroundColor ?? '#FFFFFF',
                borderRadius: p.itemBorderRadius ?? 10,
                padding: p.itemPadding ?? 14,
              }}
            >
              <Text style={{ fontSize: p.itemFontSize ?? 15, color: p.itemColor ?? '#111128' }}>
                {p.itemText ?? 'List item'} {i + 1}
              </Text>
            </View>
          ))}
        </View>
      );

    case 'Tabs': {
      const tabs: string[] = p.tabs ?? ['Tab 1', 'Tab 2', 'Tab 3'];
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#FFFFFF', borderRadius: p.borderRadius ?? 10, padding: 4 }}>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {tabs.map((tab, i) => (
              <View key={i} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: i === 0 ? (p.activeColor ?? '#7C3AED') + '25' : 'transparent' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: i === 0 ? (p.activeColor ?? '#7C3AED') : (p.inactiveColor ?? '#9CA3AF') }}>{tab}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    case 'Accordion':
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#FFFFFF', borderRadius: p.borderRadius ?? 12, overflow: 'hidden' }}>
          <View style={{ backgroundColor: p.headerColor ?? '#F4F4F8', flexDirection: 'row', alignItems: 'center', padding: 14 }}>
            <Text style={{ flex: 1, fontWeight: '700', fontSize: 15, color: p.titleColor ?? '#111128' }}>{p.title ?? 'Section'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={22} color={p.titleColor ?? '#111128'} />
          </View>
          <View style={{ padding: 14 }}>
            <Text style={{ fontSize: 14, color: p.contentColor ?? '#5B5B7A', lineHeight: 20 }}>{p.content ?? 'Content'}</Text>
          </View>
        </View>
      );

    case 'Carousel':
      return (
        <View>
          <View style={{ height: p.height ?? 160, borderRadius: p.borderRadius ?? 14, flexDirection: 'row', overflow: 'hidden' }}>
            {Array.from({ length: Math.min(p.imageCount ?? 3, 3) }).map((_, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: [`#DDD6FE`, `#BFDBFE`, `#BBF7D0`][i % 3], alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="image" size={28} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 11, marginTop: 4 }}>Slide {i + 1}</Text>
              </View>
            ))}
          </View>
          {p.showDots !== false && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 }}>
              {Array.from({ length: p.imageCount ?? 3 }).map((_, i) => (
                <View key={i} style={{ width: i === 0 ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === 0 ? (p.dotColor ?? '#7C3AED') : '#D1D5DB' }} />
              ))}
            </View>
          )}
        </View>
      );

    case 'Chart': {
      const vals: number[] = p.values ?? [65, 80, 45, 90];
      const labs: string[] = p.labels ?? ['A', 'B', 'C', 'D'];
      const mx = Math.max(...vals);
      return (
        <View style={{ backgroundColor: p.backgroundColor ?? '#FFFFFF', borderRadius: p.borderRadius ?? 14, padding: 16 }}>
          {p.title && <Text style={{ fontWeight: '700', fontSize: 14, color: p.textColor ?? '#111128', marginBottom: 10 }}>{p.title}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {vals.slice(0, 6).map((v, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
                <View style={{ width: '100%', height: Math.max(6, (v / mx) * 64), backgroundColor: p.barColor ?? '#7C3AED', borderRadius: 4 }} />
                <Text style={{ fontSize: 10, color: p.textColor ?? '#111128' }}>{labs[i] ?? ''}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    case 'WebView':
      return (
        <View style={{ height: p.height ?? 160, borderRadius: p.borderRadius ?? 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E2EC' }}>
          {p.showHeader !== false && (
            <View style={{ backgroundColor: '#F4F4F8', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#E2E2EC' }}>
              <MaterialIcons name="lock" size={13} color="#10B981" />
              <Text style={{ fontSize: 12, color: '#5B5B7A', flex: 1 }} numberOfLines={1}>{p.url ?? 'https://example.com'}</Text>
            </View>
          )}
          <View style={{ flex: 1, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <MaterialIcons name="open-in-browser" size={32} color="#D1D5DB" />
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Web content</Text>
          </View>
        </View>
      );

    case 'MapView':
      return (
        <View style={{ height: p.height ?? 160, borderRadius: p.borderRadius ?? 14, overflow: 'hidden', backgroundColor: '#E8F4E8' }}>
          <View style={StyleSheet.absoluteFillObject}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: i * 30, height: 1, backgroundColor: '#C8E6C8' }} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: i * 50, width: 1, backgroundColor: '#C8E6C8' }} />
            ))}
          </View>
          <View style={{ position: 'absolute', top: '38%', left: '43%' }}>
            <MaterialIcons name="place" size={32} color="#EF4444" />
          </View>
        </View>
      );

    case 'FormField':
      return (
        <View style={{ gap: 7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: p.labelColor ?? '#5B5B7A' }}>{p.label ?? 'Field'}</Text>
            {p.required && <Text style={{ color: '#EF4444', fontSize: 13 }}>*</Text>}
          </View>
          <View style={{ backgroundColor: p.inputBg ?? '#F4F4F8', borderRadius: p.borderRadius ?? 10, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: '#E2E2EC' }}>
            <Text style={{ color: '#9494B0', fontSize: p.fontSize ?? 15 }}>{p.placeholder ?? 'Enter value...'}</Text>
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
        <View
          style={{
            minHeight: p.minHeight ?? 60,
            backgroundColor:
              p.backgroundColor === 'transparent' ? 'rgba(99,102,241,0.05)' : p.backgroundColor,
            borderRadius: p.borderRadius ?? 0,
            borderWidth: p.borderWidth ?? 1,
            borderColor: p.borderColor ?? '#E2E2EC',
            padding: p.padding ?? 16,
            flexDirection: (p.flexDirection as any) ?? 'column',
            alignItems: (p.alignItems as any) ?? 'flex-start',
          }}
        />
      );
  }
}

interface Props {
  visible: boolean;
  screen: AppScreen | null;
  onClose: () => void;
}

export default function PreviewModal({ visible, screen, onClose }: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.deviceDot, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.deviceDot, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.deviceDot, { backgroundColor: '#10B981' }]} />
          </View>
          <Text style={styles.headerTitle}>Preview — {screen?.name ?? 'Screen'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.deviceFrame}>
          <View style={styles.deviceNotch} />
          <ScrollView
            style={[styles.deviceScreen, { backgroundColor: screen?.backgroundColor ?? '#FFFFFF' }]}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {screen?.components.length === 0 ? (
              <View style={styles.emptyPreview}>
                <MaterialIcons name="phonelink" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No components yet</Text>
              </View>
            ) : (
              <View style={{ padding: 8, gap: 8 }}>
                {screen?.components.map((comp) => (
                  <PreviewComponent key={comp.id} component={comp} />
                ))}
              </View>
            )}
          </ScrollView>
          <View style={styles.deviceHome} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  deviceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerTitle: {
    color: '#F0F0FF',
    fontSize: 15,
    fontWeight: '600',
    flex: 2,
    textAlign: 'center',
  },
  closeBtn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  deviceFrame: {
    width: 320,
    height: 580,
    borderRadius: 40,
    backgroundColor: '#1A1A2E',
    borderWidth: 3,
    borderColor: '#2A2A46',
    overflow: 'hidden',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  deviceNotch: {
    width: 120,
    height: 28,
    backgroundColor: '#0D0D1A',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  deviceScreen: {
    flex: 1,
    marginTop: 28,
  },
  deviceHome: {
    width: 120,
    height: 5,
    backgroundColor: '#2A2A46',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 100,
  },
  emptyText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '600',
  },
});
