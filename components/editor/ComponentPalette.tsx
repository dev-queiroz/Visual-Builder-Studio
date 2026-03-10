import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COMPONENT_DEFINITIONS } from '@/utils/componentDefaults';
import { UIComponentType } from '@/types';
import { AppColors } from '@/constants/colors';

interface Props {
  onAddComponent: (type: UIComponentType) => void;
}

function ComponentIcon({ def }: { def: (typeof COMPONENT_DEFINITIONS)[0] }) {
  const size = 20;
  const color = def.previewColor;
  switch (def.iconFamily) {
    case 'MaterialIcons':
      return <MaterialIcons name={def.icon as any} size={size} color={color} />;
    case 'Feather':
      return <Feather name={def.icon as any} size={size} color={color} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={def.icon as any} size={size} color={color} />;
    default:
      return <Ionicons name={def.icon as any} size={size} color={color} />;
  }
}

export default function ComponentPalette({ onAddComponent }: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;

  const handleAdd = (type: UIComponentType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddComponent(type);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      <View style={styles.header}>
        <View style={[styles.pill, { backgroundColor: theme.border }]} />
        <Text style={[styles.title, { color: theme.textSecondary }]}>Components</Text>
      </View>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {COMPONENT_DEFINITIONS.map((def) => (
          <TouchableOpacity
            key={def.type}
            style={[styles.chip, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            onPress={() => handleAdd(def.type)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: def.previewColor + '20' }]}>
              <ComponentIcon def={def} />
            </View>
            <Text style={[styles.chipLabel, { color: theme.text }]} numberOfLines={1}>
              {def.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: 8,
    maxHeight: 220,
  },
  header: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
  },
  pill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: '28%',
    flex: 1,
    maxWidth: '32%',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
