import React, {useState} from "react";
import axios from "axios";
import AnswerInput from "../AnswerInput";
import TranslationSubmitArea from "./TranslationSubmitArea";
import {useAuth0} from "@auth0/auth0-react";
import Tooltip from "@mui/material/Tooltip";
import CustomTooltip from "../../CustomTooltip";
import ListeningButton from "../Listening/ListeningButton";

const Translation = ({
                         sentence,
                         textarea,
                         answer,
                         result,
                         handleInputChange,
                         handleSubmit,
                         cleanString,
                         handleNextSentence,
                         cleanEmptyArea
                     }) => {
    const [correct, setCorrect] = useState(false);
    const {getAccessTokenSilently} = useAuth0();

    const setSentenceCorrectness = (isCorrect) => {
        handleSubmit(isCorrect, sentence.original);
        handleNextSentence(isCorrect);
    };

    const formatAlignment = (alignment) => {
        if (!alignment)
            return [];
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

        const components = [];
        let buffer = [];
        let currentWord = null;

        const isPunctuation = (char) => /[.,?!¡¿]/.test(char);  // regex pattern to test for punctuation

        for (let index = 0; index < translation.length; index++) {
            const char = translation[index];
            const matchedRange = alignments.find(range => index >= range.translated.start && index <= range.translated.end);

            if (matchedRange && !isPunctuation(char)) {  // Check for punctuation here
                const word = original.slice(matchedRange.original.start, matchedRange.original.end + 1);

                if (currentWord && currentWord === word) {
                    buffer.push(char);
                } else {
                    if (buffer.length && !isPunctuation(buffer.join(''))) {  // Check for punctuation here too
                        components.push({
                            index: index - buffer.length,
                            word: currentWord,
                            text: buffer.join('')
                        });
                        buffer = [];
                    }
                    buffer.push(char);
                    currentWord = word;
                }
            } else {
                if (buffer.length && !isPunctuation(buffer.join(''))) {  // Again, check for punctuation
                    components.push({
                        index: index - buffer.length,
                        word: currentWord,
                        text: buffer.join('')
                    });
                    buffer = [];
                }
                currentWord = null;
                components.push(char);
            }
        }

        if (buffer.length && !isPunctuation(buffer.join(''))) {  // One more punctuation check
            components.push({
                index: translation.length - buffer.length,
                word: currentWord,
                text: buffer.join('')
            });
        }

        return components.map((comp) => {
            if (typeof comp === 'string')
                return comp;
            else {
                // Render the tooltip around the phrase
                return (
                    <CustomTooltip placement="bottom" key={comp.index} title={comp.word} arrow>
                        <div className={`word`}>
                            {comp.text}
                        </div>
                    </CustomTooltip>
                );
            }
        });
    };

    const checkTranslation = async () => {
        const comparisonString = cleanEmptyArea(sentence.original);

        let correct = cleanString(answer) === cleanString(comparisonString);

        if (correct)
            return {correct: true, exact: true};

        try {
            const {data} = await axios.post('/api/ai/verifySentence', {
                string1: comparisonString,
                string2: cleanEmptyArea(answer),
            }, {
                headers: {
                    Authorization: `Bearer ${await getAccessTokenSilently()}`
                }
            });
            return data;
        } catch (e) {
            console.error(e);
            return {correct: false, exact: false};
        }
    }

    const onSubmit = async () => {
        const correct = await checkTranslation();
        setCorrect(correct);
        handleSubmit(correct.correct, sentence.original);
    }

    return (
        <div className="question-container">
            <div className="question-type">Translate the sentence into {sentence.language}
                <div className="help-txt">Click on the highlighted words for help!</div>
            </div>
            <div className="translation-text">{renderTranslation()}</div>
            <AnswerInput ref={textarea} value={answer} result={result} onChange={handleInputChange}
                         onSubmit={onSubmit} language={sentence.language}/>
            <TranslationSubmitArea sentence={sentence} onSubmit={onSubmit} result={result} correct={correct} answer={answer}
                                   setSentenceCorrectness={setSentenceCorrectness}
            />
        </div>
    );
}

export default Translation;
