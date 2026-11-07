import { Language } from "./api";

export interface CountryOption {
  name: string;
  flag: string;
}

export interface ExerciseSettings {
  translation: boolean;
  listening: boolean;
  speaking: boolean;
}

export interface LanguageSettings {
  index: number;
  exercises: ExerciseSettings;
}

export interface LanguageOption {
  name: Language;
  countries: CountryOption[];
  settings: LanguageSettings;
}
