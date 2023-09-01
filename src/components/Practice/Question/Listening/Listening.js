import React, {useEffect, useState} from "react";
import ListeningButton from "./ListeningButton";
import AnswerInput from "../AnswerInput";
import ListeningSubmitArea from "./ListeningSubmitArea";

const Listening = ({
                       sentence,
                       textarea,
                       answer,
                       handleInputChange,
                       handleSubmit,
                       result,
                       cleanString,
                       handleNextSentence
                   }) => {
    const [correct, setCorrect] = useState(false);

    const onSubmit = () => {
        let correct = cleanString(answer) === cleanString(sentence.original);
        setCorrect(correct)
        let feedback;
        if (correct)
            feedback = sentence.translation; // if the answer is correct, show the translation
        else
            feedback = sentence.original;
        handleSubmit(correct, feedback);
    }

    return (
        <div className="question-container">
            <div className="question-type">Write what you hear
                <div className="help-txt">Click the speaker button to listen to the sentence</div>
            </div>
            <ListeningButton sentence={sentence} textarea={textarea}/>
            <AnswerInput ref={textarea} value={answer} result={result} onChange={handleInputChange}
                         onSubmit={onSubmit} language={sentence.language}/>
            <ListeningSubmitArea onSubmit={onSubmit} result={result} correct={correct} answer={answer}
                                 handleNextSentence={handleNextSentence}/>
        </div>
    );
}

export default Listening;
