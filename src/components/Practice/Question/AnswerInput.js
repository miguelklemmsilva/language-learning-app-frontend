import {forwardRef, useState} from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import "./AnswerInput.scss";

const charactersByLanguage = {
    German: ["ä", "ö", "ü", "ß"],
    Spanish: ["á", "é", "í", "ñ", "ó", "¿", "¡"],
    Portuguese: ["á", "ã", "â", "à", "ç", "é", "ê", "í", "ó", "ô", "õ", "ú"],
    Italian: ["à", "è", "é", "ì", "ò", "ù"],
    French: ["à", "â", "æ", "ç", "é", "è", "ê", "ë", "î", "ï", "ô", "œ", "ù", "û", "ü"],
};

const AnswerInput = forwardRef(({ value, onChange, result, language }, ref) => {
    const [isUppercase, setIsUppercase] = useState(false);

    const characters = charactersByLanguage[language] || [];

    const handleCharacterClick = (char) => {
        // Get the current cursor position
        const start = ref.current.selectionStart;
        const end = ref.current.selectionEnd;

        // Insert the character at this position
        const newValue = value.substring(0, start) + char + value.substring(end);

        // Set the new value
        onChange({ target: { value: newValue } });

        // Move the cursor right after the inserted character
        setTimeout(() => {
            ref.current.selectionStart = ref.current.selectionEnd = start + char.length;
        }, 0);
    };

    const toggleCase = () => {
        setIsUppercase(prev => !prev);
    };

    return (
        <div className="answer-input-container">
            <textarea className={`answer-input ${result ? 'submitted' : ''}`}
                      ref={ref}
                      value={value}
                      disabled={result}
                      onChange={onChange}
                      placeholder="Write your answer here"
            />
            <div className="characters-container">
                <button onClick={toggleCase} className="button word">
                    {isUppercase ? <div className="button-txt"><ArrowDownwardIcon sx={{font: "inherit"}}/></div> : <ArrowUpwardIcon sx={{font: "inherit"}}/>}
                </button>
                {characters.map(char => (
                    <button key={char}
                            onClick={() => handleCharacterClick(isUppercase ? char.toUpperCase() : char)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="button word"
                    >
                        {isUppercase ? char.toUpperCase() : char}
                    </button>
                ))}
            </div>
        </div>
    );
});

export default AnswerInput;
