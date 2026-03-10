import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { loadProjects } from '@/utils/storage';
import { useEditorStore } from '@/store/editorStore';
import { UIComponentType } from '@/types';
import ScreenTabs from '@/components/editor/ScreenTabs';
import CanvasItem from '@/components/editor/CanvasItem';
import ComponentPalette from '@/components/editor/ComponentPalette';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import PreviewModal from '@/components/editor/PreviewModal';
import CodeModal from '@/components/editor/CodeModal';
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
    duplicateComponent,
  } = useEditorStore();

  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const activeScreen = project?.screens.find((s) => s.id === activeScreenId) ?? null;
  const selectedComponent = activeScreen?.components.find((c) => c.id === selectedComponentId) ?? null;

  useEffect(() => {
    loadProjects().then((projects) => {
      const found = projects.find((p) => p.id === projectId);
      if (found) {
        setProject(found);
      }
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPadding + 8,
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.projectName, { color: theme.text }]} numberOfLines={1}>
          {project.name}
        </Text>
        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPreview(true);
            }}
            style={[styles.topBtn, { backgroundColor: AppColors.cyan + '18' }]}
          >
            <MaterialIcons name="play-arrow" size={18} color={AppColors.cyan} />
            <Text style={[styles.topBtnText, { color: AppColors.cyan }]}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCode(true);
            }}
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

      {/* Canvas */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.canvasContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => {
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
              onSelect={() =>
                setSelectedComponent(comp.id === selectedComponentId ? null : comp.id)
              }
              onMoveUp={() => moveComponentUp(comp.id)}
              onMoveDown={() => moveComponentDown(comp.id)}
              onDelete={() => removeComponent(comp.id)}
              onDuplicate={() => duplicateComponent(comp.id)}
              isFirst={idx === 0}
              isLast={idx === (activeScreen?.components.length ?? 0) - 1}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom Panel: Properties or Palette */}
      {selectedComponent ? (
        <PropertiesPanel
          component={selectedComponent}
          onUpdateProp={(key, value) => updateComponentProp(selectedComponent.id, key, value)}
          onClose={() => setSelectedComponent(null)}
        />
      ) : (
        <ComponentPalette
          onAddComponent={(type: UIComponentType) => addComponent(type)}
        />
      )}

      {/* Bottom safe area */}
      <View style={{ height: insets.bottom + (Platform.OS === 'web' ? 34 : 0), backgroundColor: theme.surface }} />

      <PreviewModal
        visible={showPreview}
        screen={activeScreen}
        onClose={() => setShowPreview(false)}
      />
      <CodeModal
        visible={showCode}
        project={project}
        onClose={() => setShowCode(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  topBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  canvasContent: {
    paddingVertical: 12,
    minHeight: 300,
  },
  emptyCanvas: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyCanvasIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
});
