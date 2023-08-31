import React from "react";
import "../SubmitArea.scss";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const ListeningSubmitArea = ({onSubmit, handleNextSentence, result, correct, answer}) => {
    if (!result)
        return (<div className="submit-wrapper">
            <button
                className={`button blue submit-btn${answer ? '' : ' inactive'}`}
                disabled={!answer}
                onClick={onSubmit}>{"Submit"}</button>
        </div>)

    return (<div className="submit-wrapper">
        <div className={`feedback ${correct ? 'correct' : 'incorrect'}`}>
            <div className="answer" dangerouslySetInnerHTML={{__html: result}}></div>
        </div>

        <div className="sentence-eval-buttons-wrapper">
            <button className="button blue eval" onClick={() => {handleNextSentence(correct)}}>Next Question&nbsp;
                <div className="arrow-wrapper"><ArrowForwardIcon/></div>
            </button>
        </div>
    </div>);
}

export default ListeningSubmitArea;