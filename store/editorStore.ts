import { create } from 'zustand';
import { Project, AppScreen, UIComponent, ProjectTheme, DEFAULT_THEME, Endpoint, DataVariable, WorkflowNode, APICollection } from '@/types';
import { getDefaultProps } from '@/utils/componentDefaults';
import { saveProject } from '@/utils/storage';

const MAX_HISTORY = 30;

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function createDefaultScreen(name: string): AppScreen {
  return { id: genId(), name, backgroundColor: '#FFFFFF', components: [] };
}

function snapshotProject(project: Project | null): Project | null {
  if (!project) return null;
  return JSON.parse(JSON.stringify(project));
}

export interface EditorState {
  project: Project | null;
  activeScreenId: string | null;
  selectedComponentId: string | null;
  history: Project[];
  future: Project[];

  setProject: (project: Project) => void;
  setActiveScreen: (id: string) => void;
  setSelectedComponent: (id: string | null) => void;

  addScreen: () => void;
  renameScreen: (id: string, name: string) => void;
  deleteScreen: (id: string) => void;
  setScreenBackground: (id: string, color: string) => void;

  addComponent: (type: UIComponent['type']) => void;
  removeComponent: (id: string) => void;
  moveComponentUp: (id: string) => void;
  moveComponentDown: (id: string) => void;
  updateComponentProp: (id: string, key: string, value: any) => void;
  updateComponentEvent: (id: string, eventName: string, workflowNodeId: string) => void;
  duplicateComponent: (id: string) => void;

  updateTheme: (theme: Partial<ProjectTheme>) => void;
  applyThemeToAll: () => void;

  addEndpoint: (ds: Endpoint) => void;
  updateEndpoint: (id: string, ds: Partial<Endpoint>) => void;
  removeEndpoint: (id: string) => void;

  addVariable: (variable: Omit<DataVariable, 'id'>) => void;
  updateVariable: (id: string, variable: Partial<DataVariable>) => void;
  removeVariable: (id: string) => void;

  addWorkflowNode: (node: Omit<WorkflowNode, 'id'>) => void;
  updateWorkflowNode: (id: string, node: Partial<WorkflowNode>) => void;
  removeWorkflowNode: (id: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Runtime State (for Preview)
  runtimeVariables: Record<string, any>;
  setRuntimeVariable: (name: string, value: any) => void;
  resetRuntimeVariables: () => void;

  saveToStorage: () => Promise<void>;
}

function pushHistoryMutation(
  state: EditorState,
  mutate: (s: EditorState) => Partial<EditorState>
): Partial<EditorState> {
  const snapshot = snapshotProject(state.project);
  const history = snapshot
    ? [...state.history.slice(-(MAX_HISTORY - 1)), snapshot]
    : state.history;
  return { ...mutate(state), history, future: [] };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  activeScreenId: null,
  selectedComponentId: null,
  history: [],
  future: [],

  setProject: (project) => {
    set({ project, activeScreenId: project.screens[0]?.id ?? null, selectedComponentId: null, history: [], future: [] });
  },

  setActiveScreen: (id) => set({ activeScreenId: id, selectedComponentId: null }),
  setSelectedComponent: (id) => set({ selectedComponentId: id }),

  addScreen: () => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project) return s;
        const newScreen = createDefaultScreen(`Screen ${s.project.screens.length + 1}`);
        return {
          project: { ...s.project, screens: [...s.project.screens, newScreen], updatedAt: Date.now() },
          activeScreenId: newScreen.id,
          selectedComponentId: null,
        };
      })
    );
    get().saveToStorage();
  },

  renameScreen: (id, name) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project) return s;
        return {
          project: {
            ...s.project,
            screens: s.project.screens.map((sc) => (sc.id === id ? { ...sc, name } : sc)),
            updatedAt: Date.now(),
          },
        };
      })
    );
    get().saveToStorage();
  },

  deleteScreen: (id) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project || s.project.screens.length <= 1) return s;
        const screens = s.project.screens.filter((sc) => sc.id !== id);
        return {
          project: { ...s.project, screens, updatedAt: Date.now() },
          activeScreenId: s.activeScreenId === id ? screens[0]?.id ?? null : s.activeScreenId,
          selectedComponentId: null,
        };
      })
    );
    get().saveToStorage();
  },

  setScreenBackground: (id, color) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project) return s;
        return {
          project: {
            ...s.project,
            screens: s.project.screens.map((sc) => (sc.id === id ? { ...sc, backgroundColor: color } : sc)),
            updatedAt: Date.now(),
          },
        };
      })
    );
    get().saveToStorage();
  },

  addComponent: (type) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project || !s.activeScreenId) return s;
        const newComp: UIComponent = { id: genId(), type, props: getDefaultProps(type) };
        return {
          project: {
            ...s.project,
            screens: s.project.screens.map((sc) =>
              sc.id === s.activeScreenId
                ? { ...sc, components: [...sc.components, newComp] }
                : sc
            ),
            updatedAt: Date.now(),
          },
          selectedComponentId: newComp.id,
        };
      })
    );
    get().saveToStorage();
  },

  removeComponent: (id) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project || !s.activeScreenId) return s;
        return {
          project: {
            ...s.project,
            screens: s.project.screens.map((sc) =>
              sc.id === s.activeScreenId
                ? { ...sc, components: sc.components.filter((c) => c.id !== id) }
                : sc
            ),
            updatedAt: Date.now(),
          },
          selectedComponentId: s.selectedComponentId === id ? null : s.selectedComponentId,
        };
      })
    );
    get().saveToStorage();
  },

  moveComponentUp: (id) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project || !s.activeScreenId) return s;
        return {
          project: {
            ...s.project,
            screens: s.project.screens.map((sc) => {
              if (sc.id !== s.activeScreenId) return sc;
              const idx = sc.components.findIndex((c) => c.id === id);
              if (idx <= 0) return sc;
              const comps = [...sc.components];
              [comps[idx - 1], comps[idx]] = [comps[idx], comps[idx - 1]];
              return { ...sc, components: comps };
            }),
            updatedAt: Date.now(),
          },
        };
      })
    );
    get().saveToStorage();
  },

  moveComponentDown: (id) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project || !s.activeScreenId) return s;
        return {
          project: {
            ...s.project,
            screens: s.project.screens.map((sc) => {
              if (sc.id !== s.activeScreenId) return sc;
              const idx = sc.components.findIndex((c) => c.id === id);
              if (idx < 0 || idx >= sc.components.length - 1) return sc;
              const comps = [...sc.components];
              [comps[idx], comps[idx + 1]] = [comps[idx + 1], comps[idx]];
              return { ...sc, components: comps };
            }),
            updatedAt: Date.now(),
          },
        };
      })
    );
    get().saveToStorage();
  },

  duplicateComponent: (id) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project || !s.activeScreenId) return s;
        return {
          project: {
            ...s.project,
            screens: s.project.screens.map((sc) => {
              if (sc.id !== s.activeScreenId) return sc;
              const idx = sc.components.findIndex((c) => c.id === id);
              if (idx < 0) return sc;
              const orig = sc.components[idx];
              const dupe: UIComponent = { ...orig, id: genId(), props: { ...orig.props } };
              const comps = [...sc.components];
              comps.splice(idx + 1, 0, dupe);
              return { ...sc, components: comps };
            }),
            updatedAt: Date.now(),
          },
        };
      })
    );
    get().saveToStorage();
  },

  updateComponentProp: (id, key, value) => {
    set((state) => {
      if (!state.project || !state.activeScreenId) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((sc) =>
            sc.id === state.activeScreenId
              ? {
                ...sc,
                components: sc.components.map((c) =>
                  c.id === id ? { ...c, props: { ...c.props, [key]: value } } : c
                ),
              }
              : sc
          ),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  updateComponentEvent: (id: string, eventName: string, workflowNodeId: string) => {
    set((state: EditorState) => {
      if (!state.project || !state.activeScreenId) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((sc: AppScreen) =>
            sc.id === state.activeScreenId
              ? {
                ...sc,
                components: sc.components.map((c: UIComponent) =>
                  c.id === id
                    ? { ...c, events: { ...(c.events || {}), [eventName]: workflowNodeId } }
                    : c
                ),
              }
              : sc
          ),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  updateTheme: (theme) => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project) return s;
        return {
          project: {
            ...s.project,
            theme: { ...(s.project.theme ?? DEFAULT_THEME), ...theme },
            updatedAt: Date.now(),
          },
        };
      })
    );
    get().saveToStorage();
  },

  applyThemeToAll: () => {
    set((state) =>
      pushHistoryMutation(state, (s) => {
        if (!s.project) return s;
        const theme = s.project.theme ?? DEFAULT_THEME;
        const screens = s.project.screens.map((sc) => ({
          ...sc,
          backgroundColor: theme.backgroundColor,
          components: sc.components.map((c) => {
            const props = { ...c.props };
            if (c.type === 'Header' || c.type === 'Button') {
              props.backgroundColor = theme.primaryColor;
            }
            if (c.type === 'Card') {
              props.backgroundColor = theme.surfaceColor;
              props.borderRadius = theme.borderRadius;
            }
            if (c.type === 'Text') {
              props.color = theme.textColor;
            }
            return { ...c, props };
          }),
        }));
        return {
          project: { ...s.project, screens, updatedAt: Date.now() },
        };
      })
    );
    get().saveToStorage();
  },

  addEndpoint: (ds: Omit<Endpoint, 'id'>) => {
    set((state) => {
      if (!state.project) return state;
      const newDs: Endpoint = { ...ds, id: genId() };
      return {
        project: {
          ...state.project,
          endpoints: [...(state.project.endpoints ?? []), newDs],
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  updateEndpoint: (id: string, ds: Partial<Endpoint>) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          endpoints: (state.project.endpoints ?? []).map((d) =>
            d.id === id ? { ...d, ...ds } : d
          ),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  removeEndpoint: (id: string) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          endpoints: (state.project.endpoints ?? []).filter((d) => d.id !== id),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  addVariable: (variable) => {
    set((state) => {
      if (!state.project) return state;
      const newVar: DataVariable = { ...variable, id: genId() };
      return {
        project: {
          ...state.project,
          variables: [...(state.project.variables ?? []), newVar],
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  updateVariable: (id, variable) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          variables: (state.project.variables ?? []).map((v) =>
            v.id === id ? { ...v, ...variable } : v
          ),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  removeVariable: (id) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          variables: (state.project.variables ?? []).filter((v) => v.id !== id),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  addWorkflowNode: (node) => {
    set((state) => {
      if (!state.project) return state;
      const newNode: WorkflowNode = { ...node, id: genId() };
      return {
        project: {
          ...state.project,
          workflowNodes: [...(state.project.workflowNodes ?? []), newNode],
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  updateWorkflowNode: (id, node) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          workflowNodes: (state.project.workflowNodes ?? []).map((b) =>
            b.id === id ? { ...b, ...node } : b
          ),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  removeWorkflowNode: (id) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          workflowNodes: (state.project.workflowNodes ?? []).filter((b) => b.id !== id),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  undo: () => {
    set((state) => {
      const { history, project } = state;
      if (history.length === 0) return state;
      const prev = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      const future = project ? [project, ...state.future.slice(0, MAX_HISTORY - 1)] : state.future;
      return { project: prev, history: newHistory, future };
    });
    get().saveToStorage();
  },

  redo: () => {
    set((state) => {
      const { future, project } = state;
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      const history = project ? [...state.history.slice(-(MAX_HISTORY - 1)), project] : state.history;
      return { project: next, history, future: newFuture };
    });
    get().saveToStorage();
  },

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,

  runtimeVariables: {},
  setRuntimeVariable: (name, value) => {
    set((state) => ({
      runtimeVariables: { ...state.runtimeVariables, [name]: value },
    }));
  },
  resetRuntimeVariables: () => {
    const { project } = get();
    if (!project) return;
    const initial: Record<string, any> = {};
    (project.variables ?? []).forEach((v) => {
      initial[v.name] = v.defaultValue;
    });
    set({ runtimeVariables: initial });
  },

  saveToStorage: async () => {
    const { project } = get();
    if (project) await saveProject(project);
  },
}));

export function createNewProject(name: string): Project {
  return {
    id: genId(),
    name,
    screens: [{ id: genId(), name: 'Home', backgroundColor: '#020617', components: [] }],
    theme: { ...DEFAULT_THEME, mode: 'dark', backgroundColor: '#020617', surfaceColor: 'rgba(15, 23, 42, 0.8)' },
    endpoints: [],
    workflowNodes: [],
    variables: [],
    collections: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
