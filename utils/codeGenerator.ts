import { Project, AppScreen, UIComponent } from '@/types';

function indent(n: number) {
  return '  '.repeat(n);
}

function generateComponent(comp: UIComponent, depth: number): string {
  const i = indent(depth);
  const p = comp.props;

  switch (comp.type) {
    case 'View':
      return [
        `${i}<View`,
        `${i}  style={{`,
        `${i}    backgroundColor: '${p.backgroundColor ?? 'transparent'}',`,
        `${i}    padding: ${p.padding ?? 16},`,
        `${i}    borderRadius: ${p.borderRadius ?? 0},`,
        `${i}    flexDirection: '${p.flexDirection ?? 'column'}',`,
        `${i}    alignItems: '${p.alignItems ?? 'flex-start'}',`,
        `${i}    minHeight: ${p.minHeight ?? 60},`,
        `${i}    borderWidth: ${p.borderWidth ?? 0},`,
        `${i}    borderColor: '${p.borderColor ?? 'transparent'}',`,
        `${i}  }}`,
        `${i}>`,
        `${i}  {/* Add children here */}`,
        `${i}</View>`,
      ].join('\n');

    case 'Text':
      return [
        `${i}<Text`,
        `${i}  style={{`,
        `${i}    fontSize: ${p.fontSize ?? 16},`,
        `${i}    color: '${p.color ?? '#000000'}',`,
        `${i}    fontWeight: '${p.fontWeight ?? '400'}',`,
        `${i}    textAlign: '${p.textAlign ?? 'left'}',`,
        `${i}  }}`,
        `${i}>`,
        `${i}  ${p.content ?? 'Hello World'}`,
        `${i}</Text>`,
      ].join('\n');

    case 'Button':
      return [
        `${i}<TouchableOpacity`,
        `${i}  style={{`,
        `${i}    backgroundColor: '${p.backgroundColor ?? '#7C3AED'}',`,
        `${i}    borderRadius: ${p.borderRadius ?? 12},`,
        `${i}    paddingVertical: ${p.paddingVertical ?? 14},`,
        `${i}    paddingHorizontal: ${p.paddingHorizontal ?? 24},`,
        `${i}    alignItems: 'center',`,
        p.fullWidth ? `${i}    alignSelf: 'stretch',` : `${i}    alignSelf: 'flex-start',`,
        `${i}  }}`,
        `${i}  onPress={() => {}}`,
        `${i}>`,
        `${i}  <Text style={{ color: '${p.textColor ?? '#FFFFFF'}', fontSize: ${p.fontSize ?? 16}, fontWeight: '${p.fontWeight ?? '600'}' }}>`,
        `${i}    ${p.label ?? 'Button'}`,
        `${i}  </Text>`,
        `${i}</TouchableOpacity>`,
      ].join('\n');

    case 'TextInput':
      return [
        `${i}<TextInput`,
        `${i}  placeholder="${p.placeholder ?? 'Type here...'}"`,
        `${i}  style={{`,
        `${i}    borderWidth: ${p.borderWidth ?? 1.5},`,
        `${i}    borderColor: '${p.borderColor ?? '#E2E2EC'}',`,
        `${i}    borderRadius: ${p.borderRadius ?? 10},`,
        `${i}    backgroundColor: '${p.backgroundColor ?? '#FFFFFF'}',`,
        `${i}    padding: ${p.padding ?? 14},`,
        `${i}    fontSize: ${p.fontSize ?? 16},`,
        `${i}    color: '${p.color ?? '#111128'}',`,
        `${i}  }}`,
        `${i}/>`,
      ].join('\n');

    case 'Image':
      return [
        `${i}<Image`,
        `${i}  source={{ uri: '${p.uri ?? 'https://picsum.photos/400/200'}' }}`,
        `${i}  style={{`,
        `${i}    width: '100%',`,
        `${i}    height: ${p.height ?? 200},`,
        `${i}    borderRadius: ${p.borderRadius ?? 12},`,
        `${i}  }}`,
        `${i}  resizeMode="${p.resizeMode ?? 'cover'}"`,
        `${i}/>`,
      ].join('\n');

    case 'Card':
      return [
        `${i}<View`,
        `${i}  style={{`,
        `${i}    backgroundColor: '${p.backgroundColor ?? '#FFFFFF'}',`,
        `${i}    padding: ${p.padding ?? 20},`,
        `${i}    borderRadius: ${p.borderRadius ?? 16},`,
        `${i}    shadowColor: '#000',`,
        `${i}    shadowOffset: {{ width: 0, height: 2 }},`,
        `${i}    shadowOpacity: 0.1,`,
        `${i}    shadowRadius: 8,`,
        `${i}    elevation: 3,`,
        `${i}  }}`,
        `${i}>`,
        `${i}  <Text style={{ fontSize: ${p.titleSize ?? 18}, fontWeight: '700', color: '${p.titleColor ?? '#111128'}' }}>`,
        `${i}    ${p.title ?? 'Card Title'}`,
        `${i}  </Text>`,
        `${i}  <Text style={{ fontSize: ${p.subtitleSize ?? 14}, color: '${p.subtitleColor ?? '#5B5B7A'}', marginTop: 4 }}>`,
        `${i}    ${p.subtitle ?? 'Subtitle'}`,
        `${i}  </Text>`,
        `${i}</View>`,
      ].join('\n');

    case 'Header':
      return [
        `${i}<View`,
        `${i}  style={{`,
        `${i}    backgroundColor: '${p.backgroundColor ?? '#7C3AED'}',`,
        `${i}    paddingVertical: ${p.paddingVertical ?? 18},`,
        `${i}    paddingHorizontal: ${p.paddingHorizontal ?? 20},`,
        `${i}    flexDirection: 'row',`,
        `${i}    alignItems: 'center',`,
        `${i}  }}`,
        `${i}>`,
        p.showBack ? `${i}  {/* Back arrow */}\n${i}  <TouchableOpacity onPress={() => router.back()}><Text style={{ color: '${p.textColor}' }}>{'<'}</Text></TouchableOpacity>` : '',
        `${i}  <Text style={{ fontSize: ${p.fontSize ?? 20}, fontWeight: '700', color: '${p.textColor ?? '#FFFFFF'}' }}>`,
        `${i}    ${p.title ?? 'Header'}`,
        `${i}  </Text>`,
        `${i}</View>`,
      ].filter(Boolean).join('\n');

    case 'Footer':
      return [
        `${i}<View`,
        `${i}  style={{`,
        `${i}    backgroundColor: '${p.backgroundColor ?? '#F4F4F8'}',`,
        `${i}    paddingVertical: ${p.paddingVertical ?? 16},`,
        `${i}    alignItems: 'center',`,
        `${i}  }}`,
        `${i}>`,
        `${i}  <Text style={{ fontSize: ${p.fontSize ?? 13}, color: '${p.textColor ?? '#9494B0'}' }}>`,
        `${i}    ${p.text ?? '© 2026 My App'}`,
        `${i}  </Text>`,
        `${i}</View>`,
      ].join('\n');

    case 'Spacer':
      return `${i}<View style={{ height: ${p.height ?? 24} }} />`;

    case 'Divider':
      return [
        `${i}<View`,
        `${i}  style={{`,
        `${i}    height: ${p.thickness ?? 1},`,
        `${i}    backgroundColor: '${p.color ?? '#E2E2EC'}',`,
        `${i}    marginVertical: ${p.marginVertical ?? 8},`,
        `${i}  }}`,
        `${i}/>`,
      ].join('\n');

    case 'ScrollView':
      return [
        `${i}<ScrollView`,
        `${i}  style={{ backgroundColor: '${p.backgroundColor ?? 'transparent'}', minHeight: ${p.minHeight ?? 120} }}`,
        `${i}  contentContainerStyle={{ padding: ${p.padding ?? 16} }}`,
        `${i}>`,
        `${i}  {/* ${p.label ?? 'Scroll Area'} */}`,
        `${i}</ScrollView>`,
      ].join('\n');

    case 'FlatList':
      return [
        `${i}{/* FlatList — ${p.itemText ?? 'List item'} */}`,
        `${i}<FlatList`,
        `${i}  data={Array.from({ length: ${p.itemCount ?? 3} }, (_, i) => ({ id: String(i), text: '${p.itemText ?? 'List item'} ' + (i + 1) }))}`,
        `${i}  keyExtractor={(item) => item.id}`,
        `${i}  ItemSeparatorComponent={() => <View style={{ height: ${p.gap ?? 10} }} />}`,
        `${i}  renderItem={({ item }) => (`,
        `${i}    <View style={{`,
        `${i}      backgroundColor: '${p.itemBackgroundColor ?? '#FFFFFF'}',`,
        `${i}      borderRadius: ${p.itemBorderRadius ?? 10},`,
        `${i}      padding: ${p.itemPadding ?? 14},`,
        `${i}    }}>`,
        `${i}      <Text style={{ fontSize: ${p.itemFontSize ?? 15}, color: '${p.itemColor ?? '#111128'}' }}>{item.text}</Text>`,
        `${i}    </View>`,
        `${i}  )}`,
        `${i}/>`,
      ].join('\n');

    default:
      return `${i}{/* Unknown component: ${comp.type} */}`;
  }
}

function generateScreen(screen: AppScreen): string {
  const componentImports = new Set<string>(['View', 'Text', 'StyleSheet', 'TouchableOpacity', 'ScrollView', 'FlatList', 'TextInput', 'Image']);
  const componentsCode = screen.components.map((c) => generateComponent(c, 3)).join('\n\n');

  return `// AppZap Generated Code — Editable
// Screen: ${screen.name}
import React from 'react';
import { ${[...componentImports].join(', ')} } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ${screen.name.replace(/\s+/g, '')}Screen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '${screen.backgroundColor ?? '#FFFFFF'}' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
${componentsCode}
      </ScrollView>
    </SafeAreaView>
  );
}
`;
}

export function generateProjectCode(project: Project): Record<string, string> {
  const files: Record<string, string> = {};

  project.screens.forEach((screen) => {
    const name = screen.name.replace(/\s+/g, '');
    files[`app/${name}.tsx`] = generateScreen(screen);
  });

  const routeLines = project.screens.map((s) => {
    const name = s.name.replace(/\s+/g, '');
    return `  <Stack.Screen name="${name}" options={{ title: '${s.name}' }} />`;
  });

  files['app/_layout.tsx'] = `// AppZap Generated Code — Editable
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
${routeLines.join('\n')}
    </Stack>
  );
}
`;

  files['package.json'] = JSON.stringify({
    name: project.name.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    main: 'expo-router/entry',
    scripts: { start: 'expo start', android: 'expo run:android', ios: 'expo run:ios' },
    dependencies: {
      'expo': '~53.0.0',
      'expo-router': '~4.0.0',
      'react': '18.3.1',
      'react-native': '0.76.5',
      'react-native-safe-area-context': '^5.0.0',
    },
  }, null, 2);

  return files;
}

export function generateFullCodeString(project: Project): string {
  const files = generateProjectCode(project);
  return Object.entries(files)
    .map(([path, code]) => `// ═══ FILE: ${path} ═══\n\n${code}`)
    .join('\n\n' + '─'.repeat(60) + '\n\n');
}
