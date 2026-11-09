import { cleanAnswer } from "./text";
import { Word } from "../types/api";

export type WordSort = "due" | "box" | "alpha";

export function dueWords(words: Word[]) {
  return words.filter((word) => word.minutesUntilDue <= 0);
}

export function sortWords(words: Word[], mode: WordSort) {
  const copy = [...words];
  if (mode === "alpha") {
    return copy.sort((a, b) => a.word.localeCompare(b.word));
  }
  if (mode === "box") {
    return copy.sort((a, b) => b.boxNumber - a.boxNumber || a.word.localeCompare(b.word));
  }
  return copy.sort((a, b) => a.minutesUntilDue - b.minutesUntilDue || a.word.localeCompare(b.word));
}

export function nextDueMinutes(words: Word[]) {
  const upcoming = words.filter((word) => word.minutesUntilDue > 0);
  if (upcoming.length === 0) return null;
  return Math.min(...upcoming.map((word) => word.minutesUntilDue));
}

export function sameWord(left: string, right: string) {
  const normalizedLeft = cleanAnswer(left.toLocaleLowerCase());
  const normalizedRight = cleanAnswer(right.toLocaleLowerCase());
  return normalizedLeft.length > 0 && normalizedLeft === normalizedRight;
}

export function hasWord(words: Word[], candidate: string) {
  return words.some((word) => sameWord(word.word, candidate));
}
