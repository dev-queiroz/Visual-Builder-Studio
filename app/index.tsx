import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  TextInput,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { loadProjects, deleteProject, saveProject } from '@/utils/storage';
import { createNewProject } from '@/store/editorStore';
import { Project } from '@/types';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { AppColors } from '@/constants/colors';

export default function DashboardScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadProjects().then((ps) => {
        setProjects(ps);
        setLoading(false);
      });
    }, [])
  );

  const handleCreate = async () => {
    const name = newName.trim() || 'My App';
    const project = createNewProject(name);
    await saveProject(project);
    setProjects((prev) => [project, ...prev]);
    setCreating(false);
    setNewName('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({ pathname: '/editor/[projectId]', params: { projectId: project.id } });
  };

  const handleDuplicate = async (project: Project) => {
    const dup: Project = {
      ...project,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      name: project.name + ' Copy',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      screens: project.screens.map((s) => ({
        ...s,
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        components: s.components.map((c) => ({
          ...c,
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        })),
      })),
    };
    await saveProject(dup);
    setProjects((prev) => [dup, ...prev]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDark ? ['#1A0A3E', '#0D0D1A'] : ['#F0EEFF', '#F4F4F8']}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16) }]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <LinearGradient
              colors={[AppColors.primary, AppColors.cyan]}
              style={styles.logoGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="bolt" size={28} color="#FFF" />
            </LinearGradient>
          </View>
          <View>
            <Text style={[styles.logoText, { color: theme.text }]}>AppZap</Text>
            <Text style={[styles.logoSub, { color: theme.textSecondary }]}>Visual App Builder</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCreating(true);
          }}
          style={styles.newBtn}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.primaryDark]}
            style={styles.newBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="add" size={20} color="#FFF" />
            <Text style={styles.newBtnText}>New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={AppColors.primary} size="large" />
        </View>
      ) : projects.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyWrap}>
          <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <LinearGradient
              colors={[AppColors.primary + '20', AppColors.cyan + '20']}
              style={styles.emptyIconWrap}
            >
              <MaterialIcons name="phone-android" size={48} color={AppColors.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Build your first app
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Drag and drop components, edit properties, preview and export clean React Native code — all without writing a line of code.
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCreating(true);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[AppColors.primary, AppColors.primaryDark]}
                style={styles.emptyBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="add" size={20} color="#FFF" />
                <Text style={styles.emptyBtnText}>Create New Project</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.featureList}>
            {[
              { icon: 'layers', text: '12 UI components', color: AppColors.primary },
              { icon: 'palette', text: 'Visual property editor', color: AppColors.cyan },
              { icon: 'phone-iphone', text: 'Live preview', color: AppColors.accent },
              { icon: 'code', text: 'Export clean code', color: '#10B981' },
            ].map((f) => (
              <View key={f.text} style={[styles.featureItem, { backgroundColor: theme.surface }]}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '20' }]}>
                  <MaterialIcons name={f.icon as any} size={18} color={f.color} />
                </View>
                <Text style={[styles.featureText, { color: theme.textSecondary }]}>{f.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 24) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </Text>
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={() =>
                router.push({ pathname: '/editor/[projectId]', params: { projectId: p.id } })
              }
              onDuplicate={() => handleDuplicate(p)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={creating} transparent animationType="slide" onRequestClose={() => setCreating(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCreating(false)}
        >
          <View
            style={[
              styles.createModal,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                marginBottom: insets.bottom + 16,
              },
            ]}
          >
            <View style={[styles.modalPill, { backgroundColor: theme.border }]} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Project</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Give your app a name to get started
            </Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="My Awesome App"
              placeholderTextColor={theme.textTertiary}
              style={[
                styles.nameInput,
                {
                  color: theme.text,
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}
              autoFocus
              onSubmitEditing={handleCreate}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => { setCreating(false); setNewName(''); }}
                style={[styles.cancelBtn, { backgroundColor: theme.surfaceSecondary }]}
              >
                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} activeOpacity={0.85} style={{ flex: 1 }}>
                <LinearGradient
                  colors={[AppColors.primary, AppColors.primaryDark]}
                  style={styles.createBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="bolt" size={18} color="#FFF" />
                  <Text style={styles.createBtnText}>Create</Text>
                </LinearGradient>
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
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  logoGrad: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  newBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  newBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  newBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    padding: 20,
    gap: 16,
    flexGrow: 1,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    paddingTop: 16,
    gap: 0,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  createModal: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  modalPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: -6,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: '600',
    fontSize: 15,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
