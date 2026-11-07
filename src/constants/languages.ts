import { Language, UserLanguage } from "../types/api";
import {
  CountryOption,
  LanguageOption,
  LanguageSettings,
} from "../types/language";

export function createDefaultSettings(): LanguageSettings {
  return {
    index: 0,
    exercises: {
      translation: true,
      listening: true,
      speaking: true,
    },
  };
}

export const defaultSettings = createDefaultSettings();

export const languages: LanguageOption[] = [
  {
    name: Language.Spanish,
    countries: [
      { name: "Spain", flag: "Flags/Spanish/es.png" },
      { name: "Mexico", flag: "Flags/Spanish/mx.png" },
      { name: "Argentina", flag: "Flags/Spanish/ar.png" },
    ],
    settings: createDefaultSettings(),
  },
  {
    name: Language.Portuguese,
    countries: [
      { name: "Brazil", flag: "Flags/Portuguese/br.png" },
      { name: "Portugal", flag: "Flags/Portuguese/pt.png" },
    ],
    settings: createDefaultSettings(),
  },
  {
    name: Language.Japanese,
    countries: [{ name: "Japan", flag: "Flags/Japanese/jp.png" }],
    settings: createDefaultSettings(),
  },
  {
    name: Language.German,
    countries: [{ name: "Germany", flag: "Flags/German/de.png" }],
    settings: createDefaultSettings(),
  },
  {
    name: Language.Italian,
    countries: [{ name: "Italy", flag: "Flags/Italian/it.png" }],
    settings: createDefaultSettings(),
  },
  {
    name: Language.French,
    countries: [
      { name: "France", flag: "Flags/French/fr.png" },
      { name: "Canada", flag: "Flags/French/ca.png" },
    ],
    settings: createDefaultSettings(),
  },
];

if (typeof window !== "undefined") {
  languages.forEach((language) => {
    language.countries.forEach((country) => {
      const img = new Image();
      img.src = country.flag;
    });
  });
}

export function toLanguageOptions(
  userLanguages: UserLanguage[] | null | undefined
): LanguageOption[] {
  const transformed: LanguageOption[] = [];

  for (const entry of userLanguages ?? []) {
    const match = languages.find((language) => language.name === entry.language);
    if (!match) continue;

    transformed.push({
      ...match,
      settings: {
        index: match.countries.findIndex((country) => country.name === entry.country),
        exercises: {
          translation: entry.translation,
          listening: entry.listening,
          speaking: entry.speaking,
        },
      },
    });
  }

  return transformed;
}

export function getSelectedLanguageSettings(
  selectedLanguages: LanguageOption[],
  activeLanguage: Language | null | undefined
): LanguageSettings | null {
  if (!activeLanguage) return null;

  const activeLanguageOption = selectedLanguages.find(
    (language) => language.name === activeLanguage
  );

  return activeLanguageOption?.settings ?? null;
}

export function getActiveCountry(
  selectedLanguages: LanguageOption[],
  activeLanguage: Language | null | undefined
): CountryOption | null {
  if (!activeLanguage) return null;

  const activeLanguageOption = selectedLanguages.find(
    (language) => language.name === activeLanguage
  );

  if (!activeLanguageOption) return null;

  return activeLanguageOption.countries[activeLanguageOption.settings.index] ?? null;
}
