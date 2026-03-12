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
  | 'FlatList'
  | 'Tabs'
  | 'Accordion'
  | 'Carousel'
  | 'Chart'
  | 'WebView'
  | 'MapView'
  | 'FormField'
  | 'Badge';

export interface UIComponent {
  id: string;
  type: UIComponentType;
  props: Record<string, any>;
  events?: Record<string, string>; // eventName -> workflowNodeId
}

export interface AppScreen {
  id: string;
  name: string;
  backgroundColor: string;
  components: UIComponent[];
}

export interface ProjectTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: number;
  mode: 'light' | 'dark' | 'auto';
}

export const DEFAULT_THEME: ProjectTheme = {
  primaryColor: '#7C3AED',
  secondaryColor: '#06B6D4',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F4F4F8',
  textColor: '#111128',
  borderRadius: 12,
  mode: 'auto',
};

export interface Endpoint {
  id: string;
  name: string;
  type: 'rest' | 'json';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body: string;
  bindToComponent?: string;
  collectionId?: string;
}

export interface APICollection {
  id: string;
  name: string;
  endpoints: Endpoint[];
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'control' | 'data';
  opcode: string;
  inputs: Record<string, any>;
  nextBlockId?: string; // For backward compatibility with existing engine
  outputs?: string[]; // IDs of next nodes for future edge-based logic
  position: { x: number; y: number };
  metadata?: Record<string, any>;
}

export interface DataVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'list' | 'object';
  scope: 'global' | 'screen';
  screenId?: string;
  defaultValue: any;
}

export interface Project {
  id: string;
  name: string;
  screens: AppScreen[];
  theme?: ProjectTheme;
  endpoints?: Endpoint[];
  workflowNodes?: WorkflowNode[];
  variables?: DataVariable[];
  collections?: APICollection[];
  createdAt: number;
  updatedAt: number;
}

export type PropertyControl =
  | { kind: 'text'; label: string; key: string }
  | { kind: 'number'; label: string; key: string; min?: number; max?: number; step?: number }
  | { kind: 'color'; label: string; key: string }
  | { kind: 'select'; label: string; key: string; options: { label: string; value: string }[] }
  | { kind: 'toggle'; label: string; key: string }
  | { kind: 'screenSelect'; label: string; key: string }
  | { kind: 'section'; label: string };

export interface ComponentDefinition {
  type: UIComponentType;
  label: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialIcons' | 'Feather' | 'MaterialCommunityIcons';
  defaultProps: Record<string, any>;
  propertyControls: PropertyControl[];
  previewColor: string;
}
