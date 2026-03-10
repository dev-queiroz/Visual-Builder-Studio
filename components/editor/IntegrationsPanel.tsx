import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DataSource } from '@/types';
import { AppColors } from '@/constants/colors';

interface Props {
  visible: boolean;
  dataSources: DataSource[];
  onClose: () => void;
  onAdd: (ds: Omit<DataSource, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, ds: Partial<DataSource>) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#10B981',
  POST: '#F59E0B',
  PUT: '#3B82F6',
  DELETE: '#EF4444',
};

const DEFAULT_DS: Omit<DataSource, 'id'> = {
  name: '',
  type: 'rest',
  url: 'https://jsonplaceholder.typicode.com/posts',
  method: 'GET',
  headers: {},
  body: '',
};

export default function IntegrationsPanel({
  visible,
  dataSources,
  onClose,
  onAdd,
  onRemove,
  onUpdate,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<DataSource, 'id'>>(DEFAULT_DS);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleAdd = () => {
    if (!form.name.trim() || !form.url.trim()) {
      Alert.alert('Missing fields', 'Name and URL are required.');
      return;
    }
    onAdd({ ...form });
    setForm(DEFAULT_DS);
    setAdding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleTest = async (ds: DataSource) => {
    setTesting(ds.id);
    setTestResult(null);
    try {
      const res = await fetch(ds.url, { method: ds.method });
      setTestResult(`✓ ${res.status} ${res.statusText}`);
    } catch (e: any) {
      setTestResult(`✗ ${e.message}`);
    }
    setTesting(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.panel, { backgroundColor: theme.surface, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
            <View style={[styles.pill, { backgroundColor: theme.border }]} />
            <View style={styles.titleRow}>
              <MaterialIcons name="cloud" size={20} color={AppColors.cyan} />
              <Text style={[styles.title, { color: theme.text }]}>Integrations</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Connect REST APIs and JSON data sources
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {dataSources.length === 0 && !adding && (
              <View style={styles.emptyWrap}>
                <MaterialIcons name="cloud-off" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Connections Yet</Text>
                <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                  Add a REST API or JSON source to bind data to your components
                </Text>
              </View>
            )}

            {dataSources.map((ds) => (
              <View key={ds.id} style={[styles.dsCard, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                <View style={styles.dsHeader}>
                  <View style={[styles.methodTag, { backgroundColor: METHOD_COLORS[ds.method] + '20' }]}>
                    <Text style={[styles.methodText, { color: METHOD_COLORS[ds.method] }]}>{ds.method}</Text>
                  </View>
                  <Text style={[styles.dsName, { color: theme.text }]}>{ds.name}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Remove', `Remove "${ds.name}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => onRemove(ds.id) },
                      ]);
                    }}
                    style={styles.dsRemoveBtn}
                  >
                    <Feather name="trash-2" size={15} color={AppColors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.dsUrl, { color: theme.textSecondary }]} numberOfLines={1}>{ds.url}</Text>
                <View style={styles.dsFooter}>
                  <TouchableOpacity
                    onPress={() => handleTest(ds)}
                    style={[styles.testBtn, { backgroundColor: AppColors.cyan + '18' }]}
                    disabled={testing === ds.id}
                  >
                    <MaterialIcons name="play-arrow" size={15} color={AppColors.cyan} />
                    <Text style={{ color: AppColors.cyan, fontWeight: '600', fontSize: 13 }}>
                      {testing === ds.id ? 'Testing...' : 'Test'}
                    </Text>
                  </TouchableOpacity>
                  {testResult && testing !== ds.id && (
                    <Text style={[styles.testResult, { color: testResult.startsWith('✓') ? '#10B981' : '#EF4444' }]}>
                      {testResult}
                    </Text>
                  )}
                </View>
              </View>
            ))}

            {adding && (
              <View style={[styles.addForm, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                <Text style={[styles.formTitle, { color: theme.text }]}>New Connection</Text>

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Name</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
                  placeholder="My API"
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                />

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Method</Text>
                <View style={styles.methodRow}>
                  {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setForm((f) => ({ ...f, method: m }))}
                      style={[
                        styles.methodOpt,
                        {
                          backgroundColor: form.method === m ? METHOD_COLORS[m] : theme.surface,
                          borderColor: form.method === m ? METHOD_COLORS[m] : theme.border,
                        },
                      ]}
                    >
                      <Text style={{ color: form.method === m ? '#FFF' : theme.text, fontWeight: '700', fontSize: 12 }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>URL</Text>
                <TextInput
                  value={form.url}
                  onChangeText={(t) => setForm((f) => ({ ...f, url: t }))}
                  placeholder="https://api.example.com/data"
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                {form.method !== 'GET' && (
                  <>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Body (JSON)</Text>
                    <TextInput
                      value={form.body}
                      onChangeText={(t) => setForm((f) => ({ ...f, body: t }))}
                      placeholder='{"key": "value"}'
                      placeholderTextColor={theme.textTertiary}
                      style={[styles.input, styles.bodyInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                      multiline
                      numberOfLines={4}
                    />
                  </>
                )}

                <View style={styles.formActions}>
                  <TouchableOpacity
                    onPress={() => { setAdding(false); setForm(DEFAULT_DS); }}
                    style={[styles.cancelBtn, { backgroundColor: theme.surfaceTertiary }]}
                  >
                    <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAdd}
                    style={[styles.saveBtn, { backgroundColor: AppColors.cyan }]}
                  >
                    <MaterialIcons name="add" size={16} color="#FFF" />
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!adding && (
              <TouchableOpacity
                onPress={() => setAdding(true)}
                style={[styles.addBtn, { borderColor: AppColors.cyan }]}
              >
                <MaterialIcons name="add" size={18} color={AppColors.cyan} />
                <Text style={{ color: AppColors.cyan, fontWeight: '700', fontSize: 14 }}>Add Connection</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  panel: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  topBar: { alignItems: 'center', paddingTop: 10, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  pill: { width: 36, height: 4, borderRadius: 2, marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '800', flex: 1 },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 13, alignSelf: 'flex-start' },
  content: { padding: 16, gap: 12 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  dsCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 8 },
  dsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  methodText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  dsName: { flex: 1, fontSize: 15, fontWeight: '600' },
  dsRemoveBtn: { padding: 4 },
  dsUrl: { fontSize: 12, fontFamily: 'monospace' },
  dsFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  testBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  testResult: { fontSize: 12, fontWeight: '600' },
  addForm: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 8 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  bodyInput: { minHeight: 80, textAlignVertical: 'top' },
  methodRow: { flexDirection: 'row', gap: 8 },
  methodOpt: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtn: { flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed' },
});
