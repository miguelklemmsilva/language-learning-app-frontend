import { useUserData } from "../api/userService";
import {
  getActiveCountry,
  getSelectedLanguageSettings,
} from "../constants/languages";
import { useLanguageStore } from "../stores/languageStore";

export function useActiveLanguageSelection() {
  const { data } = useUserData();
  const selectedLanguages = useLanguageStore((state) => state.selectedLanguages);
  const initialLanguages = useLanguageStore((state) => state.initialLanguages);
  const activeLanguage = data?.user.activeLanguage ?? null;
  const activeLanguageOption =
    selectedLanguages.find((language) => language.name === activeLanguage) ?? null;

  return {
    activeLanguage,
    selectedLanguages,
    initialLanguages,
    activeLanguageOption,
    settings: getSelectedLanguageSettings(selectedLanguages, activeLanguage),
    country: getActiveCountry(selectedLanguages, activeLanguage),
  };
}
