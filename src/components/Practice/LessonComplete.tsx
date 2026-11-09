import { PrimaryButton } from "../ui/PrimaryButton";
import { Icon, IconName } from "../ui/Icon";
import { PracticeSentence } from "../../types/practice";

const ICONS: Record<PracticeSentence["type"], IconName> = {
  translation: "language",
  listening: "headset",
  speaking: "mic",
};

type LessonCompleteProps = {
  sentences: PracticeSentence[];
  addedWords: string[];
  revisionWords: string[];
  saving: boolean;
  error: string | null;
  onRetry: () => void;
  onDone: () => void;
};

export function LessonComplete({
  sentences,
  addedWords,
  revisionWords,
  saving,
  error,
  onRetry,
  onDone,
}: LessonCompleteProps) {
  const noMistakes = sentences.filter((sentence) => sentence.mistakes === 0).length;

  return (
    <div className="stack">
      <div className="stack-tight">
        <h1 className="title">Lesson complete</h1>
        <p className="muted">
          {noMistakes} of {sentences.length} with no mistakes.
        </p>
      </div>
      <WordGroup title="Added" words={addedWords} />
      <WordGroup title="Needs revision" words={revisionWords} />
      {error ? (
        <div className="feedback bad">
          <p className="bad-text">{error}</p>
          <PrimaryButton label="Save progress" onClick={onRetry} loading={saving} />
        </div>
      ) : null}
      {sentences.map((sentence, index) => (
        <article key={`${sentence.type}-${sentence.word}-${index}`} className="summary-card">
          <div className="spread">
            <span className="status-row">
              <Icon name={ICONS[sentence.type]} size={18} />
              <strong>{sentence.word}</strong>
            </span>
            <span className={sentence.mistakes === 0 ? "good-text" : "warn-text"}>
              {sentence.mistakes === 0
                ? "No mistakes"
                : `${sentence.mistakes} ${sentence.mistakes === 1 ? "miss" : "misses"}`}
            </span>
          </div>
          <p style={{ margin: 0, fontWeight: 600 }}>{sentence.original}</p>
          {sentence.translation ? <p className="muted">{sentence.translation}</p> : null}
        </article>
      ))}
      <PrimaryButton label={saving ? "Saving…" : "Back home"} onClick={onDone} disabled={saving && !error} />
    </div>
  );
}

function WordGroup({ title, words }: { title: string; words: string[] }) {
  if (words.length === 0) return null;
  return (
    <div className="stack-tight">
      <h2 className="section-title" style={{ fontSize: 18 }}>
        {title}
      </h2>
      <div className="wrap">
        {words.map((word) => (
          <span key={word} className="chip">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
