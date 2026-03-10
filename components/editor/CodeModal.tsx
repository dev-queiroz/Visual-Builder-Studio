import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Project } from '@/types';
import { generateProjectCode, generateFullCodeString } from '@/utils/codeGenerator';
import { AppColors } from '@/constants/colors';

interface Props {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
}

export default function CodeModal({ visible, project, onClose }: Props) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;
  const insets = useSafeAreaInsets();
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const files = project ? generateProjectCode(project) : {};
  const fileNames = Object.keys(files);
  const selectedFile = activeFile ?? fileNames[0] ?? '';
  const code = files[selectedFile] ?? '';

  const handleCopy = async () => {
    const full = project ? generateFullCodeString(project) : '';
    await Clipboard.setStringAsync(full);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyFile = async () => {
    await Clipboard.setStringAsync(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
        <View style={[styles.topBar, { backgroundColor: isDark ? '#16162A' : '#1E1E32', borderBottomColor: '#2A2A46' }]}>
          <View style={styles.topBarLeft}>
            <View style={[styles.topBarDot, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.topBarDot, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.topBarDot, { backgroundColor: '#10B981' }]} />
          </View>
          <Text style={styles.topBarTitle}>
            {project?.name ?? 'Code'} — Generated Code
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={18} color="#9090C0" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={[styles.sidebar, { backgroundColor: '#0D0D1A', borderRightColor: '#2A2A46' }]}>
            <Text style={styles.sidebarTitle}>FILES</Text>
            {fileNames.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => setActiveFile(name)}
                style={[
                  styles.fileItem,
                  selectedFile === name && { backgroundColor: '#7C3AED20' },
                ]}
              >
                <MaterialIcons
                  name={name.endsWith('.json') ? 'data-object' : 'code'}
                  size={14}
                  color={selectedFile === name ? AppColors.primary : '#5A5A8A'}
                />
                <Text
                  style={[
                    styles.fileName,
                    { color: selectedFile === name ? '#F0F0FF' : '#9090C0' },
                  ]}
                  numberOfLines={2}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.codeArea}>
            <View style={[styles.codeHeader, { backgroundColor: '#0D0D1A', borderBottomColor: '#2A2A46' }]}>
              <Text style={styles.activeFileName}>{selectedFile}</Text>
              <TouchableOpacity onPress={handleCopyFile} style={styles.copyBtn}>
                <Feather name={copied ? 'check' : 'copy'} size={14} color={copied ? '#10B981' : '#9090C0'} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.codeScroll}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
              horizontal={false}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.code} selectable>
                  {code}
                </Text>
              </ScrollView>
            </ScrollView>
          </View>
        </View>

        <View style={[styles.footer, { backgroundColor: '#0D0D1A', borderTopColor: '#2A2A46', paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            onPress={handleCopy}
            style={[styles.actionBtn, { backgroundColor: AppColors.primary }]}
            activeOpacity={0.85}
          >
            <Feather name={copied ? 'check' : 'copy'} size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>
              {copied ? 'Copied!' : 'Copy All Files'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.infoBadge, { backgroundColor: '#1E1E32' }]}>
            <MaterialIcons name="info-outline" size={14} color="#5A5A8A" />
            <Text style={styles.infoText}>Run with: npx expo start</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const MONO_FONT = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111128',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  topBarLeft: {
    flexDirection: 'row',
    gap: 5,
  },
  topBarDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  topBarTitle: {
    flex: 1,
    color: '#9090C0',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 110,
    borderRightWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  sidebarTitle: {
    color: '#5A5A8A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 7,
    borderRadius: 6,
    marginBottom: 2,
  },
  fileName: {
    fontSize: 11,
    fontFamily: MONO_FONT,
    flex: 1,
    lineHeight: 16,
  },
  codeArea: {
    flex: 1,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  activeFileName: {
    color: '#9090C0',
    fontSize: 12,
    fontFamily: MONO_FONT,
    flex: 1,
  },
  copyBtn: {
    padding: 6,
  },
  codeScroll: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  code: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: MONO_FONT,
    color: '#C9D1D9',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  infoBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  infoText: {
    color: '#5A5A8A',
    fontSize: 12,
    fontFamily: MONO_FONT,
  },
});
