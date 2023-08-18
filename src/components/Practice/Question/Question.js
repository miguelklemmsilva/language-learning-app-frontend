import React, {useEffect, useRef, useState} from "react";
import "./Question.css";
import Listening from "./Listening";
import Translation from "./Translation/Translation";
import Speaking from "./Speaking/Speaking";
import prepareString from "../Practice/CorrectionString";

const Question = ({sentence, setNextQuestion, sentenceNumber, updateSentence}) => {
    const textareaRef = useRef(null);
    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState(null);

    const handleInputChange = (e) => {
        setAnswer(e.target.value);
    };

    useEffect(() => {
        if (sentence.type !== "speaking")
            textareaRef.current.focus();
    }, [sentence.type]);

    function cleanString(str) {
        return str
            .replace(/[^a-zA-Z\u00C0-\u017F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF\s]/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim();
    }

    const handleSubmit = (correct, feedback) => {
        textareaRef.current.focus(); // focus back onto the textarea
        if (answer === "") // if the answer is empty, do nothing
            return;
        if (!result) { // if the result is empty, check the answer
            if (correct) {
                setResult(feedback);
                updateSentence(true);
            } else {
                const response = prepareString(cleanString(answer), cleanString(feedback), feedback);
                setResult(response);
                textareaRef.current.focus();
                updateSentence(false);
            }
        } else {
            setResult("");
            setAnswer("");
            setNextQuestion();
        }
    };

    const handleSpeakingSubmit = () => {
        setResult("");
        setAnswer("");
        setNextQuestion();
    }

    if (sentence.type === "listening")
        return <Listening sentence={sentence} textarea={textareaRef} handleInputChange={handleInputChange}
                          handleSubmit={handleSubmit} result={result} answer={answer} cleanString={cleanString}/>;
    if (sentence.type === "translation")
        return <Translation sentence={sentence} textarea={textareaRef} handleInputChange={handleInputChange}
                            handleSubmit={handleSubmit} result={result} answer={answer} cleanString={cleanString}/>
    if (sentence.type === "speaking")
        return <Speaking sentence={sentence} result={result} setResult={setResult}
                         handleSpeakingSubmit={handleSpeakingSubmit} updateSentence={updateSentence}/>
};

export default Question;
