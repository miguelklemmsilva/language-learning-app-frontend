import React, {useRef} from "react";
import ListeningButton from "./ListeningButton";
import AnswerInput from "./AnswerInput";
import SubmitArea from "./SubmitArea";

const Listening = ({sentence, textarea, answer, handleInputChange, handleSubmit, result, cleanString}) => {
    const [correct, setCorrect] = React.useState(false);

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
        <div className={"question-container listening"}>
            <div className="question-type">Write what you hear</div>
            <ListeningButton sentence={sentence} textarea={textarea}/>
            <AnswerInput ref={textarea} value={answer} result={result} onChange={handleInputChange}
                         onSubmit={onSubmit}/>
            <SubmitArea onSubmit={onSubmit} result={result} correct={correct} answer={answer}/>
        </div>
    );
}

export default Listening;
