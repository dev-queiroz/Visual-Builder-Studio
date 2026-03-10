import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Project } from '@/types';
import { AppColors } from '@/constants/colors';

interface Props {
  project: Project;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const CARD_ACCENTS = [
  '#7C3AED', '#06B6D4', '#F59E0B', '#EF4444', '#10B981',
  '#6366F1', '#EC4899', '#F97316', '#14B8A6', '#8B5CF6',
];

function getAccent(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return CARD_ACCENTS[hash % CARD_ACCENTS.length];
}

export default function ProjectCard({ project, onEdit, onDuplicate, onDelete }: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const accent = getAccent(project.id);

  const handleMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      project.name,
      `${project.screens.length} screen${project.screens.length !== 1 ? 's' : ''}`,
      [
        { text: 'Duplicate', onPress: onDuplicate },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Delete Project', `Delete "${project.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                onDelete();
              },
            },
          ]);
        }},
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const totalComponents = project.screens.reduce(
    (sum, s) => sum + s.components.length,
    0
  );

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.selectionAsync();
        onEdit();
      }}
      activeOpacity={0.88}
      style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}
    >
      <View style={[styles.accent, { backgroundColor: accent }]}>
        <View style={styles.accentIcon}>
          <MaterialIcons name="phone-android" size={28} color="#FFF" />
        </View>
        <View style={styles.accentScreenCount}>
          <Text style={styles.accentScreenText}>{project.screens.length}</Text>
          <Text style={styles.accentScreenLabel}>screens</Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {project.name}
          </Text>
          <TouchableOpacity onPress={handleMore} style={styles.moreBtn} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Feather name="more-horizontal" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.meta}>
          <View style={[styles.metaBadge, { backgroundColor: accent + '18' }]}>
            <MaterialIcons name="layers" size={12} color={accent} />
            <Text style={[styles.metaText, { color: accent }]}>
              {totalComponents} component{totalComponents !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={[styles.date, { color: theme.textTertiary }]}>
            {formatDate(project.updatedAt)}
          </Text>
        </View>
        <View style={[styles.screensList]}>
          {project.screens.slice(0, 4).map((s, i) => (
            <View
              key={s.id}
              style={[styles.screenBadge, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            >
              <Text style={[styles.screenBadgeText, { color: theme.textSecondary }]} numberOfLines={1}>
                {s.name}
              </Text>
            </View>
          ))}
          {project.screens.length > 4 && (
            <View style={[styles.screenBadge, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              <Text style={[styles.screenBadgeText, { color: theme.textSecondary }]}>
                +{project.screens.length - 4}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  accent: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
  },
  accentIcon: {
    opacity: 0.9,
  },
  accentScreenCount: {
    alignItems: 'center',
  },
  accentScreenText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 22,
  },
  accentScreenLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  moreBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  screensList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  screenBadge: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  screenBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 80,
  },
});
