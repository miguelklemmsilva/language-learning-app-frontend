import { apiGet, apiPost } from "./client";
import { answersMatch, collapseSpace } from "../lib/text";
import { Language, SentencesResponse, VerifySentenceResponse } from "../types/api";
import { PracticeSentence } from "../types/practice";

const LOWEST_TRANSLATION_SCORE_MISTAKES = 4;
const SCORES_TO_RESET_BOX = 4;

export function fetchSentences() {
  return apiGet<SentencesResponse>("/generatesentences");
}

export async function saveSentenceAudio(
  sentences: { word: string; language: Language; voice: string; contentType?: string | null }[]
) {
  if (sentences.length === 0) return;
  await apiPost<{ message: string }>("/sentenceaudio", {
    sentences: sentences.map((sentence) => {
      const item: { [key: string]: string } = {
        word: sentence.word,
        language: sentence.language,
        voice: sentence.voice,
      };
      if (sentence.contentType) item.contentType = sentence.contentType;
      return item;
    }),
  });
}

export async function verifySentence(
  sentence: PracticeSentence,
  answer: string
): Promise<VerifySentenceResponse> {
  const expected = sentence.original ?? "";
  if (answersMatch(answer, expected)) {
    return { verdict: "correct", isCorrect: true, explanation: null };
  }

  const verified = await apiPost<VerifySentenceResponse>("/verifysentence", {
    original: collapseSpace(sentence.translation ?? ""),
    translation: collapseSpace(answer),
    word: sentence.word,
    language: sentence.language,
  });

  const verdict = verified.verdict ?? (verified.isCorrect ? "correct" : "incorrect");
  return {
    ...verified,
    verdict,
    isCorrect: verdict !== "incorrect",
  };
}

export function finishLesson(sentences: PracticeSentence[]) {
  return apiPost<{ message: string }>("/finishlesson", {
    sentences: sentences.map((sentence) => ({
      language: sentence.language,
      mistakes: sentence.mistakes,
      type: sentence.type,
      word: sentence.word,
    })),
  });
}

export function markWordNeedsPractice(language: Language, word: string) {
  const sentences = Array.from({ length: SCORES_TO_RESET_BOX }, () => ({
    language,
    mistakes: LOWEST_TRANSLATION_SCORE_MISTAKES,
    type: "translation",
    word,
  }));
  return apiPost<{ message: string }>("/finishlesson", { sentences });
}
