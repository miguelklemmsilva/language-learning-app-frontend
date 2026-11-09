import { Language } from "../types/api";

export type CountryInfo = {
  name: string;
  flag: string;
  locale: string;
  voices: string[];
};

export type LanguageInfo = {
  language: Language;
  label: string;
  flag: string;
  countries: CountryInfo[];
};

export const LANGUAGES: LanguageInfo[] = [
  {
    language: Language.Spanish,
    label: "Spanish",
    flag: "🇲🇽",
    countries: [
      { name: "Spain", flag: "🇪🇸", locale: "es-ES", voices: ["es-ES-ElviraNeural", "es-ES-AlvaroNeural", "es-ES-AbrilNeural"] },
      { name: "Mexico", flag: "🇲🇽", locale: "es-MX", voices: ["es-MX-DaliaNeural", "es-MX-JorgeNeural", "es-MX-BeatrizNeural"] },
      { name: "Argentina", flag: "🇦🇷", locale: "es-AR", voices: ["es-AR-ElenaNeural", "es-AR-TomasNeural"] },
    ],
  },
  {
    language: Language.German,
    label: "German",
    flag: "🇩🇪",
    countries: [
      { name: "Germany", flag: "🇩🇪", locale: "de-DE", voices: ["de-DE-KatjaNeural", "de-DE-ConradNeural", "de-DE-AmalaNeural"] },
    ],
  },
  {
    language: Language.Portuguese,
    label: "Portuguese",
    flag: "🇧🇷",
    countries: [
      { name: "Brazil", flag: "🇧🇷", locale: "pt-BR", voices: ["pt-BR-FranciscaNeural", "pt-BR-AntonioNeural", "pt-BR-BrendaNeural"] },
      { name: "Portugal", flag: "🇵🇹", locale: "pt-PT", voices: ["pt-PT-RaquelNeural", "pt-PT-DuarteNeural", "pt-PT-FernandaNeural"] },
    ],
  },
  {
    language: Language.French,
    label: "French",
    flag: "🇫🇷",
    countries: [
      { name: "France", flag: "🇫🇷", locale: "fr-FR", voices: ["fr-FR-DeniseNeural", "fr-FR-HenriNeural", "fr-FR-BrigitteNeural"] },
      { name: "Canada", flag: "🇨🇦", locale: "fr-CA", voices: ["fr-CA-SylvieNeural", "fr-CA-JeanNeural", "fr-CA-AntoineNeural"] },
    ],
  },
  {
    language: Language.Italian,
    label: "Italian",
    flag: "🇮🇹",
    countries: [
      { name: "Italy", flag: "🇮🇹", locale: "it-IT", voices: ["it-IT-ElsaNeural", "it-IT-DiegoNeural", "it-IT-IsabellaNeural"] },
    ],
  },
  {
    language: Language.Japanese,
    label: "Japanese",
    flag: "🇯🇵",
    countries: [
      { name: "Japan", flag: "🇯🇵", locale: "ja-JP", voices: ["ja-JP-NanamiNeural", "ja-JP-KeitaNeural", "ja-JP-AoiNeural"] },
    ],
  },
];

export function languageInfo(language: Language | null | undefined) {
  return LANGUAGES.find((item) => item.language === language);
}

export function countryInfo(language: Language | null | undefined, country: string | null | undefined) {
  const info = languageInfo(language);
  return info?.countries.find((item) => item.name === country) ?? info?.countries[0];
}

export function voiceFor(country: string) {
  for (const language of LANGUAGES) {
    const match = language.countries.find((item) => item.name === country);
    if (!match || match.voices.length === 0) continue;
    const index = Math.floor(Math.random() * match.voices.length);
    return { locale: match.locale, voice: match.voices[index] ?? match.voices[0] };
  }
  return { locale: "en-US", voice: "en-US-JennyNeural" };
}
