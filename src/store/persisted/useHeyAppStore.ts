import { AVAILABLE_APPS } from "@/data/contracts";
import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  selectedApp: string;
  setSelectedApp: (app: string) => void;
}

const { useStore: useHeyAppStore } = createPersistedTrackedStore<State>(
  (set, get) => ({
    selectedApp: AVAILABLE_APPS[0],
    setSelectedApp: (selectedApp) => {
      set(() => ({ selectedApp }));
    }
  }),
  {
    name: Localstorage.HeyAppStore,
  }
);

export { useHeyAppStore };

