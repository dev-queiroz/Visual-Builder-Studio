import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Project, AppScreen, UIComponent } from '@/types';
import { AppColors } from '@/constants/colors';
import { LogicEngine } from '@/engines/logic/logicEngine';
import { useEditorStore } from '@/store/editorStore';
import { resolveVariables } from '@/utils/variableResolver';

function PreviewComponent({
  component,
  onEvent,
  runtimeVariables
}: {
  component: UIComponent;
  onEvent: (eventName: string, params?: any) => void;
  runtimeVariables: Record<string, any>;
}) {
  const p = useMemo(() => {
    const resolved: Record<string, any> = {};
    Object.keys(component.props).forEach(key => {
      resolved[key] = resolveVariables(component.props[key], runtimeVariables);
    });
    return resolved;
  }, [component.props, runtimeVariables]);

  const handlePress = () => {
    if (component.events?.onPress) {
      onEvent('onPress');
    }
  };

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
          onPress={handlePress}
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
          <Text style={{ color: p.color ?? '#9494B0', fontSize: p.fontSize ?? 16 }}>
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
            backgroundColor: p.backgroundColor ?? '#E2E2EC',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {p.uri ? (
            <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFill} />
          ) : (
            <>
              <MaterialIcons name="image" size={48} color="#9494B0" />
              <Text style={{ color: '#9494B0', fontSize: 12, marginTop: 8 }}>No URL set</Text>
            </>
          )}
        </View>
      );

    case 'Card':
      return (
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={component.events?.onPress ? 0.9 : 1}
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
        </TouchableOpacity>
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
            gap: p.gap ?? 8,
          }}
          onStartShouldSetResponder={() => !!component.events?.onPress}
          onResponderRelease={handlePress}
        />
      );
  }
}

interface Props {
  visible: boolean;
  project: Project | null;
  initialScreenId: string;
  onClose: () => void;
}

export default function PreviewModal({ visible, project, initialScreenId, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { runtimeVariables, setRuntimeVariable, resetRuntimeVariables } = useEditorStore();
  const [activeScreenId, setActiveScreenId] = useState(initialScreenId);

  useEffect(() => {
    if (visible) {
      resetRuntimeVariables();
      setActiveScreenId(initialScreenId);
    }
  }, [visible, initialScreenId, resetRuntimeVariables]);

  const activeScreen = project?.screens.find(s => s.id === activeScreenId);

  const engine = useMemo(() => {
    if (!project) return null;
    return new LogicEngine(
      project,
      runtimeVariables,
      setRuntimeVariable,
      (screenId: string) => {
        const found = project.screens.find(s => s.id === screenId || s.name === screenId);
        if (found) setActiveScreenId(found.id);
      }
    );
  }, [project, runtimeVariables, setRuntimeVariable]);

  const handleComponentEvent = (component: UIComponent, eventName: string) => {
    if (engine) {
      engine.dispatchComponentEvent(component, eventName);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.deviceDot, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.deviceDot, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.deviceDot, { backgroundColor: '#10B981' }]} />
          </View>
          <Text style={styles.headerTitle}>Preview — {activeScreen?.name ?? 'Screen'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.deviceFrame}>
          <View style={styles.deviceNotch} />
          <View style={[styles.deviceScreen, { backgroundColor: activeScreen?.backgroundColor ?? '#FFFFFF' }]}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {!activeScreen || activeScreen.components.length === 0 ? (
                <View style={styles.emptyPreview}>
                  <MaterialIcons name="phonelink" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No components yet</Text>
                </View>
              ) : (
                <View style={{ padding: 12, gap: 12 }}>
                  {activeScreen.components.map((comp) => (
                    <PreviewComponent
                      key={comp.id}
                      component={comp}
                      runtimeVariables={runtimeVariables}
                      onEvent={(ev) => handleComponentEvent(comp, ev)}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
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
    fontSize: 14,
    fontWeight: '700',
    flex: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    overflow: 'hidden',
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
