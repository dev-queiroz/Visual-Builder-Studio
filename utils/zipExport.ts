import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import { Project } from '@/types';
import { generateProjectCode, generateFullCodeString } from './codeGenerator';

export interface ExportResult {
  success: boolean;
  path?: string;
  fileCount?: number;
  error?: string;
  message: string;
}

export async function exportProjectToFiles(project: Project): Promise<ExportResult> {
  try {
    const files = generateProjectCode(project);
    const safeName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
    const baseDir = `${FileSystem.documentDirectory}AppZap/${safeName}/`;

    await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });

    let written = 0;
    for (const [filePath, content] of Object.entries(files)) {
      const dirs = filePath.split('/');
      if (dirs.length > 1) {
        const subDir = baseDir + dirs.slice(0, -1).join('/') + '/';
        await FileSystem.makeDirectoryAsync(subDir, { intermediates: true });
      }
      await FileSystem.writeAsStringAsync(baseDir + filePath, content);
      written++;
    }

    return {
      success: true,
      path: baseDir,
      fileCount: written,
      message: `${written} files exported to:\n${baseDir}`,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
      message: `Export failed: ${e.message}`,
    };
  }
}

export async function copyAllCodeToClipboard(project: Project): Promise<boolean> {
  try {
    const code = generateFullCodeString(project);
    await Clipboard.setStringAsync(code);
    return true;
  } catch {
    return false;
  }
}

export function generateExpoInstructions(project: Project): string {
  return `# AppZap Generated Project — ${project.name}
# Generated: ${new Date().toLocaleString()}
# Run with Expo Go
# ─────────────────────────────────────────

## Quick Start

1. Create a new Expo project:
   npx create-expo-app ${project.name.replace(/\s+/g, '-').toLowerCase()} --template blank-typescript

2. Copy the generated files into the project

3. Install dependencies:
   npx expo install expo-router react-native-safe-area-context react-native-screens

4. Update package.json main to:
   "main": "expo-router/entry"

5. Start the app:
   npx expo start

6. Scan QR code with Expo Go

## Screens (${project.screens.length})
${project.screens.map((s, i) => `  ${i + 1}. ${s.name} (${s.components.length} components)`).join('\n')}

## EAS Build (Android APK)
   npm install -g eas-cli
   eas build -p android --profile preview
`;
}
