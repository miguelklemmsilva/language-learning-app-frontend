import Pronunciation from "./Pronunciation";
import ListeningButton from "../ListeningButton";
import React, {useEffect, useState} from "react";
import SpeakingOutput from "./SpeakingOutput";
import SpeakingSubmit from "./SpeakingSubmit";

const Speaking = ({sentence, result, setResult, setNextQuestion, sentenceNumber, updateSentence}) => {
    const [listening, setListening] = useState(false);

    useEffect(() => {
        updateSentence(sentenceNumber, true);
    }, [sentenceNumber]);

    return (
        <div className="speaking-container">
            <div className="question-type">Repeat the sentence</div>
            <div className="translation-text">{sentence.original}</div>
            <div className="speaking-btns-container">
                <ListeningButton sentence={sentence}/>
                <Pronunciation sentence={sentence} setResult={setResult} listening={listening}
                               setListening={setListening}/>
            </div>
            <SpeakingOutput result={result} sentence={sentence}/>
            <SpeakingSubmit result={result} setNextQuestion={setNextQuestion}/>
        </div>
    )
}

export default Speaking;
