import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  FlatList,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Project, DEFAULT_THEME } from '@/types';
import { TEMPLATES, ProjectTemplate } from '@/utils/templates';
import { AppColors } from '@/constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (project: Project) => void;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function instantiateTemplate(template: ProjectTemplate): Project {
  const now = Date.now();
  return {
    ...template.project,
    id: genId(),
    theme: template.project.theme ?? DEFAULT_THEME,
    dataSources: [],
    createdAt: now,
    updatedAt: now,
    screens: template.project.screens.map((s) => ({
      ...s,
      id: genId(),
      components: s.components.map((c) => ({ ...c, id: genId() })),
    })),
  };
}

export default function TemplateGallery({ visible, onClose, onSelectTemplate }: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ProjectTemplate | null>(null);

  const handleSelect = (template: ProjectTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(template);
  };

  const handleUse = () => {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const project = instantiateTemplate(selected);
    onSelectTemplate(project);
    setSelected(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.panel, { backgroundColor: theme.surface, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
            <View style={[styles.pill, { backgroundColor: theme.border }]} />
            <View style={styles.titleRow}>
              <MaterialIcons name="grid-view" size={20} color={AppColors.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Templates</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Start with a ready-made template and customize it
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {TEMPLATES.map((template) => {
              const isSelected = selected?.id === template.id;
              return (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => handleSelect(template)}
                  activeOpacity={0.85}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      borderColor: isSelected ? template.color : theme.border,
                      borderWidth: isSelected ? 2.5 : 1,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[template.color + '30', template.color + '10']}
                    style={styles.cardIcon}
                  >
                    <MaterialIcons name={template.icon as any} size={32} color={template.color} />
                  </LinearGradient>
                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardName, { color: theme.text }]}>{template.name}</Text>
                      <View style={[styles.categoryTag, { backgroundColor: template.color + '18' }]}>
                        <Text style={[styles.categoryText, { color: template.color }]}>
                          {template.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {template.description}
                    </Text>
                    <View style={styles.cardMeta}>
                      <MaterialIcons name="layers" size={13} color={theme.textTertiary} />
                      <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                        {template.project.screens.length} screens
                      </Text>
                      <Text style={[styles.metaDot, { color: theme.textTertiary }]}>·</Text>
                      <MaterialIcons name="widgets" size={13} color={theme.textTertiary} />
                      <Text style={[styles.metaText, { color: theme.textTertiary }]}>
                        {template.project.screens.reduce((sum, s) => sum + s.components.length, 0)} components
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: template.color }]}>
                      <MaterialIcons name="check" size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selected && (
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <View style={styles.selectedInfo}>
                <View style={[styles.selectedDot, { backgroundColor: selected.color }]} />
                <Text style={[styles.selectedName, { color: theme.text }]}>{selected.name}</Text>
              </View>
              <TouchableOpacity
                onPress={handleUse}
                activeOpacity={0.85}
                style={[styles.useBtn, { backgroundColor: selected.color }]}
              >
                <MaterialIcons name="bolt" size={18} color="#FFF" />
                <Text style={styles.useBtnText}>Use Template</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  topBar: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  pill: { width: 36, height: 4, borderRadius: 2, marginBottom: 10 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 4,
  },
  title: { fontSize: 20, fontWeight: '800', flex: 1 },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 13, alignSelf: 'flex-start' },
  grid: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    position: 'relative',
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardName: { fontSize: 16, fontWeight: '700' },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 12 },
  metaDot: { fontSize: 12 },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  selectedInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectedDot: { width: 12, height: 12, borderRadius: 6 },
  selectedName: { fontSize: 15, fontWeight: '700' },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  useBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
