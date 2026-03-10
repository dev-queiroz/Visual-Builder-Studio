import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppScreen } from '@/types';
import { AppColors } from '@/constants/colors';

interface Props {
  screens: AppScreen[];
  activeScreenId: string;
  onSelectScreen: (id: string) => void;
  onAddScreen: () => void;
  onDeleteScreen: (id: string) => void;
  onRenameScreen: (id: string, name: string) => void;
}

export default function ScreenTabs({
  screens,
  activeScreenId,
  onSelectScreen,
  onAddScreen,
  onDeleteScreen,
  onRenameScreen,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const handleLongPress = (screen: AppScreen) => {
    if (screens.length <= 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      screen.name,
      'What would you like to do?',
      [
        {
          text: 'Rename',
          onPress: () => {
            setRenameText(screen.name);
            setRenaming(screen.id);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDeleteScreen(screen.id);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
      >
        {screens.map((screen) => {
          const isActive = screen.id === activeScreenId;
          return (
            <TouchableOpacity
              key={screen.id}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectScreen(screen.id);
              }}
              onLongPress={() => handleLongPress(screen)}
              style={[
                styles.tab,
                isActive && { borderBottomColor: AppColors.primary, borderBottomWidth: 2 },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? AppColors.primary : theme.textSecondary },
                  isActive && styles.tabTextActive,
                ]}
                numberOfLines={1}
              >
                {screen.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAddScreen();
          }}
          style={styles.addBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!renaming} transparent animationType="fade">
        <TouchableOpacity
          style={styles.renameOverlay}
          activeOpacity={1}
          onPress={() => setRenaming(null)}
        >
          <View style={[styles.renameModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.renameTitle, { color: theme.text }]}>Rename Screen</Text>
            <TextInput
              value={renameText}
              onChangeText={setRenameText}
              style={[styles.renameInput, { color: theme.text, backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
              autoFocus
              selectTextOnFocus
              onSubmitEditing={() => {
                if (renaming && renameText.trim()) {
                  onRenameScreen(renaming, renameText.trim());
                }
                setRenaming(null);
              }}
            />
            <View style={styles.renameActions}>
              <TouchableOpacity
                onPress={() => setRenaming(null)}
                style={[styles.renameCancel, { backgroundColor: theme.surfaceSecondary }]}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (renaming && renameText.trim()) {
                    onRenameScreen(renaming, renameText.trim());
                  }
                  setRenaming(null);
                }}
                style={[styles.renameSave, { backgroundColor: AppColors.primary }]}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  tabList: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 100,
  },
  tabTextActive: {
    fontWeight: '700',
  },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  renameModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  renameTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  renameActions: {
    flexDirection: 'row',
    gap: 10,
  },
  renameCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  renameSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
