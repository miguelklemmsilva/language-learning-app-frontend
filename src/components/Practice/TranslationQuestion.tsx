import { useState } from "react";
import { readError } from "../../api/client";
import { verifySentence } from "../../api/practiceService";
import { PrimaryButton } from "../ui/PrimaryButton";
import { AlignedPrompt } from "./AlignedPrompt";
import { LessonOutcome, PracticeSentence, VerifySentenceResponse } from "../../types/practice";

type TranslationQuestionProps = {
  sentence: PracticeSentence;
  onGrade: (outcome: LessonOutcome) => void;
  onWordAdded?: (word: string) => void;
  onWordRevision?: (word: string) => void;
  canComeBackLater?: boolean;
};

export function TranslationQuestion({
  sentence,
  onGrade,
  onWordAdded,
  onWordRevision,
  canComeBackLater = false,
}: TranslationQuestionProps) {
  const [answer, setAnswer] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<VerifySentenceResponse | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prompt = sentence.translation?.trim();

  async function submit() {
    if (!answer.trim() || checking) return;
    setChecking(true);
    setError(null);
    try {
      setResult(await verifySentence(sentence, answer));
    } catch (submitError) {
      setError(readError(submitError));
    } finally {
      setChecking(false);
    }
  }

  function giveUp() {
    if (checking || result) return;
    setGaveUp(true);
    setResult({ verdict: "incorrect", isCorrect: false, explanation: null });
  }

  const verdict = result?.verdict ?? (result?.isCorrect ? "correct" : "incorrect");
  const tone = verdict === "incorrect" ? "bad" : verdict === "technicallyCorrect" ? "warn" : "good";
  const title = gaveUp
    ? "I don’t know"
    : verdict === "technicallyCorrect"
      ? "Technically correct"
      : verdict === "correct"
        ? "Correct"
        : "Not quite";

  return (
    <div className="stack">
      <div className="stack-tight">
        <p className="kicker accent">Translation</p>
        <p className="help">Translate into {sentence.language}.</p>
      </div>
      {prompt ? (
        <AlignedPrompt
          translation={prompt}
          original={sentence.original}
          alignment={sentence.alignment}
          language={sentence.language}
          onWordAdded={onWordAdded}
          onWordRevision={onWordRevision}
        />
      ) : (
        <p className="sentence">{sentence.original}</p>
      )}
      <textarea
        className="answer"
        value={answer}
        disabled={Boolean(result)}
        placeholder={`Write it in ${sentence.language}`}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => setAnswer(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void submit();
          }
        }}
      />
      {error ? <p className="bad-text">{error}</p> : null}
      {result ? (
        <div className={`feedback ${tone}`}>
          <h2 className={tone === "bad" ? "bad-text" : tone === "warn" ? "warn-text" : "good-text"}>{title}</h2>
          <p className="sentence" style={{ fontSize: 20 }}>
            {sentence.original}
          </p>
          {result.explanation ? <p>{result.explanation}</p> : null}
        </div>
      ) : null}
      {gaveUp ? (
        <PrimaryButton label="Continue" onClick={() => onGrade("unknown")} />
      ) : result ? (
        <div className="stack-tight">
          {verdict === "incorrect" ? (
            <PrimaryButton label="Try again later" onClick={() => onGrade("again")} />
          ) : (
            <PrimaryButton label="Continue" onClick={() => onGrade("correct")} />
          )}
          {verdict === "incorrect" ? (
            <PrimaryButton label="Skip" tone="quiet" onClick={() => onGrade("skip")} />
          ) : null}
          {verdict === "technicallyCorrect" ? (
            <PrimaryButton label="Count as incorrect" tone="quiet" onClick={() => onGrade("again")} />
          ) : null}
        </div>
      ) : (
        <div className="stack-tight">
          <PrimaryButton label="Check" onClick={() => void submit()} disabled={!answer.trim()} loading={checking} />
          <PrimaryButton label="I don’t know" tone="quiet" onClick={giveUp} disabled={checking} />
          {canComeBackLater ? (
            <PrimaryButton label="Come back later" tone="quiet" onClick={() => onGrade("later")} disabled={checking} />
          ) : null}
        </div>
      )}
    </div>
  );
}
