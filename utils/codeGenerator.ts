import { Project, AppScreen, UIComponent, ProjectTheme, DEFAULT_THEME } from '@/types';

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

    case 'Button': {
      const hasNav = p.actionType === 'navigate' && p.actionTarget;
      const hasAlert = p.actionType === 'alert' && p.actionTarget;
      const onPress = hasNav
        ? `() => router.push('/${(p.actionTarget ?? '').replace(/\s+/g, '')}')`
        : hasAlert
        ? `() => Alert.alert('', '${p.actionTarget}')`
        : '() => {}';
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
        `${i}  onPress={${onPress}}`,
        `${i}>`,
        `${i}  <Text style={{ color: '${p.textColor ?? '#FFFFFF'}', fontSize: ${p.fontSize ?? 16}, fontWeight: '${p.fontWeight ?? '600'}' }}>`,
        `${i}    ${p.label ?? 'Button'}`,
        `${i}  </Text>`,
        `${i}</TouchableOpacity>`,
      ].join('\n');
    }

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
        `${i}    shadowOffset: { width: 0, height: 2 },`,
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
        p.showBack
          ? `${i}  <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>\n${i}    <Text style={{ color: '${p.textColor ?? '#FFF'}', fontSize: 20 }}>{'‹'}</Text>\n${i}  </TouchableOpacity>`
          : '',
        `${i}  <Text style={{ fontSize: ${p.fontSize ?? 20}, fontWeight: '700', color: '${p.textColor ?? '#FFFFFF'}', flex: 1 }}>`,
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

    case 'Tabs': {
      const tabs: string[] = p.tabs ?? ['Tab 1', 'Tab 2'];
      return [
        `${i}{/* Tabs — install @react-native-community/datetimepicker or implement manually */}`,
        `${i}<View style={{ backgroundColor: '${p.backgroundColor ?? '#FFF'}', borderRadius: ${p.borderRadius ?? 10}, padding: 4 }}>`,
        `${i}  <View style={{ flexDirection: 'row' }}>`,
        ...tabs.map((tab, i2) =>
          [
            `${i}    <TouchableOpacity`,
            `${i}      style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: ${i2 === 0 ? `'${p.activeColor ?? '#7C3AED'}' + '20'` : `'transparent'`} }}`,
            `${i}    >`,
            `${i}      <Text style={{ color: ${i2 === 0 ? `'${p.activeColor ?? '#7C3AED'}'` : `'${p.inactiveColor ?? '#9CA3AF'}'`}, fontWeight: '600' }}>${tab}</Text>`,
            `${i}    </TouchableOpacity>`,
          ].join('\n')
        ),
        `${i}  </View>`,
        `${i}</View>`,
      ].join('\n');
    }

    case 'Accordion':
      return [
        `${i}{/* Accordion */}`,
        `${i}<View style={{ backgroundColor: '${p.backgroundColor ?? '#FFF'}', borderRadius: ${p.borderRadius ?? 12}, overflow: 'hidden' }}>`,
        `${i}  <TouchableOpacity`,
        `${i}    style={{ backgroundColor: '${p.headerColor ?? '#F4F4F8'}', flexDirection: 'row', alignItems: 'center', padding: 14 }}`,
        `${i}    onPress={() => {/* toggle expanded state */}}`,
        `${i}  >`,
        `${i}    <Text style={{ flex: 1, fontWeight: '700', color: '${p.titleColor ?? '#111128'}' }}>${p.title ?? 'Section'}</Text>`,
        `${i}    <Text style={{ color: '${p.titleColor ?? '#111128'}' }}>▼</Text>`,
        `${i}  </TouchableOpacity>`,
        `${i}  <View style={{ padding: 14 }}>`,
        `${i}    <Text style={{ color: '${p.contentColor ?? '#5B5B7A'}' }}>${p.content ?? 'Content'}</Text>`,
        `${i}  </View>`,
        `${i}</View>`,
      ].join('\n');

    case 'Carousel':
      return [
        `${i}{/* Carousel — install react-native-reanimated-carousel for full functionality */}`,
        `${i}<ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled`,
        `${i}  style={{ height: ${p.height ?? 180} }}`,
        `${i}>`,
        ...Array.from({ length: p.imageCount ?? 3 }).map((_, idx) =>
          `${i}  <View style={{ width: 300, height: ${p.height ?? 180}, borderRadius: ${p.borderRadius ?? 14}, backgroundColor: '#E2E2EC', marginRight: 12, alignItems: 'center', justifyContent: 'center' }}>\n${i}    <Text>Slide ${idx + 1}</Text>\n${i}  </View>`
        ),
        `${i}</ScrollView>`,
      ].join('\n');

    case 'Chart': {
      const vals: number[] = p.values ?? [65, 80, 45, 90];
      const labs: string[] = p.labels ?? ['A', 'B', 'C', 'D'];
      const mx = Math.max(...vals);
      return [
        `${i}{/* Bar Chart */}`,
        `${i}<View style={{ backgroundColor: '${p.backgroundColor ?? '#FFF'}', borderRadius: ${p.borderRadius ?? 14}, padding: 14 }}>`,
        p.title ? `${i}  <Text style={{ fontWeight: '700', color: '${p.textColor ?? '#111128'}', marginBottom: 8 }}>${p.title}</Text>` : '',
        `${i}  <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 }}>`,
        ...vals.map((v, idx) => [
          `${i}    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>`,
          `${i}      <View style={{ width: '100%', height: ${Math.round((v / mx) * 90)}, backgroundColor: '${p.barColor ?? '#7C3AED'}', borderRadius: 4 }} />`,
          `${i}      <Text style={{ fontSize: 10, color: '${p.textColor ?? '#111128'}' }}>${labs[idx] ?? ''}</Text>`,
          `${i}    </View>`,
        ].join('\n')),
        `${i}  </View>`,
        `${i}</View>`,
      ].filter(Boolean).join('\n');
    }

    case 'WebView':
      return [
        `${i}{/* WebView — requires expo-web-browser or react-native-webview */}`,
        `${i}<View style={{ height: ${p.height ?? 200}, borderRadius: ${p.borderRadius ?? 12}, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E2EC' }}>`,
        `${i}  <WebViewComponent source={{ uri: '${p.url ?? 'https://example.com'}' }} style={{ flex: 1 }} />`,
        `${i}</View>`,
      ].join('\n');

    case 'MapView':
      return [
        `${i}{/* MapView — requires expo install react-native-maps */}`,
        `${i}<MapViewComponent`,
        `${i}  style={{ width: '100%', height: ${p.height ?? 200}, borderRadius: ${p.borderRadius ?? 14} }}`,
        `${i}  initialRegion={{`,
        `${i}    latitude: ${p.latitude ?? -23.5505},`,
        `${i}    longitude: ${p.longitude ?? -46.6333},`,
        `${i}    latitudeDelta: 0.01,`,
        `${i}    longitudeDelta: 0.01,`,
        `${i}  }}`,
        `${i}/>`,
      ].join('\n');

    case 'FormField':
      return [
        `${i}<View style={{ gap: 6 }}>`,
        `${i}  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>`,
        `${i}    <Text style={{ fontSize: 13, fontWeight: '600', color: '${p.labelColor ?? '#5B5B7A'}' }}>${p.label ?? 'Label'}</Text>`,
        p.required ? `${i}    <Text style={{ color: '#EF4444' }}>*</Text>` : '',
        `${i}  </View>`,
        `${i}  <TextInput`,
        `${i}    placeholder="${p.placeholder ?? 'Enter value...'}"`,
        `${i}    style={{`,
        `${i}      backgroundColor: '${p.inputBg ?? '#F4F4F8'}',`,
        `${i}      borderRadius: ${p.borderRadius ?? 10},`,
        `${i}      paddingHorizontal: 14,`,
        `${i}      paddingVertical: 12,`,
        `${i}      fontSize: ${p.fontSize ?? 15},`,
        `${i}      borderWidth: 1,`,
        `${i}      borderColor: '#E2E2EC',`,
        `${i}    }}`,
        `${i}  />`,
        `${i}</View>`,
      ].filter(Boolean).join('\n');

    case 'Badge':
      return [
        `${i}<View style={{ alignSelf: '${p.alignSelf ?? 'flex-start'}' }}>`,
        `${i}  <View style={{`,
        `${i}    backgroundColor: '${p.backgroundColor ?? '#EF4444'}',`,
        `${i}    borderRadius: ${p.borderRadius ?? 20},`,
        `${i}    paddingHorizontal: ${p.paddingHorizontal ?? 12},`,
        `${i}    paddingVertical: ${p.paddingVertical ?? 5},`,
        `${i}  }}>`,
        `${i}    <Text style={{ color: '${p.textColor ?? '#FFF'}', fontSize: ${p.fontSize ?? 12}, fontWeight: '700' }}>${p.text ?? 'Badge'}</Text>`,
        `${i}  </View>`,
        `${i}</View>`,
      ].join('\n');

    default:
      return `${i}{/* Unknown component: ${comp.type} */}`;
  }
}

function getRequiredImports(screen: AppScreen): string[] {
  const imports = new Set<string>(['View', 'Text', 'StyleSheet', 'TouchableOpacity', 'ScrollView']);
  for (const c of screen.components) {
    if (c.type === 'FlatList') imports.add('FlatList');
    if (c.type === 'TextInput' || c.type === 'FormField') imports.add('TextInput');
    if (c.type === 'Image') imports.add('Image');
    if (c.type === 'Button' && c.props.actionType === 'alert') imports.add('Alert');
  }
  return [...imports];
}

function needsRouter(screen: AppScreen): boolean {
  return screen.components.some(
    (c) =>
      (c.type === 'Button' && c.props.actionType === 'navigate') ||
      (c.type === 'Header' && c.props.showBack)
  );
}

function generateScreen(screen: AppScreen): string {
  const rnImports = getRequiredImports(screen);
  const usesRouter = needsRouter(screen);
  const usesWebView = screen.components.some((c) => c.type === 'WebView');
  const usesMap = screen.components.some((c) => c.type === 'MapView');

  const componentsCode = screen.components.map((c) => generateComponent(c, 3)).join('\n\n');

  const lines = [
    `// AppZap Generated Code — ${screen.name}`,
    `import React from 'react';`,
    `import { ${rnImports.join(', ')} } from 'react-native';`,
    `import { SafeAreaView } from 'react-native-safe-area-context';`,
  ];
  if (usesRouter) lines.push(`import { useRouter } from 'expo-router';`);
  if (usesWebView) lines.push(`import { WebView as WebViewComponent } from 'react-native-webview';`);
  if (usesMap) lines.push(`import MapViewComponent from 'react-native-maps';`);

  lines.push(
    ``,
    `export default function ${screen.name.replace(/[^a-zA-Z0-9]/g, '')}Screen() {`,
    usesRouter ? `  const router = useRouter();` : '',
    `  return (`,
    `    <SafeAreaView style={{ flex: 1, backgroundColor: '${screen.backgroundColor ?? '#FFFFFF'}' }}>`,
    `      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>`,
    componentsCode,
    `      </ScrollView>`,
    `    </SafeAreaView>`,
    `  );`,
    `}`,
  );

  return lines.filter((l) => l !== '').join('\n') + '\n';
}

export function generateProjectCode(project: Project): Record<string, string> {
  const files: Record<string, string> = {};
  const theme = project.theme ?? DEFAULT_THEME;

  project.screens.forEach((screen) => {
    const name = screen.name.replace(/[^a-zA-Z0-9]/g, '');
    files[`app/${name}.tsx`] = generateScreen(screen);
  });

  const routeLines = project.screens.map((s) => {
    const name = s.name.replace(/[^a-zA-Z0-9]/g, '');
    return `  <Stack.Screen name="${name}" options={{ title: '${s.name}', headerStyle: { backgroundColor: '${theme.primaryColor}' }, headerTintColor: '#FFF' }} />`;
  });

  files['app/_layout.tsx'] = [
    `// AppZap Generated Code — Root Layout`,
    `import { Stack } from 'expo-router';`,
    ``,
    `export default function RootLayout() {`,
    `  return (`,
    `    <Stack>`,
    routeLines.join('\n'),
    `    </Stack>`,
    `  );`,
    `}`,
    ``,
  ].join('\n');

  files['constants/theme.ts'] = [
    `// AppZap Generated Theme`,
    `export const Theme = {`,
    `  primaryColor: '${theme.primaryColor}',`,
    `  secondaryColor: '${theme.secondaryColor}',`,
    `  backgroundColor: '${theme.backgroundColor}',`,
    `  surfaceColor: '${theme.surfaceColor}',`,
    `  textColor: '${theme.textColor}',`,
    `  borderRadius: ${theme.borderRadius},`,
    `};`,
    ``,
  ].join('\n');

  const hasMaps = project.screens.some((s) => s.components.some((c) => c.type === 'MapView'));
  const hasWebView = project.screens.some((s) => s.components.some((c) => c.type === 'WebView'));

  files['package.json'] = JSON.stringify(
    {
      name: project.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: '1.0.0',
      main: 'expo-router/entry',
      scripts: { start: 'expo start', android: 'expo run:android', ios: 'expo run:ios' },
      dependencies: {
        expo: '~54.0.0',
        'expo-router': '~6.0.0',
        react: '18.3.1',
        'react-native': '0.76.5',
        'react-native-safe-area-context': '^5.0.0',
        'react-native-screens': '^4.0.0',
        ...(hasWebView ? { 'react-native-webview': '^13.0.0' } : {}),
        ...(hasMaps ? { 'react-native-maps': '1.18.0' } : {}),
      },
    },
    null,
    2
  );

  files['app.json'] = JSON.stringify(
    {
      expo: {
        name: project.name,
        slug: project.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        version: '1.0.0',
        scheme: 'myapp',
        platforms: ['ios', 'android', 'web'],
        android: { package: `com.appzap.${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` },
        ios: { bundleIdentifier: `com.appzap.${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` },
        extra: { eas: { projectId: 'your-eas-project-id' } },
      },
    },
    null,
    2
  );

  files['README.md'] = [
    `# ${project.name}`,
    ``,
    `> Generated by **AppZap** — No-Code Mobile App Builder`,
    ``,
    `## Quick Start`,
    ``,
    `\`\`\`bash`,
    `npm install`,
    `npx expo start`,
    `\`\`\``,
    ``,
    `## Screens`,
    project.screens.map((s, i) => `${i + 1}. **${s.name}** — ${s.components.length} components`).join('\n'),
    ``,
    `## Build for Android (EAS)`,
    ``,
    `\`\`\`bash`,
    `npm install -g eas-cli`,
    `eas login`,
    `eas build -p android --profile preview`,
    `\`\`\``,
  ].join('\n');

  return files;
}

export function generateFullCodeString(project: Project): string {
  const files = generateProjectCode(project);
  return Object.entries(files)
    .map(([path, code]) => `// ═══ FILE: ${path} ═══\n\n${code}`)
    .join('\n\n' + '─'.repeat(60) + '\n\n');
}
