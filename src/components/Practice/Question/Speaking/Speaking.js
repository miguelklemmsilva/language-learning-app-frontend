import SpeakingInput from "./SpeakingInput";
import ListeningButton from "../Listening/ListeningButton";
import React, {useRef, useState} from "react";
import SpeakingOutput from "./SpeakingOutput";
import SpeakingSubmit from "./SpeakingSubmit";

const Speaking = ({sentence, result, setResult, handleNextSentence}) => {
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
        handleNextSentence(true);
    }

    return (
        <div className="question-container">
            <div className="question-type">Repeat the sentence
                <div className="help-txt">Press the speaker button to listen to the sentence. Press the microphone
                    button and start speaking.
                </div>
            </div>
            <div className="translation-text">{sentence.original}</div>
            <div className="speaking-btns-container">
                <ListeningButton sentence={sentence}/>
                <SpeakingInput sentence={sentence} setResult={setResult} listening={listening}
                               setListening={setListening} chunksRef={chunksRef}
                               audioElementRef={audioElementRef} setScores={setScores}/>
            </div>
            <SpeakingOutput result={result} output={output} setOutput={setOutput} scores={scores}
                            setScores={setScores} sentence={sentence}/>
            <SpeakingSubmit result={result} listening={listening} onSubmit={onSubmit}/>
        </div>
    )
}

export default Speaking;
