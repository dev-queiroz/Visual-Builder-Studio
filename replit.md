# AppZap — Visual Mobile App Builder

A professional React Native / Expo app that lets users build mobile apps visually through a drag-and-drop no-code/low-code interface.

## Stack
- Expo SDK (latest) with Expo Router (file-based routing)
- TypeScript throughout
- Zustand for global editor state
- AsyncStorage for project persistence
- expo-file-system + expo-clipboard for code export
- react-native-gesture-handler + reanimated (pre-installed)
- expo-linear-gradient, expo-haptics for polish
- No backend required — fully local

## App Structure
```
app/
  index.tsx              # Dashboard — list/create/manage projects
  editor/
    [projectId].tsx      # Visual editor for a project
  _layout.tsx            # Root Stack layout (no tabs)

components/
  editor/
    ComponentPalette.tsx  # Bottom palette — tap to add components
    CanvasItem.tsx        # Individual component in the canvas
    PropertiesPanel.tsx   # Dynamic property editor bottom sheet
    ScreenTabs.tsx        # Screen tabs at top of editor
    PreviewModal.tsx      # Live device-frame preview modal
    CodeModal.tsx         # Code generation + copy modal
  dashboard/
    ProjectCard.tsx       # Project list card

store/
  editorStore.ts         # Zustand store — all editor state

types/
  index.ts               # Project, Screen, UIComponent, PropertyControl types

utils/
  componentDefaults.ts   # 12 component definitions with defaults + property controls
  codeGenerator.ts       # Generate React Native code from project JSON
  storage.ts             # AsyncStorage CRUD for projects

constants/
  colors.ts              # Dark/Light theme using AppColors
```

## Data Model
```typescript
Project { id, name, screens[], createdAt, updatedAt }
AppScreen { id, name, backgroundColor, components[] }
UIComponent { id, type, props: Record<string, any> }
```

## Supported Components (12 total)
View, Text, Button, TextInput, Image, Card, Header, Footer, ScrollView, Spacer, Divider, FlatList

## Editor Layout (Mobile-optimized)
1. Top bar: Back, project name, Preview + Code buttons
2. Screen tabs (horizontal scroll, long-press to rename/delete)
3. Canvas: scrollable list of components with selection, reorder (up/down), duplicate, delete
4. Bottom: Component palette (tap to add) or Properties panel (when component selected)

## Key Features
- Create/duplicate/delete projects, persisted to AsyncStorage
- Multi-screen projects (add/rename/delete screens)
- 12 UI components with per-component property editors
- Property controls: text, number slider, color picker (preset + hex), select buttons, toggle
- Live preview in device frame mockup
- Code generation: produces clean Expo TypeScript code per screen
- Copy generated code to clipboard

## Workflows
- Start Backend: `npm run server:dev` on port 5000
- Start Frontend: `npm run expo:dev` on port 8081
