import { useState } from "react";
import { readError } from "../../api/client";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Icon } from "../ui/Icon";
import { answersMatch } from "../../lib/text";
import { playSpeech } from "../../lib/speech";
import { AnswerField } from "./AnswerField";
import { LessonOutcome, PracticeSentence } from "../../types/practice";

type ListeningQuestionProps = {
  sentence: PracticeSentence;
  token: string;
  speechHost: string;
  onGrade: (outcome: LessonOutcome) => void;
};

export function ListeningQuestion({ sentence, token, speechHost, onGrade }: ListeningQuestionProps) {
  const [answer, setAnswer] = useState("");
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  async function listen() {
    setPlaying(true);
    setAudioError(null);
    try {
      await playSpeech(
        sentence.original,
        sentence.country || "",
        token,
        speechHost,
        sentence.voice,
        sentence.voiceContentType
      );
    } catch (error) {
      setAudioError(readError(error));
    } finally {
      setPlaying(false);
    }
  }

  function submit() {
    if (!answer.trim() || correct !== null) return;
    setCorrect(answersMatch(answer, sentence.original));
  }

  return (
    <div className="stack">
      <div className="stack-tight">
        <p className="kicker accent">Listening</p>
        <p className="help">Play the sentence, then type what you hear.</p>
      </div>
      <button type="button" className="speaker-button" onClick={() => void listen()} disabled={playing} aria-label="Play sentence">
        {playing ? <span className="spinner small on-primary" /> : <Icon name="volume" size={32} />}
      </button>
      {audioError ? <p className="bad-text" style={{ textAlign: "center" }}>{audioError}</p> : null}
      <AnswerField
        value={answer}
        onChange={setAnswer}
        language={sentence.language}
        disabled={correct !== null}
        placeholder="Type what you hear"
        onSubmit={submit}
      />
      {correct !== null ? (
        <div className={`feedback ${correct ? "good" : "bad"}`}>
          <h2 className={correct ? "good-text" : "bad-text"}>{correct ? "Correct" : "Not quite"}</h2>
          <p className="sentence" style={{ fontSize: 20 }}>{sentence.original}</p>
          {sentence.translation ? <p className="muted">{sentence.translation}</p> : null}
        </div>
      ) : null}
      {correct === null ? (
        <PrimaryButton label="Check" onClick={submit} disabled={!answer.trim()} />
      ) : (
        <div className="stack-tight">
          <PrimaryButton
            label={correct ? "Continue" : "Try again later"}
            onClick={() => onGrade(correct ? "correct" : "again")}
          />
          {correct ? null : <PrimaryButton label="Skip" tone="quiet" onClick={() => onGrade("skip")} />}
        </div>
      )}
    </div>
  );
}
