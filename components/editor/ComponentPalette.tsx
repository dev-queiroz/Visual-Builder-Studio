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
import { Modal, TextInput } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
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

export default function ComponentPalette({ visible, onClose, onAddComponent }: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const [search, setSearch] = React.useState('');

  const filtered = COMPONENT_DEFINITIONS.filter((def) =>
    def.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (type: UIComponentType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddComponent(type);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={[styles.pill, { backgroundColor: theme.border }]} />
            <Text style={[styles.title, { color: theme.textSecondary }]}>Add Component</Text>
          </View>

          <View style={[styles.searchBox, { backgroundColor: theme.surfaceSecondary }]}>
            <Feather name="search" size={16} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search components..."
              placeholderTextColor={theme.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView
            horizontal={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
          >
            {filtered.map((def) => (
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
          <View style={{ height: 40 }} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  pill: {
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    width: '48%',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
