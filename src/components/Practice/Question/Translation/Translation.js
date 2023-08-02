import Tooltip from "./Tooltip";
import React from "react";
import axios from "axios";
import AnswerInput from "../AnswerInput";
import SubmitArea from "../SubmitArea";

const Listening = ({sentence, textarea, answer, result, handleInputChange, handleSubmit, cleanString}) => {
    const [correct, setCorrect] = React.useState(false);

    const formatAlignment = (alignment) => {
        const items = alignment.split(' ');
        const formattedObjects = []
        for (const item of items) {
            const [original, translated] = item.split('-');
            const [originalStart, originalEnd] = original.split(':');
            const [translatedStart, translatedEnd] = translated.split(':');

            const originalObject = {
                start: parseInt(originalStart),
                end: parseInt(originalEnd)
            };

            const translatedObject = {
                start: parseInt(translatedStart),
                end: parseInt(translatedEnd)
            };

            formattedObjects.push({original: originalObject, translated: translatedObject});
        }
        return formattedObjects;
    }

    const renderTranslation = () => {
        const alignments = formatAlignment(sentence.alignment);
        const translation = sentence.translation;
        const original = sentence.original;

        return translation.split('').map((char, index) => {
            const matchedRange = alignments.find(range => index >= range.translated.start && index <= range.translated.end);

            if (matchedRange) {
                const word = original.slice(
                    matchedRange.original.start,
                    matchedRange.original.end + 1
                );

                // Render the component around the phrase
                return (
                    <Tooltip key={index} text={word}>
                        {char}
                    </Tooltip>
                );
            } else {
                // Render the character as normal
                return char;
            }
        });
    };

    const checkTranslation = async () => {
        const comparisonString = cleanString(sentence.original);

        let correct = cleanString(answer) === cleanString(comparisonString);

        if (!correct) {
            const {data} = await axios.post('/api/ai/verifySentence', {
                string1: comparisonString,
                string2: cleanString(answer),
            });
            correct = data.correct;
        }
        return correct;
    }

    const onSubmit = async () => {
        const correct = await checkTranslation();
        setCorrect(correct);
        handleSubmit(correct, sentence.original);
    }


    return (
        <div className={"question-container"}>
            <div className="question-type">Translate the sentence</div>
            <div className="translation-text">{renderTranslation()}</div>
            <AnswerInput ref={textarea} value={answer} result={result} onChange={handleInputChange}
                         onSubmit={onSubmit}/>
            <SubmitArea onSubmit={onSubmit} result={result} correct={correct} answer={answer}/>
        </div>
    );
}

export default Listening;
