export type UIComponentType =
  | 'View'
  | 'Text'
  | 'Button'
  | 'TextInput'
  | 'Image'
  | 'ScrollView'
  | 'Card'
  | 'Header'
  | 'Footer'
  | 'Spacer'
  | 'Divider'
  | 'FlatList';

export interface UIComponent {
  id: string;
  type: UIComponentType;
  props: Record<string, any>;
}

export interface AppScreen {
  id: string;
  name: string;
  backgroundColor: string;
  components: UIComponent[];
}

export interface Project {
  id: string;
  name: string;
  screens: AppScreen[];
  createdAt: number;
  updatedAt: number;
}

export type PropertyControl =
  | { kind: 'text'; label: string; key: string }
  | { kind: 'number'; label: string; key: string; min?: number; max?: number; step?: number }
  | { kind: 'color'; label: string; key: string }
  | { kind: 'select'; label: string; key: string; options: { label: string; value: string }[] }
  | { kind: 'toggle'; label: string; key: string };

export interface ComponentDefinition {
  type: UIComponentType;
  label: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialIcons' | 'Feather' | 'MaterialCommunityIcons';
  defaultProps: Record<string, any>;
  propertyControls: PropertyControl[];
  previewColor: string;
}
