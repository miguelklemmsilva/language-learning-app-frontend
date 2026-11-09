import { useEffect, useRef, useState } from "react";
import { Language } from "../../types/api";

const charactersByLanguage: Partial<Record<Language, string[]>> = {
  [Language.German]: ["ä", "ö", "ü", "ß"],
  [Language.Spanish]: ["á", "é", "í", "ñ", "ó", "ú", "¿", "¡"],
  [Language.Portuguese]: ["á", "ã", "â", "à", "ç", "é", "ê", "í", "ó", "ô", "õ", "ú"],
  [Language.Italian]: ["à", "è", "é", "ì", "ò", "ù"],
  [Language.French]: ["à", "â", "æ", "ç", "é", "è", "ê", "ë", "î", "ï", "ô", "œ", "ù", "û", "ü"],
};

type AnswerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  disabled?: boolean;
  placeholder: string;
  onSubmit?: () => void;
};

export function AnswerField({
  value,
  onChange,
  language,
  disabled = false,
  placeholder,
  onSubmit,
}: AnswerFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<number | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const characters = charactersByLanguage[language] ?? [];

  useEffect(() => {
    const textarea = textareaRef.current;
    const caret = caretRef.current;
    if (!textarea || caret === null) return;
    caretRef.current = null;
    textarea.focus();
    textarea.selectionStart = caret;
    textarea.selectionEnd = caret;
  }, [value]);

  function insert(character: string) {
    const textarea = textareaRef.current;
    if (!textarea || disabled) return;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    caretRef.current = start + character.length;
    onChange(value.slice(0, start) + character + value.slice(end));
  }

  return (
    <div className="stack-tight">
      <textarea
        ref={textareaRef}
        className="answer"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onSubmit?.();
          }
        }}
      />
      {characters.length > 0 ? (
        <div className="accent-row">
          <button
            type="button"
            className={uppercase ? "chip selected accent-key" : "chip accent-key"}
            aria-pressed={uppercase}
            aria-label={uppercase ? "Use lowercase accents" : "Use uppercase accents"}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setUppercase((current) => !current)}
          >
            {uppercase ? "abc" : "ABC"}
          </button>
          {characters.map((character) => {
            const shown = uppercase ? character.toUpperCase() : character;
            return (
              <button
                key={character}
                type="button"
                className="chip accent-key"
                disabled={disabled}
                aria-label={`Insert ${shown}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insert(shown)}
              >
                {shown}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
