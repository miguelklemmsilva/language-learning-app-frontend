import { forwardRef, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import "./AnswerInput.scss";
import { Language } from "../../../types/api";

const charactersByLanguage: Partial<Record<Language, string[]>> = {
  [Language.German]: ["ä", "ö", "ü", "ß"],
  [Language.Spanish]: ["á", "é", "í", "ñ", "ó", "ú", "¿", "¡"],
  [Language.Portuguese]: ["á", "ã", "â", "à", "ç", "é", "ê", "í", "ó", "ô", "õ", "ú"],
  [Language.Italian]: ["à", "è", "é", "ì", "ò", "ù"],
  [Language.French]: [
    "à",
    "â",
    "æ",
    "ç",
    "é",
    "è",
    "ê",
    "ë",
    "î",
    "ï",
    "ô",
    "œ",
    "ù",
    "û",
    "ü",
  ],
};

interface AnswerInputProps {
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  result: string | null;
  language: Language;
  onSubmit?: () => void;
}

const AnswerInput = forwardRef<HTMLTextAreaElement, AnswerInputProps>(
  ({ value, onChange, result, language }, ref) => {
    const [isUppercase, setIsUppercase] = useState(false);

    const characters = charactersByLanguage[language] || [];

    const handleCharacterClick = (char: string) => {
      const textarea = ref && typeof ref !== "function" ? ref.current : null;
      if (!textarea) return;

      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;

      const newValue = value.substring(0, start) + char + value.substring(end);

      onChange({ target: { value: newValue } });

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + char.length;
      }, 0);
    };

    const toggleCase = () => {
      setIsUppercase((prev) => !prev);
    };

    return (
      <div className="answer-input-container">
        <textarea
          className={`answer-input ${result ? "submitted" : ""}`}
          ref={ref}
          value={value}
          disabled={Boolean(result)}
          onChange={onChange}
          placeholder="Write your answer here"
        />
        {characters.length > 0 && (
          <div className="characters-container">
            <button onClick={toggleCase} className="button word">
              {isUppercase ? (
                <div className="button-txt">
                  <ArrowDownwardIcon sx={{ font: "inherit" }} />
                </div>
              ) : (
                <ArrowUpwardIcon sx={{ font: "inherit" }} />
              )}
            </button>
            {characters.map((char) => (
              <button
                key={char}
                onClick={() => handleCharacterClick(isUppercase ? char.toUpperCase() : char)}
                onMouseDown={(e) => e.preventDefault()}
                className="button word"
                disabled={Boolean(result)}
              >
                {isUppercase ? char.toUpperCase() : char}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

AnswerInput.displayName = "AnswerInput";

export default AnswerInput;
