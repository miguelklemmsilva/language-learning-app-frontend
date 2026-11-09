import { useEffect, useMemo, useRef, useState } from "react";
import { useUserData } from "../../api/userService";
import { useAddVocabulary, useCategories, useRemoveVocabulary, useVocabulary } from "../../api/vocabularyService";
import { readError } from "../../api/client";
import { LoadingScreen } from "../../routes/LoadingScreen";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Modal } from "../ui/Modal";
import { Icon } from "../ui/Icon";
import { WordRow } from "./WordRow";
import { languageInfo } from "../../constants/languages";
import { cleanAnswer, encodeWord } from "../../lib/text";
import { dueWords, hasWord, sameWord, sortWords, WordSort } from "../../lib/words";
import { Word } from "../../types/api";

const SORTS: { id: WordSort; label: string }[] = [
  { id: "due", label: "Due" },
  { id: "box", label: "Box" },
  { id: "alpha", label: "A–Z" },
];

export default function WordsPage() {
  const { data, isLoading } = useUserData();
  const language = data?.user.activeLanguage;
  const info = languageInfo(language);
  const vocabulary = useVocabulary(language);
  const removeWord = useRemoveVocabulary(language);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<WordSort>("due");
  const [dueOnly, setDueOnly] = useState(false);
  const [adding, setAdding] = useState(false);

  const words = useMemo(() => {
    const source = vocabulary.data ?? [];
    const filtered = source.filter((word) => {
      const matchesQuery = word.word.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
      return matchesQuery && (!dueOnly || word.minutesUntilDue <= 0);
    });
    return sortWords(filtered, sort);
  }, [vocabulary.data, query, dueOnly, sort]);

  function confirmDelete(word: Word) {
    const confirmed = window.confirm(`Remove “${word.word}”? It will leave your review schedule.`);
    if (confirmed) removeWord.mutate(word.word);
  }

  if (isLoading || vocabulary.isLoading) return <LoadingScreen />;

  const dueCount = dueWords(vocabulary.data ?? []).length;

  return (
    <div className="page">
      <div className="spread">
        <div>
          <h1 className="title">{info?.label ?? "Words"}</h1>
          <p className="muted">
            {vocabulary.data?.length ?? 0} words · {dueCount} due
          </p>
        </div>
        <button type="button" className="add-button" onClick={() => setAdding(true)}>
          <Icon name="add" size={22} />
          Add
        </button>
      </div>
      <input
        className="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search words"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <div className="wrap">
        {SORTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={sort === item.id ? "chip selected" : "chip"}
            onClick={() => setSort(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button type="button" className={dueOnly ? "chip selected" : "chip"} onClick={() => setDueOnly((value) => !value)}>
          Due only
        </button>
        <button type="button" className="chip" onClick={() => void vocabulary.refetch()}>
          Refresh
        </button>
      </div>
      {removeWord.isError ? <p className="bad-text">{readError(removeWord.error)}</p> : null}
      {words.length === 0 ? (
        <p className="muted">{vocabulary.isError ? "Could not load your words." : "No words match."}</p>
      ) : (
        <div className="stack-tight">
          {words.map((word) => (
            <WordRow key={word.word} word={word} onDelete={confirmDelete} />
          ))}
        </div>
      )}
      <AddWordsModal
        open={adding}
        languageName={info?.label ?? "this language"}
        existing={vocabulary.data ?? []}
        onClose={() => setAdding(false)}
      />
    </div>
  );
}

type AddSource = "typed" | "dictionary";

function AddWordsModal({
  open,
  languageName,
  existing,
  onClose,
}: {
  open: boolean;
  languageName: string;
  existing: Word[];
  onClose: () => void;
}) {
  const { data } = useUserData();
  const language = data?.user.activeLanguage;
  const categories = useCategories(language);
  const addWords = useAddVocabulary(language);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "danger">("success");
  const [messageSource, setMessageSource] = useState<AddSource>("typed");
  const [pending, setPending] = useState<{ word: string; source: AddSource } | null>(null);
  const [failed, setFailed] = useState<{ word: string; note: string } | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const pendingLock = useRef(false);
  const requestId = useRef(0);
  const selected = categories.data?.find((item) => item.name === category);
  const phrase = cleanAnswer(text.toLocaleLowerCase());
  const phraseOwned = phrase.length > 0 && isOwned(phrase, existing, saved);
  const typedPending = pending?.source === "typed";

  useEffect(() => {
    if (open) return;
    requestId.current += 1;
    setText("");
    setCategory(null);
    setMessage(null);
    setPending(null);
    setFailed(null);
    setSaved([]);
    pendingLock.current = false;
  }, [open]);

  function showMessage(source: AddSource, tone: "success" | "danger", next: string) {
    setMessageSource(source);
    setMessageTone(tone);
    setMessage(next);
  }

  async function submit(display: string, source: AddSource) {
    const encoded = encodeWord(display);
    if (!encoded || pendingLock.current || isOwned(display, existing, saved)) return;
    const label = source === "dictionary" ? display.trim() : cleanAnswer(display.toLocaleLowerCase());
    const id = requestId.current + 1;
    requestId.current = id;
    pendingLock.current = true;
    setPending({ word: display, source });
    setFailed(null);
    setMessage(null);
    try {
      const added = await addWords.mutateAsync([encoded]);
      if (requestId.current !== id) return;
      if (added.length === 0) {
        setFailed({ word: display, note: "Not a word" });
        showMessage(source, "danger", `“${label}” isn’t a ${languageName} word or phrase, so it wasn’t added.`);
        return;
      }
      setSaved((current) => [...current, ...added]);
      setFailed(null);
      if (source === "typed") {
        setText("");
        showMessage("typed", "success", `Added “${added[0]}”`);
      }
    } catch (error) {
      if (requestId.current !== id) return;
      setFailed({ word: display, note: "Not added" });
      showMessage(source, "danger", readError(error));
    } finally {
      if (requestId.current === id) {
        pendingLock.current = false;
        setPending(null);
      }
    }
  }

  const status = message ? (
    <p className={messageTone === "success" ? "good-text" : "bad-text"}>{message}</p>
  ) : null;

  return (
    <Modal open={open} title="Add a word" onClose={onClose}>
      <p className="muted">Add one {languageName} word or phrase at a time. Spaces stay part of the phrase.</p>
      <div className={`entry ${phraseOwned ? "owned" : ""} ${typedPending ? "pending" : ""}`}>
        <input
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setMessage(null);
            setFailed(null);
          }}
          placeholder="word or phrase"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          disabled={pending !== null}
          aria-label="Word or phrase"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void submit(text, "typed");
            }
          }}
        />
        {typedPending ? <span className="spinner small" /> : null}
        {phraseOwned ? <Icon name="check" size={22} /> : null}
      </div>
      {phraseOwned ? <p className="good-text">Already in your list</p> : null}
      <PrimaryButton
        label="Add word"
        onClick={() => void submit(text, "typed")}
        disabled={phrase.length === 0 || phraseOwned || pending !== null}
        loading={typedPending}
      />
      {messageSource === "typed" ? status : null}
      <h3 className="section-title">Dictionary</h3>
      <div className="stack-tight">
        <p className="kicker">Sections</p>
        <div className="wrap">
          {(categories.data ?? []).map((item) => (
            <button
              key={item.name}
              type="button"
              className={category === item.name ? "chip selected" : "chip"}
              disabled={pending !== null}
              onClick={() => setCategory(item.name)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
      {categories.isLoading ? <p className="muted">Loading dictionary…</p> : null}
      {categories.isError ? <p className="bad-text">The dictionary could not be loaded.</p> : null}
      {!categories.isLoading && !categories.isError ? (
        <div className="section-card">
          {selected ? (
            <>
              <div>
                <h4 className="section-title" style={{ fontSize: 18 }}>
                  Words in {selected.name}
                </h4>
                <p className="muted">
                  {selected.words.length} {selected.words.length === 1 ? "word" : "words"} · tap one to add it
                </p>
              </div>
              {messageSource === "dictionary" ? status : null}
              {selected.words.length === 0 ? (
                <p className="muted">This section has no words.</p>
              ) : (
                <div className="wrap">
                  {selected.words.map((item) => {
                    const owned = isOwned(item.word, existing, saved);
                    const addingWord = pending !== null && sameWord(pending.word, item.word);
                    const rejected = !owned && !addingWord && failed !== null && sameWord(failed.word, item.word);
                    return (
                      <DictionaryWordChip
                        key={item.word}
                        word={item.word}
                        owned={owned}
                        pending={addingWord}
                        disabled={pending !== null}
                        note={owned ? "Added" : rejected && failed ? failed.note : null}
                        onClick={() => void submit(item.word, "dictionary")}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p className="muted">Choose a section above to see its words.</p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}

function isOwned(candidate: string, existing: Word[], saved: string[]) {
  return hasWord(existing, candidate) || saved.some((word) => sameWord(word, candidate));
}

function DictionaryWordChip({
  word,
  owned,
  pending,
  disabled,
  note,
  onClick,
}: {
  word: string;
  owned: boolean;
  pending: boolean;
  disabled: boolean;
  note: string | null;
  onClick: () => void;
}) {
  const failed = !owned && !pending && note !== null;
  const label = owned ? `${word}, added to your list` : pending ? `Adding ${word}` : failed ? `${word}, ${note}` : `Add ${word}`;
  return (
    <button
      type="button"
      className={`chip word-chip ${owned ? "owned" : ""} ${pending ? "pending" : ""} ${failed ? "failed" : ""}`}
      disabled={owned || disabled}
      aria-label={label}
      onClick={onClick}
    >
      {pending ? <span className="spinner small" /> : <Icon name={owned ? "check" : failed ? "alert" : "add"} size={16} />}
      <span>{word}</span>
      {note ? <span className={owned ? "good-text" : "bad-text"}>{note}</span> : null}
    </button>
  );
}
