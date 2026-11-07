import type { ReactNode } from "react";
import type {
  PronunciationAssessmentResult,
  SpeechRecognitionResult,
} from "microsoft-cognitiveservices-speech-sdk";
import type { Language, Sentence, VerifySentenceResponse } from "./api";

export type ExerciseType = "translation" | "listening" | "speaking";

export interface PracticeSentence
  extends Omit<Sentence, "correct" | "type" | "voice" | "mistakes"> {
  type: ExerciseType;
  mistakes: number;
  correct?: boolean;
  voice?: string | null;
  error?: string;
}

export interface FetchSentencesError {
  code?: number;
  message?: string;
}

export type VerifySentenceResult = VerifySentenceResponse & {
  exact?: boolean;
};

export type QuestionResult =
  | string
  | SpeechRecognitionResult
  | PronunciationAssessmentResult
  | null;

export interface PronunciationWordAssessment {
  Word: string;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType: string;
  };
}

export interface PronunciationJson {
  Words: PronunciationWordAssessment[];
  PronunciationAssessment: {
    PronScore: number;
    AccuracyScore: number;
    FluencyScore: number;
    CompletenessScore: number;
  };
}

export type VocabularyTableRow = {
  word: string;
  language?: Language;
  boxNumber?: number;
  minutesUntilDue?: number;
  lastSeen?: number;
  foundInWordTable?: boolean;
};

export type SpeakingScores = ReactNode;
