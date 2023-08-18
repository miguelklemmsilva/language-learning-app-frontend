import Pronunciation from "./Pronunciation";
import ListeningButton from "../ListeningButton";
import React, {useEffect, useRef, useState} from "react";
import SpeakingOutput from "./SpeakingOutput";
import SpeakingSubmit from "./SpeakingSubmit";

const Speaking = ({sentence, result, setResult, handleSpeakingSubmit, updateSentence}) => {
    const [listening, setListening] = useState(false);
    const [output, setOutput] = useState(null);
    const [scores, setScores] = useState(null);
    const chunksRef = useRef([]);
    const audioElementRef = useRef(null);

    const onSubmit = () => {
        setScores(null);
        setOutput(null);
        audioElementRef.current.src = "";
        chunksRef.current = [];
        handleSpeakingSubmit();
    }

    return (
        <div className="speaking-container">
            <div className="question-type">Repeat the sentence</div>
            <div className="translation-text">{sentence.original}</div>
            <div className="speaking-btns-container">
                <ListeningButton sentence={sentence}/>
                <Pronunciation sentence={sentence} setResult={setResult} listening={listening}
                               setListening={setListening} chunksRef={chunksRef}
                               audioElementRef={audioElementRef} setScores={setScores}/>
            </div>
            <SpeakingOutput result={result} output={output} setOutput={setOutput} scores={scores}
                            setScores={setScores} updateSentence={updateSentence}/>
            <SpeakingSubmit result={result} listening={listening} onSubmit={onSubmit}/>
        </div>
    )
}

export default Speaking;
