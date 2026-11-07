import { create } from "zustand";
import { Language } from "../types/api";
import { LanguageOption } from "../types/language";

type LanguageState = {
  selectedLanguages: LanguageOption[];
  initialLanguages: LanguageOption[];
  hydratedForUser: string | null;
  hydrate: (userId: string, languages: LanguageOption[]) => void;
  reset: () => void;
  updateDraft: (language: LanguageOption) => void;
  addLanguage: (language: LanguageOption) => void;
  removeLanguage: (language: Language) => void;
  markSaved: (language: LanguageOption) => void;
};

function cloneLanguage(language: LanguageOption): LanguageOption {
  return {
    ...language,
    settings: {
      index: language.settings.index,
      exercises: { ...language.settings.exercises },
    },
  };
}

export const useLanguageStore = create<LanguageState>()((set, get) => ({
  selectedLanguages: [],
  initialLanguages: [],
  hydratedForUser: null,
  hydrate: (userId, nextLanguages) => {
    if (get().hydratedForUser === userId) return;
    const clones = nextLanguages.map(cloneLanguage);
    set({
      hydratedForUser: userId,
      selectedLanguages: clones,
      initialLanguages: clones.map(cloneLanguage),
    });
  },
  reset: () =>
    set({
      selectedLanguages: [],
      initialLanguages: [],
      hydratedForUser: null,
    }),
  updateDraft: (language) =>
    set((state) => ({
      selectedLanguages: state.selectedLanguages.map((item) =>
        item.name === language.name ? cloneLanguage(language) : item
      ),
    })),
  addLanguage: (language) =>
    set((state) => {
      if (state.selectedLanguages.some((item) => item.name === language.name)) {
        return state;
      }
      const copy = cloneLanguage(language);
      return {
        selectedLanguages: [...state.selectedLanguages, copy],
        initialLanguages: [...state.initialLanguages, cloneLanguage(copy)],
      };
    }),
  removeLanguage: (language) =>
    set((state) => ({
      selectedLanguages: state.selectedLanguages.filter((item) => item.name !== language),
      initialLanguages: state.initialLanguages.filter((item) => item.name !== language),
    })),
  markSaved: (language) =>
    set((state) => ({
      initialLanguages: state.initialLanguages.map((item) =>
        item.name === language.name ? cloneLanguage(language) : item
      ),
    })),
}));
