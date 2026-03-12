import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  useColorScheme,
  Platform,
  Modal,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { UIComponent, PropertyControl, AppScreen } from '@/types';
import { COMPONENT_MAP } from '@/utils/componentDefaults';
import { AppColors } from '@/constants/colors';

const PRESET_COLORS = [
  '#7C3AED', '#06B6D4', '#F59E0B', '#EF4444', '#10B981',
  '#6366F1', '#EC4899', '#F97316', '#14B8A6', '#8B5CF6',
  '#111128', '#5B5B7A', '#9494B0', '#E2E2EC', '#FFFFFF',
  '#0D0D1A', '#16162A', '#1E1E32', '#F4F4F8', '#F0F0FF',
];

interface ColorPickerModalProps {
  visible: boolean; value: string;
  onClose: () => void; onChange: (c: string) => void;
}
function ColorPickerModal({ visible, value, onClose, onChange }: ColorPickerModalProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const [hex, setHex] = useState(value);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.colorModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.colorModalTitle, { color: theme.text }]}>Pick Color</Text>
          <View style={styles.presetGrid}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity key={c} onPress={() => { onChange(c); setHex(c); onClose(); }}
                style={[styles.colorSwatch, { backgroundColor: c, borderColor: c === value ? AppColors.primary : 'transparent', borderWidth: 3 }]} />
            ))}
          </View>
          <View style={[styles.hexRow, { borderTopColor: theme.border }]}>
            <View style={[styles.hexPreview, { backgroundColor: hex }]} />
            <TextInput
              value={hex} onChangeText={(t) => { setHex(t); if (/^#[0-9A-Fa-f]{6}$/.test(t)) onChange(t); }}
              style={[styles.hexInput, { color: theme.text, backgroundColor: theme.surfaceSecondary }]}
              placeholder="#RRGGBB" placeholderTextColor={theme.textTertiary} autoCapitalize="characters" maxLength={7}
            />
            <TouchableOpacity onPress={() => { if (/^#[0-9A-Fa-f]{6}$/.test(hex)) { onChange(hex); onClose(); } }}
              style={[styles.hexOkBtn, { backgroundColor: AppColors.primary }]}>
              <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface ScreenSelectModalProps {
  visible: boolean; screens: AppScreen[]; currentValue: string;
  onClose: () => void; onSelect: (name: string) => void;
}
function ScreenSelectModal({ visible, screens, currentValue, onClose, onSelect }: ScreenSelectModalProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.colorModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.colorModalTitle, { color: theme.text }]}>Navigate To</Text>
          {screens.map((s) => (
            <TouchableOpacity key={s.id} onPress={() => { onSelect(s.name); onClose(); }}
              style={[styles.screenOpt, { backgroundColor: s.name === currentValue ? AppColors.primary + '20' : theme.surfaceSecondary, borderColor: s.name === currentValue ? AppColors.primary : theme.border }]}>
              <MaterialIcons name="phone-android" size={16} color={s.name === currentValue ? AppColors.primary : theme.textSecondary} />
              <Text style={{ flex: 1, color: s.name === currentValue ? AppColors.primary : theme.text, fontWeight: s.name === currentValue ? '700' : '500', fontSize: 14 }}>{s.name}</Text>
              {s.name === currentValue && <MaterialIcons name="check" size={16} color={AppColors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface SliderRowProps {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; isDark: boolean;
}
function SliderRow({ label, value, min, max, step, onChange, isDark }: SliderRowProps) {
  const theme = isDark ? AppColors.dark : AppColors.light;
  const pct = `${Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))}%`;
  return (
    <View style={styles.propRow}>
      <View style={styles.propLabelRow}>
        <Text style={[styles.propLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.propValue, { color: theme.text }]}>{value}</Text>
      </View>
      <View style={[styles.sliderTrack, { backgroundColor: theme.surfaceTertiary }]}>
        <View style={[styles.sliderFill, { width: pct as any, backgroundColor: AppColors.primary }]} />
        <View style={styles.sliderBtns}>
          <TouchableOpacity onPress={() => onChange(Math.max(min, value - step))} style={[styles.sliderBtn, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sliderBtnText, { color: theme.text }]}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onChange(Math.min(max, value + step))} style={[styles.sliderBtn, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sliderBtnText, { color: theme.text }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface Props {
  component: UIComponent;
  onUpdateProp: (key: string, value: any) => void;
  onUpdateEvent?: (eventName: string, workflowNodeId: string) => void;
  onClose: () => void;
  projectScreens?: AppScreen[];
  availableWorkflowNodes?: WorkflowNode[];
}

export default function PropertiesPanel({
  component,
  onUpdateProp,
  onUpdateEvent,
  onClose,
  projectScreens = [],
  availableWorkflowNodes = []
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const def = COMPONENT_MAP[component.type];
  const [activeTab, setActiveTab] = useState<'props' | 'events'>('props');
  const [colorPickerKey, setColorPickerKey] = useState<string | null>(null);
  const [screenPickerKey, setScreenPickerKey] = useState<string | null>(null);
  const [eventPickerKey, setEventPickerKey] = useState<string | null>(null);

  const controls = (def?.propertyControls ?? []).filter(
    (c): c is PropertyControl => c !== null && typeof c === 'object' && 'kind' in c
  );

  const renderControl = (control: PropertyControl, idx: number) => {
    if (control.kind === 'section') {
      return (
        <View key={`section-${idx}`} style={[styles.sectionDivider, { borderTopColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{control.label}</Text>
        </View>
      );
    }

    if (control.kind === 'screenSelect') {
      if (component.props.actionType !== 'navigate') return null;
      const value = component.props[control.key] ?? '';
      return (
        <View key={control.key} style={styles.propRow}>
          <Text style={[styles.propLabel, { color: theme.textSecondary }]}>{control.label}</Text>
          <TouchableOpacity
            onPress={() => setScreenPickerKey(control.key)}
            style={[styles.colorPreview, { borderColor: theme.border }]}
          >
            <MaterialIcons name="phone-android" size={18} color={AppColors.primary} />
            <Text style={[{ flex: 1, fontSize: 14, color: value ? theme.text : theme.textTertiary }]}>
              {value || 'Select screen...'}
            </Text>
            <MaterialIcons name="chevron-right" size={16} color={theme.textTertiary} />
          </TouchableOpacity>
          <ScreenSelectModal
            visible={screenPickerKey === control.key}
            screens={projectScreens}
            currentValue={value}
            onClose={() => setScreenPickerKey(null)}
            onSelect={(name) => onUpdateProp(control.key, name)}
          />
        </View>
      );
    }

    const value = component.props[control.key] ?? (def?.defaultProps?.[control.key] ?? '');

    switch (control.kind) {
      case 'text':
        return (
          <View key={control.key} style={styles.propRow}>
            <Text style={[styles.propLabel, { color: theme.textSecondary }]}>{control.label}</Text>
            <TextInput
              value={String(value)}
              onChangeText={(t) => onUpdateProp(control.key, t)}
              style={[styles.textInput, { color: theme.text, backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
              placeholderTextColor={theme.textTertiary}
              placeholder={control.label}
              multiline={control.key === 'content' || control.key === 'subtitle'}
              numberOfLines={control.key === 'content' || control.key === 'subtitle' ? 3 : 1}
            />
          </View>
        );

      case 'number':
        return (
          <SliderRow
            key={control.key} label={control.label}
            value={typeof value === 'number' ? value : Number(value) || 0}
            min={control.min ?? 0} max={control.max ?? 100} step={control.step ?? 1}
            onChange={(v) => onUpdateProp(control.key, v)} isDark={isDark}
          />
        );

      case 'color':
        return (
          <View key={control.key} style={styles.propRow}>
            <Text style={[styles.propLabel, { color: theme.textSecondary }]}>{control.label}</Text>
            <TouchableOpacity onPress={() => setColorPickerKey(control.key)} style={[styles.colorPreview, { borderColor: theme.border }]}>
              <View style={[styles.colorDot, { backgroundColor: value || '#000' }]} />
              <Text style={[styles.colorHex, { color: theme.text }]}>{value || '#000'}</Text>
              <MaterialIcons name="chevron-right" size={16} color={theme.textTertiary} />
            </TouchableOpacity>
            <ColorPickerModal
              visible={colorPickerKey === control.key}
              value={value || '#000000'}
              onClose={() => setColorPickerKey(null)}
              onChange={(c) => onUpdateProp(control.key, c)}
            />
          </View>
        );

      case 'select':
        return (
          <View key={control.key} style={styles.propRow}>
            <Text style={[styles.propLabel, { color: theme.textSecondary }]}>{control.label}</Text>
            <View style={styles.selectRow}>
              {control.options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => onUpdateProp(control.key, opt.value)}
                  style={[styles.selectOpt, { backgroundColor: value === opt.value ? AppColors.primary : theme.surfaceSecondary, borderColor: value === opt.value ? AppColors.primary : theme.border }]}
                >
                  <Text style={[styles.selectOptText, { color: value === opt.value ? '#FFF' : theme.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'toggle':
        return (
          <View key={control.key} style={[styles.propRow, styles.toggleRow]}>
            <Text style={[styles.propLabel, { color: theme.textSecondary }]}>{control.label}</Text>
            <Switch value={!!value} onValueChange={(v) => onUpdateProp(control.key, v)} trackColor={{ false: theme.border, true: AppColors.primary }} thumbColor="#FFF" />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('props')}
          style={[styles.tab, activeTab === 'props' && { borderBottomColor: AppColors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'props' ? AppColors.primary : theme.textSecondary }]}>Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('events')}
          style={[styles.tab, activeTab === 'events' && { borderBottomColor: AppColors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'events' ? AppColors.primary : theme.textSecondary }]}>Events</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {activeTab === 'props' ? (
          controls.map((control, idx) => renderControl(control, idx))
        ) : (
          <EventsList
            component={component}
            availableWorkflowNodes={availableWorkflowNodes}
            onUpdateEvent={onUpdateEvent}
            isDark={isDark}
          />
        )}
      </ScrollView>
    </View>
  );
}

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, maxHeight: 400 },
  topBar: { alignItems: 'center', paddingTop: 8, paddingHorizontal: 16, borderBottomWidth: 1 },
  pill: { width: 36, height: 4, borderRadius: 2, marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', marginBottom: 8 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '700' },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeName: { fontSize: 12, fontWeight: '700' },
  panelTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  propRow: { gap: 6 },
  propLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  propLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  propValue: { fontSize: 13, fontWeight: '600' },
  textInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, minHeight: 38 },
  sliderTrack: { height: 36, borderRadius: 8, overflow: 'hidden', position: 'relative', justifyContent: 'center' },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 8 },
  sliderBtns: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  sliderBtn: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  sliderBtnText: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
  colorPreview: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  colorDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  colorHex: { flex: 1, fontSize: 13, fontFamily: MONO },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  selectOpt: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  selectOptText: { fontSize: 13, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  colorModal: { width: '100%', maxWidth: 360, borderRadius: 16, padding: 20, borderWidth: 1, gap: 16 },
  colorModalTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  colorSwatch: { width: 36, height: 36, borderRadius: 8 },
  hexRow: { flexDirection: 'row', gap: 8, alignItems: 'center', borderTopWidth: 1, paddingTop: 12 },
  hexPreview: { width: 36, height: 36, borderRadius: 8 },
  hexInput: { flex: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, fontFamily: MONO },
  hexOkBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8 },
  screenOpt: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  sectionDivider: { borderTopWidth: 1, paddingTop: 10, marginTop: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  eventRow: { padding: 12, borderRadius: 10, borderWidth: 1, gap: 8 },
  eventLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventLabel: { fontSize: 14, fontWeight: '700' },
});

import { WorkflowNode } from '@/types';

function EventsList({ component, availableWorkflowNodes, onUpdateEvent, isDark }: {
  component: UIComponent;
  availableWorkflowNodes: WorkflowNode[];
  onUpdateEvent?: (e: string, b: string) => void;
  isDark: boolean;
}) {
  const theme = isDark ? AppColors.dark : AppColors.light;

  const getPossibleEvents = (type: string) => {
    switch (type) {
      case 'Button': return ['onPress'];
      case 'TextInput': return ['onChangeText', 'onFocus', 'onBlur'];
      case 'View':
      case 'Card': return ['onLoad', 'onPress'];
      default: return ['onLoad'];
    }
  };

  const events = getPossibleEvents(component.type);

  return (
    <View style={{ gap: 12 }}>
      {events.map(ev => {
        const boundBlockId = component.events?.[ev];
        const boundBlock = availableWorkflowNodes.find(b => b.id === boundBlockId);

        return (
          <View key={ev} style={[styles.eventRow, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
            <View style={styles.eventLabelRow}>
              <Text style={[styles.eventLabel, { color: theme.text }]}>{ev}</Text>
              {boundBlockId ? (
                <TouchableOpacity onPress={() => onUpdateEvent?.(ev, '')}>
                  <MaterialIcons name="link-off" size={18} color={AppColors.primary} />
                </TouchableOpacity>
              ) : (
                <MaterialIcons name="link" size={18} color={theme.textTertiary} />
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {availableWorkflowNodes.filter(b => b.type === 'trigger').map(block => (
                  <TouchableOpacity
                    key={block.id}
                    onPress={() => onUpdateEvent?.(ev, block.id)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      backgroundColor: boundBlockId === block.id ? AppColors.primary : theme.surface,
                      borderColor: boundBlockId === block.id ? AppColors.primary : theme.border
                    }}
                  >
                    <Text style={{ fontSize: 12, color: boundBlockId === block.id ? '#FFF' : theme.text, fontWeight: '600' }}>
                      {block.opcode}
                    </Text>
                  </TouchableOpacity>
                ))}
                {availableWorkflowNodes.filter(b => b.type === 'trigger').length === 0 && (
                  <Text style={{ fontSize: 12, color: theme.textTertiary }}>No trigger nodes found. Create one in Workflow Editor.</Text>
                )}
              </View>
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}
