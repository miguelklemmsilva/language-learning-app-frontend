import { useEffect, useRef, useState } from "react";
import { readError } from "../../api/client";
import { useAppColors } from "../../hooks/useAppColors";
import { AppColors } from "../../constants/Colors";
import { beginPronunciation, completePronunciation, playRecording, playSpeech, stopPlayback } from "../../lib/speech";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Icon } from "../ui/Icon";
import { LessonOutcome, PracticeSentence, PronunciationResult, PronunciationWord } from "../../types/practice";

type SpeakingQuestionProps = {
  sentence: PracticeSentence;
  token: string;
  speechHost: string;
  onGrade: (outcome: LessonOutcome) => void;
};

function wordColor(word: PronunciationWord, colors: AppColors) {
  if (word.errorType === "Omission") return colors.muted;
  if (word.errorType !== "None" || word.accuracy < 60) return colors.danger;
  if (word.accuracy < 80) return colors.warning;
  return colors.success;
}

function scoreColor(value: number, colors: AppColors) {
  if (value >= 80) return colors.success;
  if (value >= 60) return colors.warning;
  return colors.danger;
}

const ratings = [
  {
    key: "pronunciation",
    label: "Pronunciation",
    detail: "Overall score for the pronunciation quality of what you said. It combines accuracy, fluency, and completeness.",
  },
  {
    key: "accuracy",
    label: "Accuracy",
    detail: "How closely the sounds match a native speaker's pronunciation.",
  },
  {
    key: "fluency",
    label: "Fluency",
    detail: "How closely the pauses between words match a native speaker.",
  },
  {
    key: "completeness",
    label: "Completeness",
    detail: "How much of the sentence you pronounced, compared with the full sentence.",
  },
] as const;

function recordingUrlFrom(error: unknown) {
  if (typeof error === "object" && error !== null && "recordingUrl" in error) {
    const url = error.recordingUrl;
    if (typeof url === "string") return url;
  }
  return null;
}

function spokenForm(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[.,!?;:¿¡"'“”«»()[\]{}…\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesSentence(heard: string, target: string) {
  const said = spokenForm(heard);
  const expected = spokenForm(target);
  return expected.length > 0 && said === expected;
}

export function SpeakingQuestion({ sentence, token, speechHost, onGrade }: SpeakingQuestionProps) {
  const { colors } = useAppColors();
  const [playback, setPlayback] = useState<"sentence" | "mine" | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [heard, setHeard] = useState("");
  const [openRating, setOpenRating] = useState<(typeof ratings)[number]["key"] | null>(null);
  const stopping = useRef(false);
  const mounted = useRef(true);
  const passed = (result?.pronScore ?? 0) >= 60;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setTimeout(() => {
      void finishRecording();
    }, 20000);
    return () => window.clearTimeout(timer);
  }, [recording]);

  useEffect(() => {
    if (!recording || !matchesSentence(heard, sentence.original)) return undefined;
    const timer = window.setTimeout(() => {
      void finishRecording();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [recording, heard, sentence.original]);

  async function listen() {
    setPlayback("sentence");
    setError(null);
    try {
      await playSpeech(
        sentence.original,
        sentence.country || "",
        token,
        speechHost,
        sentence.voice,
        sentence.voiceContentType
      );
    } catch (playError) {
      setError(readError(playError));
    } finally {
      setPlayback((current) => (current === "sentence" ? null : current));
    }
  }

  async function replay() {
    if (!recordingUrl) return;
    if (playback === "mine") {
      stopPlayback();
      setPlayback(null);
      return;
    }
    setPlayback("mine");
    setError(null);
    try {
      await playRecording(recordingUrl);
    } catch (playError) {
      setError(readError(playError));
    } finally {
      setPlayback((current) => (current === "mine" ? null : current));
    }
  }

  async function beginRecording() {
    if (preparing || recording || scoring) return;
    setError(null);
    setResult(null);
    setHeard("");
    setOpenRating(null);
    setPreparing(true);
    try {
      stopping.current = false;
      await beginPronunciation(sentence.original, sentence.country || "", token, speechHost, (text) => {
        if (mounted.current) setHeard(text);
      });
      if (!mounted.current) return;
      setRecordingUrl(null);
      setRecording(true);
    } catch (recordError) {
      if (mounted.current) setError(readError(recordError));
    } finally {
      if (mounted.current) setPreparing(false);
    }
  }

  async function finishRecording() {
    if (stopping.current) return;
    stopping.current = true;
    setRecording(false);
    setScoring(true);
    setError(null);
    try {
      const assessment = await completePronunciation();
      setRecordingUrl(assessment.recordingUrl);
      setHeard("");
      setResult(assessment.result);
    } catch (scoreError) {
      const url = recordingUrlFrom(scoreError);
      if (url) setRecordingUrl(url);
      setError(readError(scoreError));
    } finally {
      stopping.current = false;
      setScoring(false);
    }
  }

  const scoreValues = result
    ? {
        pronunciation: result.pronScore,
        accuracy: result.accuracy,
        fluency: result.fluency,
        completeness: result.completeness,
      }
    : null;

  return (
    <div className="stack">
      <div className="stack-tight">
        <p className="kicker accent">Speaking</p>
        <p className="help">
          Listen, then say the sentence aloud. It finishes when the words match. You can also tap the microphone to stop.
        </p>
      </div>
      <p className="sentence">{sentence.original}</p>
      {sentence.translation ? <p className="muted">{sentence.translation}</p> : null}
      <div className="controls">
        <button
          type="button"
          className="round-button"
          onClick={() => void listen()}
          disabled={playback === "sentence" || preparing || recording || scoring}
          aria-label="Play sentence"
        >
          {playback === "sentence" ? <span className="spinner small" /> : <Icon name="volume" size={28} />}
        </button>
        <button
          type="button"
          className={`mic-button ${preparing ? "preparing" : ""} ${recording ? "recording" : ""}`}
          onClick={() => void (recording ? finishRecording() : beginRecording())}
          disabled={preparing || scoring}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {scoring ? (
            <span className="spinner small on-primary" />
          ) : (
            <Icon name={recording ? "stop" : "mic"} size={34} />
          )}
        </button>
      </div>
      {!result && heard ? <p className="heard">{heard}</p> : null}
      <p className="center-note">
        {preparing
          ? "Getting the microphone ready…"
          : recording
            ? "Listening…"
            : scoring
              ? "Scoring your pronunciation…"
              : "Tap the microphone and speak"}
      </p>
      {recordingUrl && !preparing && !recording && !scoring ? (
        <button type="button" className="replay" onClick={() => void replay()}>
          <Icon name={playback === "mine" ? "stop" : "play"} size={18} />
          {playback === "mine" ? "Playing what you said…" : "Play what you said"}
        </button>
      ) : null}
      {error ? <p className="bad-text" style={{ textAlign: "center" }}>{error}</p> : null}
      {result && scoreValues ? (
        <div className="feedback">
          <p className="sentence" style={{ fontSize: 22 }}>
            {result.words.map((word, index) => (
              <span key={`${word.text}-${index}`} style={{ color: wordColor(word, colors) }}>
                {word.text}
                {index < result.words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          <div className="stack">
            {ratings.map((rating) => {
              const value = scoreValues[rating.key];
              const open = openRating === rating.key;
              return (
                <button
                  key={rating.key}
                  type="button"
                  className="rating"
                  aria-expanded={open}
                  onClick={() => setOpenRating((current) => (current === rating.key ? null : rating.key))}
                >
                  <b style={{ color: scoreColor(value, colors) }}>{value}</b>
                  <span className="rating-copy">
                    <span className="rating-title">
                      {rating.label}
                      <Icon name="help" size={18} />
                    </span>
                    {open ? <span className="help">{rating.detail}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {result ? (
        <div className="stack-tight">
          {passed ? (
            <PrimaryButton label="Continue" onClick={() => onGrade("correct")} />
          ) : (
            <>
              <PrimaryButton label="Try again" onClick={() => setResult(null)} />
              <PrimaryButton label="Skip" tone="quiet" onClick={() => onGrade("skip")} />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
