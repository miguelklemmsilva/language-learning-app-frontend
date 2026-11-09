import type { Sentence } from "./api";

export type ExerciseType = "translation" | "listening" | "speaking";

export interface PracticeSentence extends Omit<Sentence, "correct" | "type" | "mistakes"> {
  type: ExerciseType;
  mistakes: number;
  correct?: boolean;
}

export type LessonOutcome = "correct" | "again" | "skip" | "unknown" | "later";

export type PronunciationWord = {
  text: string;
  accuracy: number;
  errorType: string;
};

export type PronunciationResult = {
  accuracy: number;
  fluency: number;
  completeness: number;
  pronScore: number;
  displayText: string;
  words: PronunciationWord[];
};
