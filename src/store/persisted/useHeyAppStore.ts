import { HEY_APP } from "@/data/constants";
import { Localstorage } from "@/data/storage";
import { createPersistedTrackedStore } from "@/store/createTrackedStore";

interface State {
  selectedApp: string;
  setSelectedApp: (app: string) => void;
}

const { useStore: useHeyAppStore } = createPersistedTrackedStore<State>(
  (set, get) => ({
    selectedApp: HEY_APP,
    setSelectedApp: (selectedApp) => {
      set(() => ({ selectedApp }));
    }
  }),
  {
    name: Localstorage.HeyAppStore,
  }
);

export { useHeyAppStore };

