import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  cancelAnimation
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import { loadProjects } from '@/utils/storage';
import { useEditorStore } from '@/store/editorStore';
import { UIComponentType, DataVariable, WorkflowNode } from '@/types';
import ScreenTabs from '@/components/editor/ScreenTabs';
import CanvasItem from '@/components/editor/CanvasItem';
import ComponentPalette from '@/components/editor/ComponentPalette';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import PreviewModal from '@/components/editor/PreviewModal';
import CodeModal from '@/components/editor/CodeModal';
import ThemeEditor from '@/components/editor/ThemeEditor';
import IntegrationsPanel from '@/components/editor/IntegrationsPanel';
import LogicEditor from '@/components/logic/LogicEditor';
import { AppColors } from '@/constants/colors';

export default function EditorScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    project,
    activeScreenId,
    selectedComponentId,
    setProject,
    setActiveScreen,
    setSelectedComponent,
    addScreen,
    renameScreen,
    deleteScreen,
    addComponent,
    removeComponent,
    moveComponentUp,
    moveComponentDown,
    updateComponentProp,
    updateComponentEvent,
    duplicateComponent,
    updateTheme,
    applyThemeToAll,
    addEndpoint,
    updateEndpoint,
    removeEndpoint,
    undo,
    redo,
    canUndo,
    canRedo,
    addVariable,
    updateVariable,
    removeVariable,
    addWorkflowNode,
    updateWorkflowNode,
    removeWorkflowNode,
  } = useEditorStore();

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .minPointers(2)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showLogic, setShowLogic] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const activeScreen = project?.screens.find((s) => s.id === activeScreenId) ?? null;
  const selectedComponent = activeScreen?.components.find((c) => c.id === selectedComponentId) ?? null;

  useEffect(() => {
    loadProjects().then((projects) => {
      const found = projects.find((p) => p.id === projectId);
      if (found) setProject(found);
      setLoaded(true);
    });
  }, [projectId]);

  if (!loaded) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <MaterialIcons name="bolt" size={40} color={AppColors.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Project not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: AppColors.primary, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const undoEnabled = canUndo();
  const redoEnabled = canRedo();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: topPadding + 8, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.projectName, { color: theme.text }]} numberOfLines={1}>
          {project.name}
        </Text>

        {/* Undo/Redo */}
        <TouchableOpacity
          onPress={() => { if (undoEnabled) { Haptics.selectionAsync(); undo(); } }}
          style={[styles.iconBtn, !undoEnabled && styles.disabled]}
        >
          <MaterialIcons name="undo" size={20} color={undoEnabled ? theme.text : theme.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { if (redoEnabled) { Haptics.selectionAsync(); redo(); } }}
          style={[styles.iconBtn, !redoEnabled && styles.disabled]}
        >
          <MaterialIcons name="redo" size={20} color={redoEnabled ? theme.text : theme.textTertiary} />
        </TouchableOpacity>

        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowTheme(true); }}
            style={[styles.topBtn, { backgroundColor: '#F59E0B18' }]}
          >
            <MaterialIcons name="palette" size={16} color="#F59E0B" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowIntegrations(true); }}
            style={[styles.topBtn, { backgroundColor: AppColors.cyan + '18' }]}
          >
            <MaterialIcons name="cloud" size={16} color={AppColors.cyan} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowLogic(true); }}
            style={[styles.topBtn, { backgroundColor: '#7C3AED18' }]}
          >
            <MaterialIcons name="account-tree" size={16} color="#7C3AED" />
            <Text style={[styles.topBtnText, { color: '#7C3AED' }]}>Logic</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPreview(true); }}
            style={[styles.topBtn, { backgroundColor: '#10B98118' }]}
          >
            <MaterialIcons name="play-arrow" size={18} color="#10B981" />
            <Text style={[styles.topBtnText, { color: '#10B981' }]}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowCode(true); }}
            style={[styles.topBtn, { backgroundColor: AppColors.primary + '18' }]}
          >
            <Feather name="code" size={16} color={AppColors.primary} />
            <Text style={[styles.topBtnText, { color: AppColors.primary }]}>Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Tabs */}
      <ScreenTabs
        screens={project.screens}
        activeScreenId={activeScreenId ?? ''}
        onSelectScreen={setActiveScreen}
        onAddScreen={addScreen}
        onDeleteScreen={deleteScreen}
        onRenameScreen={renameScreen}
      />

      {/* Canvas Area */}
      <GestureHandlerRootView style={{ flex: 1, overflow: 'hidden' }}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.canvasWrapper, animatedStyle]}>
            <View
              style={[
                styles.canvasContainer,
                {
                  backgroundColor: activeScreen?.backgroundColor || theme.background,
                  minHeight: 600,
                  width: '100%',
                },
              ]}
              onStartShouldSetResponder={() => true}
              onResponderRelease={() => {
                if (selectedComponentId) setSelectedComponent(null);
              }}
            >
              {activeScreen?.components.length === 0 ? (
                <View style={styles.emptyCanvas}>
                  <View style={[styles.emptyCanvasIcon, { backgroundColor: AppColors.primary + '15' }]}>
                    <MaterialIcons name="add-circle-outline" size={40} color={AppColors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>Empty Screen</Text>
                  <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                    Tap a component below to add it
                  </Text>
                </View>
              ) : (
                activeScreen?.components.map((comp, idx) => (
                  <CanvasItem
                    key={comp.id}
                    component={comp}
                    isSelected={comp.id === selectedComponentId}
                    onSelect={() => setSelectedComponent(comp.id === selectedComponentId ? null : comp.id)}
                    onMoveUp={() => moveComponentUp(comp.id)}
                    onMoveDown={() => moveComponentDown(comp.id)}
                    onDelete={() => removeComponent(comp.id)}
                    onDuplicate={() => duplicateComponent(comp.id)}
                    isFirst={idx === 0}
                    isLast={idx === (activeScreen?.components.length ?? 0) - 1}
                  />
                ))
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>

      {/* Fab Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: AppColors.primary }]}
        onPress={() => setShowPalette(true)}
      >
        <MaterialIcons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Bottom Panel */}
      {
        selectedComponent ? (
          <PropertiesPanel
            component={selectedComponent}
            onUpdateProp={(key, value) => updateComponentProp(selectedComponent.id, key, value)}
            onUpdateEvent={(ev, blockId) => updateComponentEvent(selectedComponent.id, ev, blockId)}
            onClose={() => setSelectedComponent(null)}
            projectScreens={project.screens}
            availableWorkflowNodes={project.workflowNodes ?? []}
          />
        ) : null
      }

      <View style={{ height: insets.bottom + (Platform.OS === 'web' ? 34 : 0), backgroundColor: theme.surface }} />

      <PreviewModal
        visible={showPreview}
        project={project}
        initialScreenId={activeScreenId ?? ''}
        onClose={() => setShowPreview(false)}
      />
      <CodeModal visible={showCode} project={project} onClose={() => setShowCode(false)} />

      <ComponentPalette
        visible={showPalette}
        onClose={() => setShowPalette(false)}
        onAddComponent={(type: UIComponentType) => addComponent(type)}
      />

      <ThemeEditor
        visible={showTheme}
        theme={project.theme ?? {
          primaryColor: '#7C3AED',
          secondaryColor: '#06B6D4',
          backgroundColor: '#FFFFFF',
          surfaceColor: '#F4F4F8',
          textColor: '#111128',
          borderRadius: 12,
          mode: 'auto',
        }}
        onClose={() => setShowTheme(false)}
        onChange={(t) => updateTheme(t)}
        onApplyToAll={() => { applyThemeToAll(); setShowTheme(false); }}
      />

      <IntegrationsPanel
        visible={showIntegrations}
        endpoints={project.endpoints ?? []}
        onClose={() => setShowIntegrations(false)}
        onAdd={(ds: any) => addEndpoint(ds)}
        onRemove={removeEndpoint}
        onUpdate={updateEndpoint}
      />

      <LogicEditor
        visible={showLogic}
        onClose={() => setShowLogic(false)}
        nodes={project.workflowNodes ?? []}
        onAddNode={addWorkflowNode}
        onUpdateNode={updateWorkflowNode}
        onRemoveNode={removeWorkflowNode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  disabled: { opacity: 0.4 },
  projectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  topActions: { flexDirection: 'row', gap: 6 },
  topBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  topBtnText: { fontSize: 13, fontWeight: '700' },
  canvasWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  canvasContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvasContent: { paddingVertical: 12, minHeight: 300 },
  emptyCanvas: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyCanvasIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 100,
  },
});
