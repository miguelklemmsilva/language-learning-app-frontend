import React, {useRef, useState} from "react";
import "./Question.scss";
import Listening from "./Listening/Listening";
import Translation from "./Translation/Translation";
import Speaking from "./Speaking/Speaking";
import prepareString from "../Practice/CorrectionString";

const Question = ({sentence, updateSentence}) => {
    const textareaRef = useRef(null);
    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState(null);

    const handleInputChange = (e) => {
        setAnswer(e.target.value);
    };

    function cleanString(str) {
        return str
            .replace(/[^a-zA-Z\u00C0-\u017F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function cleanEmptyArea(str) {
        return str
            .replace(/\s+/g, ' ')
            .trim();
    }

    const handleGetResult = (correct, feedback) => {
        if (correct)
            setResult(feedback);
        else {
            const response = prepareString(cleanString(answer), cleanString(feedback), feedback);
            setResult(response);
        }
    };

    const handleNextSentence = (correct) => {
        if (correct === null)
            return;
        if (correct) updateSentence(true); else updateSentence(false);
        setResult("");
        setAnswer("");
    }

    if (sentence.type === "listening") return <Listening sentence={sentence} textarea={textareaRef}
                                                         handleInputChange={handleInputChange}
                                                         handleSubmit={handleGetResult} result={result} answer={answer}
                                                         cleanString={cleanString} handleNextSentence={handleNextSentence}/>;
    if (sentence.type === "translation") return <Translation sentence={sentence} textarea={textareaRef}
                                                             handleInputChange={handleInputChange}
                                                             handleSubmit={handleGetResult} result={result}
                                                             answer={answer} cleanString={cleanString} cleanEmptyArea={cleanEmptyArea}
                                                             handleNextSentence={handleNextSentence}/>
    if (sentence.type === "speaking") return <Speaking sentence={sentence} result={result} setResult={setResult}
                                                       updateSentence={updateSentence} handleNextSentence={handleNextSentence}/>
};

export default Question;
