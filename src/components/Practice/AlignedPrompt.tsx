import { useState } from "react";
import { readError } from "../../api/client";
import { useAddVocabulary, useMarkForPractice, useVocabulary } from "../../api/vocabularyService";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Icon } from "../ui/Icon";
import { alignedPromptParts, encodeWord } from "../../lib/text";
import { hasWord, sameWord } from "../../lib/words";
import { Language } from "../../types/api";

type AlignedPromptProps = {
  translation: string;
  original: string;
  alignment?: string | null;
  language: Language;
  onWordAdded?: (word: string) => void;
  onWordRevision?: (word: string) => void;
};

export function AlignedPrompt({
  translation,
  original,
  alignment,
  language,
  onWordAdded,
  onWordRevision,
}: AlignedPromptProps) {
  const vocabulary = useVocabulary(language);
  const addWords = useAddVocabulary(language, true);
  const markForPractice = useMarkForPractice(language);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [practiced, setPracticed] = useState<string[]>([]);
  const [pending, setPending] = useState<{ hint: string; action: "add" | "practice" } | null>(null);
  const [actionError, setActionError] = useState<{ hint: string; message: string } | null>(null);
  const parts = alignedPromptParts(translation, original, alignment);
  const selected = selectedIndex === null ? null : parts[selectedIndex] ?? null;
  const hintable = parts.some((part) => part.hint);

  function owns(hint: string) {
    return hasWord(vocabulary.data ?? [], hint) || added.some((word) => sameWord(word, hint));
  }

  function storedWord(hint: string) {
    return (
      (vocabulary.data ?? []).find((word) => sameWord(word.word, hint))?.word ??
      added.find((word) => sameWord(word, hint)) ??
      ""
    );
  }

  async function add(hint: string) {
    const encoded = encodeWord(hint);
    if (!encoded || pending) return;
    setPending({ hint, action: "add" });
    setActionError(null);
    try {
      const saved = await addWords.mutateAsync([encoded]);
      if (saved.length === 0) {
        setActionError({ hint, message: `Couldn’t add “${hint}”.` });
        return;
      }
      setAdded((current) => [...current, ...saved]);
      saved.forEach((word) => onWordAdded?.(word));
    } catch (error) {
      setActionError({ hint, message: readError(error) });
    } finally {
      setPending(null);
    }
  }

  async function practice(hint: string) {
    const word = storedWord(hint);
    if (!word || pending) return;
    setPending({ hint, action: "practice" });
    setActionError(null);
    try {
      await markForPractice.mutateAsync(word);
      setPracticed((current) => [...current, word]);
      onWordRevision?.(word);
    } catch (error) {
      setActionError({ hint, message: readError(error) });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="stack">
      {hintable ? <p className="help">Tap a highlight for a hint.</p> : null}
      <div className="prompt">
        {parts.map((part, index) => {
          if (!part.text.trim()) return null;
          if (!part.hint) {
            return (
              <span key={`${part.text}-${index}`} className="prompt-word">
                {part.text}
              </span>
            );
          }
          const open = selectedIndex === index;
          return (
            <button
              key={`${part.text}-${index}`}
              type="button"
              className={open ? "hint-word open" : "hint-word"}
              aria-pressed={open}
              onClick={() => {
                setSelectedIndex((current) => (current === index ? null : index));
                setActionError(null);
              }}
            >
              {part.text}
            </button>
          );
        })}
      </div>
      {selected?.hint ? (
        <HintCard
          source={selected.text}
          hint={selected.hint}
          checking={vocabulary.isLoading}
          unavailable={vocabulary.isError}
          owned={owns(selected.hint)}
          justAdded={added.some((word) => sameWord(word, selected.hint ?? ""))}
          practiced={practiced.some((word) => sameWord(word, selected.hint ?? ""))}
          adding={pending?.hint === selected.hint && pending.action === "add"}
          practicing={pending?.hint === selected.hint && pending.action === "practice"}
          error={actionError?.hint === selected.hint ? actionError.message : null}
          onAdd={() => {
            void add(selected.hint ?? "");
          }}
          onPractice={() => {
            void practice(selected.hint ?? "");
          }}
        />
      ) : null}
    </div>
  );
}

function HintCard({
  source,
  hint,
  checking,
  unavailable,
  owned,
  justAdded,
  practiced,
  adding,
  practicing,
  error,
  onAdd,
  onPractice,
}: {
  source: string;
  hint: string;
  checking: boolean;
  unavailable: boolean;
  owned: boolean;
  justAdded: boolean;
  practiced: boolean;
  adding: boolean;
  practicing: boolean;
  error: string | null;
  onAdd: () => void;
  onPractice: () => void;
}) {
  const busy = adding || practicing;

  return (
    <div className="hint-card">
      <p className="kicker accent">Hint</p>
      <p className="sentence" style={{ fontSize: 22 }}>
        {source}
        <span className="muted"> → </span>
        {hint}
      </p>
      {checking ? <p className="muted">Checking your words…</p> : null}
      {unavailable ? <p className="bad-text">Couldn’t check your words.</p> : null}
      {!checking && !unavailable && owned ? (
        <div className="stack-tight">
          <div className="status-row good-text">
            <Icon name="check" size={18} />
            <span>{justAdded ? "Added to your words" : "Already in your words"}</span>
          </div>
          {practiced ? (
            <div className="status-row">
              <Icon name="refresh" size={18} />
              <strong>Marked for more practice</strong>
            </div>
          ) : (
            <>
              <PrimaryButton label="Practice this more" onClick={onPractice} disabled={busy} loading={practicing} />
              <p className="help">Gives it a low score so you review it sooner.</p>
            </>
          )}
        </div>
      ) : null}
      {!checking && !unavailable && !owned ? (
        <PrimaryButton label="Add to my words" onClick={onAdd} disabled={busy} loading={adding} />
      ) : null}
      {error ? <p className="bad-text">{error}</p> : null}
    </div>
  );
}
