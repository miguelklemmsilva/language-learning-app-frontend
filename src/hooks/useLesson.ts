import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSentences, finishLesson, saveSentenceAudio } from "../api/practiceService";
import { readError } from "../api/client";
import { canStoreSpeech, forgetSpeech, prepareSpeech } from "../lib/speech";
import { sameWord } from "../lib/words";
import { ExerciseType, LessonOutcome, PracticeSentence } from "../types/practice";
import { Sentence, UserLanguage } from "../types/api";

const ORDER: ExerciseType[] = ["translation", "speaking", "listening"];

function enabledTypes(language: UserLanguage): ExerciseType[] {
  const types: ExerciseType[] = [];
  if (language.translation) types.push("translation");
  if (language.speaking) types.push("speaking");
  if (language.listening) types.push("listening");
  return types;
}

function nextOfType(items: PracticeSentence[], current: number, includeCurrent: boolean) {
  const currentType = items[current]?.type;
  for (let index = current + 1; index < items.length; index += 1) {
    const candidate = items[index];
    if (candidate && !candidate.correct && candidate.type === currentType) return index;
  }
  const stop = includeCurrent ? current + 1 : current;
  for (let index = 0; index < stop; index += 1) {
    const candidate = items[index];
    if (candidate && !candidate.correct && candidate.type === currentType) return index;
  }
  return -1;
}

function nextIndex(items: PracticeSentence[], current: number) {
  const sameType = nextOfType(items, current, true);
  if (sameType !== -1) return sameType;
  for (const type of ORDER) {
    for (let index = 0; index < items.length; index += 1) {
      const candidate = items[index];
      if (candidate && !candidate.correct && candidate.type === type) return index;
    }
  }
  return -1;
}

function toPractice(sentence: Sentence, type: ExerciseType): PracticeSentence {
  return {
    original: sentence.original,
    word: sentence.word,
    translation: sentence.translation,
    language: sentence.language,
    alignment: sentence.alignment,
    country: sentence.country,
    voice: sentence.voice,
    voiceContentType: sentence.voiceContentType,
    type,
    mistakes: 0,
  };
}

function masteredClips(items: PracticeSentence[]) {
  const byWord = new Map<string, PracticeSentence[]>();
  for (const item of items) {
    const group = byWord.get(item.word);
    if (group) group.push(item);
    else byWord.set(item.word, [item]);
  }
  const clips: { original: string; country: string }[] = [];
  for (const group of byWord.values()) {
    if (!group.every((item) => item.mistakes === 0)) continue;
    const sample = group[0];
    if (!sample?.original) continue;
    clips.push({ original: sample.original, country: sample.country || "" });
  }
  return clips;
}

function rememberWord(current: string[], word: string) {
  return current.some((item) => sameWord(item, word)) ? current : [...current, word];
}

export function useLesson(language: UserLanguage | undefined) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error" | "done">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sentences, setSentences] = useState<PracticeSentence[]>([]);
  const [addedWords, setAddedWords] = useState<string[]>([]);
  const [revisionWords, setRevisionWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [token, setToken] = useState("");
  const [speechHost, setSpeechHost] = useState("");
  const languageRef = useRef(language);
  languageRef.current = language;
  const grading = useRef(false);
  const lessonKey = language
    ? `${language.language}:${language.country}:${language.proficiency}:${language.translation}:${language.listening}:${language.speaking}`
    : "";

  useEffect(() => {
    grading.current = false;
  }, [index, status, attempt]);

  useEffect(() => {
    const activeLanguage = languageRef.current;
    if (!activeLanguage) return undefined;
    let cancelled = false;
    const types = enabledTypes(activeLanguage);

    async function load() {
      if (types.length === 0) {
        setStatus("error");
        setErrorMessage("Turn on at least one exercise in Settings.");
        return;
      }

      try {
        const response = await fetchSentences();
        if (cancelled) return;
        const source = response.sentences ?? [];
        if (source.length === 0) {
          setStatus("empty");
          return;
        }

        setToken(response.issueToken);
        setSpeechHost(response.speechHost);
        setAddedWords([]);
        setRevisionWords([]);
        setSentences(source.flatMap((sentence) => types.map((type) => toPractice(sentence, type))));
        setIndex(0);
        setAttempt(0);

        if (types.includes("listening") || types.includes("speaking")) {
          void Promise.all(
            source.map(async (sentence) => {
              const country = sentence.country || "";
              const prepared = await prepareSpeech(
                sentence.original,
                country,
                response.issueToken,
                response.speechHost,
                sentence.voice,
                sentence.voiceContentType
              );
              if (!prepared.fresh || !prepared.voice || !canStoreSpeech(prepared.voice)) return null;
              return {
                word: sentence.word,
                language: sentence.language,
                voice: prepared.voice,
                contentType: prepared.contentType,
              };
            })
          )
            .then((items) => {
              const fresh = items.filter((item) => item !== null);
              if (fresh.length === 0) return;
              void saveSentenceAudio(fresh).catch(() => undefined);
            })
            .catch(() => undefined);
        }

        if (!cancelled) setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        const message = readError(error);
        if (/no words|no active exercises/i.test(message)) {
          setStatus("empty");
          return;
        }
        setStatus("error");
        setErrorMessage(message);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [lessonKey]);

  async function save(items: PracticeSentence[]) {
    setSaving(true);
    setFinishError(null);
    try {
      await finishLesson(items);
      masteredClips(items).forEach((clip) => forgetSpeech(clip.original, clip.country));
      await queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (error) {
      setFinishError(readError(error));
    } finally {
      setSaving(false);
    }
  }

  function noteAddedWord(word: string) {
    setAddedWords((current) => rememberWord(current, word));
  }

  function noteRevisionWord(word: string) {
    setRevisionWords((current) => rememberWord(current, word));
  }

  function grade(outcome: LessonOutcome) {
    if (grading.current || status !== "ready") return;
    if (outcome === "later") {
      const following = nextOfType(sentences, index, false);
      if (following === -1) return;
      grading.current = true;
      setIndex(following);
      return;
    }
    grading.current = true;
    const next = sentences.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (outcome === "correct") return { ...item, correct: true };
      const mistakes = item.mistakes + 1;
      if (outcome === "skip" || outcome === "unknown") return { ...item, correct: true, mistakes };
      return { ...item, mistakes };
    });
    setSentences(next);
    const following = nextIndex(next, index);
    if (following === -1) {
      setStatus("done");
      void save(next);
      return;
    }
    if (following === index) setAttempt((value) => value + 1);
    setIndex(following);
  }

  return {
    status,
    errorMessage,
    finishError,
    saving,
    sentences,
    index,
    attempt,
    current: sentences[index],
    addedWords,
    revisionWords,
    noteAddedWord,
    noteRevisionWord,
    solved: sentences.filter((item) => item.correct).length,
    token,
    speechHost,
    grade,
    retrySave: () => save(sentences),
  };
}
