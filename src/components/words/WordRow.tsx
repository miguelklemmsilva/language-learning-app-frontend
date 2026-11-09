import { Icon } from "../ui/Icon";
import { formatMinutes } from "../../lib/text";
import { Word } from "../../types/api";

type WordRowProps = {
  word: Word;
  onDelete?: (word: Word) => void;
};

export function WordRow({ word, onDelete }: WordRowProps) {
  const due = word.minutesUntilDue <= 0;
  const box = word.boxNumber > 0 ? `Box ${word.boxNumber}` : "New";

  return (
    <div className="word-row">
      <div className="word-copy">
        <strong>{word.word}</strong>
        <span>
          {box}
          {word.category ? ` · ${word.category}` : ""}
          {" · "}
          {formatMinutes(word.minutesUntilDue)}
        </span>
      </div>
      {due ? <span className="pill">Due</span> : null}
      {onDelete ? (
        <button type="button" className="icon-button bad-text" aria-label={`Remove ${word.word}`} onClick={() => onDelete(word)}>
          <Icon name="trash" size={20} />
        </button>
      ) : null}
    </div>
  );
}
