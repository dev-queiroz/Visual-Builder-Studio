import { create } from 'zustand';
import { Project, AppScreen, UIComponent } from '@/types';
import { getDefaultProps } from '@/utils/componentDefaults';
import { saveProject } from '@/utils/storage';
import * as Crypto from 'expo-crypto';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function createDefaultScreen(name: string): AppScreen {
  return {
    id: genId(),
    name,
    backgroundColor: '#FFFFFF',
    components: [],
  };
}

export interface EditorState {
  project: Project | null;
  activeScreenId: string | null;
  selectedComponentId: string | null;

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
  duplicateComponent: (id: string) => void;

  saveToStorage: () => Promise<void>;

  get activeScreen(): AppScreen | null;
  get selectedComponent(): UIComponent | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  activeScreenId: null,
  selectedComponentId: null,

  get activeScreen() {
    const { project, activeScreenId } = get();
    if (!project || !activeScreenId) return null;
    return project.screens.find((s) => s.id === activeScreenId) ?? null;
  },

  get selectedComponent() {
    const state = get();
    const screen = state.activeScreen;
    if (!screen || !state.selectedComponentId) return null;
    return screen.components.find((c) => c.id === state.selectedComponentId) ?? null;
  },

  setProject: (project) => {
    set({
      project,
      activeScreenId: project.screens[0]?.id ?? null,
      selectedComponentId: null,
    });
  },

  setActiveScreen: (id) => set({ activeScreenId: id, selectedComponentId: null }),
  setSelectedComponent: (id) => set({ selectedComponentId: id }),

  addScreen: () => {
    set((state) => {
      if (!state.project) return state;
      const screens = state.project.screens;
      const newScreen = createDefaultScreen(`Screen ${screens.length + 1}`);
      const updated: Project = {
        ...state.project,
        screens: [...screens, newScreen],
        updatedAt: Date.now(),
      };
      return { project: updated, activeScreenId: newScreen.id, selectedComponentId: null };
    });
    get().saveToStorage();
  },

  renameScreen: (id, name) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((s) => (s.id === id ? { ...s, name } : s)),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  deleteScreen: (id) => {
    set((state) => {
      if (!state.project || state.project.screens.length <= 1) return state;
      const screens = state.project.screens.filter((s) => s.id !== id);
      const newActiveId =
        state.activeScreenId === id ? screens[0]?.id ?? null : state.activeScreenId;
      return {
        project: { ...state.project, screens, updatedAt: Date.now() },
        activeScreenId: newActiveId,
        selectedComponentId: null,
      };
    });
    get().saveToStorage();
  },

  setScreenBackground: (id, color) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((s) =>
            s.id === id ? { ...s, backgroundColor: color } : s
          ),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  addComponent: (type) => {
    set((state) => {
      if (!state.project || !state.activeScreenId) return state;
      const newComp: UIComponent = {
        id: genId(),
        type,
        props: getDefaultProps(type),
      };
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((s) =>
            s.id === state.activeScreenId
              ? { ...s, components: [...s.components, newComp] }
              : s
          ),
          updatedAt: Date.now(),
        },
        selectedComponentId: newComp.id,
      };
    });
    get().saveToStorage();
  },

  removeComponent: (id) => {
    set((state) => {
      if (!state.project || !state.activeScreenId) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((s) =>
            s.id === state.activeScreenId
              ? { ...s, components: s.components.filter((c) => c.id !== id) }
              : s
          ),
          updatedAt: Date.now(),
        },
        selectedComponentId:
          state.selectedComponentId === id ? null : state.selectedComponentId,
      };
    });
    get().saveToStorage();
  },

  moveComponentUp: (id) => {
    set((state) => {
      if (!state.project || !state.activeScreenId) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((s) => {
            if (s.id !== state.activeScreenId) return s;
            const idx = s.components.findIndex((c) => c.id === id);
            if (idx <= 0) return s;
            const comps = [...s.components];
            [comps[idx - 1], comps[idx]] = [comps[idx], comps[idx - 1]];
            return { ...s, components: comps };
          }),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  moveComponentDown: (id) => {
    set((state) => {
      if (!state.project || !state.activeScreenId) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((s) => {
            if (s.id !== state.activeScreenId) return s;
            const idx = s.components.findIndex((c) => c.id === id);
            if (idx < 0 || idx >= s.components.length - 1) return s;
            const comps = [...s.components];
            [comps[idx], comps[idx + 1]] = [comps[idx + 1], comps[idx]];
            return { ...s, components: comps };
          }),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  duplicateComponent: (id) => {
    set((state) => {
      if (!state.project || !state.activeScreenId) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((s) => {
            if (s.id !== state.activeScreenId) return s;
            const idx = s.components.findIndex((c) => c.id === id);
            if (idx < 0) return s;
            const orig = s.components[idx];
            const dupe: UIComponent = { ...orig, id: genId(), props: { ...orig.props } };
            const comps = [...s.components];
            comps.splice(idx + 1, 0, dupe);
            return { ...s, components: comps };
          }),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  updateComponentProp: (id, key, value) => {
    set((state) => {
      if (!state.project || !state.activeScreenId) return state;
      return {
        project: {
          ...state.project,
          screens: state.project.screens.map((s) =>
            s.id === state.activeScreenId
              ? {
                  ...s,
                  components: s.components.map((c) =>
                    c.id === id ? { ...c, props: { ...c.props, [key]: value } } : c
                  ),
                }
              : s
          ),
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  saveToStorage: async () => {
    const { project } = get();
    if (project) {
      await saveProject(project);
    }
  },
}));

export function createNewProject(name: string): Project {
  const id = genId();
  return {
    id,
    name,
    screens: [createDefaultScreen('Home')],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
