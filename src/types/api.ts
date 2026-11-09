/**
 * Shapes returned by LanguageLearningAppService.
 * The Lambda serializer uses JsonSerializerDefaults.Web (camelCase).
 * Language and Proficiency use JsonStringEnumConverter, so they arrive as member names.
 */

export enum Language {
  Spanish = "Spanish",
  German = "German",
  Portuguese = "Portuguese",
  French = "French",
  Italian = "Italian",
  Japanese = "Japanese",
}

export enum Proficiency {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}

export interface User {
  userId: string;
  email?: string | null;
  activeLanguage?: Language | null;
}

export interface UserLanguage {
  userId: string;
  language: Language;
  proficiency: Proficiency;
  country: string;
  translation: boolean;
  listening: boolean;
  speaking: boolean;
}

export interface Vocabulary {
  userId: string;
  languageWord?: string;
  language: Language;
  word: string;
  lastPracticed: number;
  category?: string | null;
  boxNumber: number;
}

export interface Word extends Vocabulary {
  lastSeen: number;
  minutesUntilDue: number;
}

export interface UserResponse {
  user: User;
  userLanguages?: UserLanguage[] | null;
  vocabulary?: Array<Word | null> | null;
}

export interface AllowedVocabulary {
  word: string;
  language: Language;
  category: string;
}

export interface Category {
  name: string;
  words: AllowedVocabulary[];
}

export interface Sentence {
  original: string;
  word: string;
  correct?: string | null;
  mistakes: number;
  translation?: string | null;
  voice?: string | null;
  voiceContentType?: string | null;
  language: Language;
  alignment?: string | null;
  country?: string | null;
  type?: string | null;
}

export interface SentencesResponse {
  sentences: Sentence[];
  issueToken: string;
  speechHost: string;
}

export interface VerifySentenceRequest {
  original: string;
  translation: string;
  word: string;
  language: Language;
}

export type TranslationVerdict = "correct" | "incorrect" | "technicallyCorrect";

export interface VerifySentenceResponse {
  verdict?: TranslationVerdict;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface UpdateUserRequest {
  activeLanguage: Language;
}

export interface UserLanguageRequest {
  language: Language;
  proficiency: Proficiency;
  country: string;
  translation: boolean;
  listening: boolean;
  speaking: boolean;
}

export interface AddVocabularyRequest {
  language: Language;
  vocabulary: string[];
}

export interface FinishLessonSentence {
  language: Language;
  mistakes: number;
  type: string;
  word: string;
}

export interface FinishLessonRequest {
  sentences: FinishLessonSentence[];
}

export interface RemoveUserLanguageResponse {
  activeLanguage?: Language | null;
}

export interface MessageResponse {
  message: string;
}
