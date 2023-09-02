import React from "react";
import "../SubmitArea.scss";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const ListeningSubmitArea = ({sentence, onSubmit, handleNextSentence, result, correct, answer}) => {
    if (!result) return (<div className="submit-wrapper">
        <button
            className={`button blue submit-btn${answer ? '' : ' inactive'}`}
            disabled={!answer}
            onClick={onSubmit}>{"Submit"}</button>
    </div>)

    return (<div className={`submit-wrapper ${correct ? 'correct' : 'incorrect'}`}>
        <div className="feedback">
            <div style={{display: "grid", placeItems: "center"}}>
                <div className="visual-feedback">
                    {correct ? <CheckIcon sx={{font: "inherit"}}/> : <ClearIcon sx={{font: "inherit"}}/>}
                </div>
            </div>
            <div>
                <div className="feedback-title">{correct ? "Correct!" : "Incorrect"}</div>
                <div className="feedback-message" dangerouslySetInnerHTML={{__html: result}}></div>
                {!correct && <>
                    <div className={"feedback-title"} style={{fontSize: "1.4rem", marginTop: "10px"}}>Translation:</div>
                    <div className="feedback-message">{sentence.translation}</div>
                </>}
            </div>
        </div>
        <div className="sentence-eval-buttons-wrapper">
            <button className="button eval" onClick={() => {
                handleNextSentence(correct)
            }}>CONTINUE&nbsp;
                <div className="arrow-wrapper"><ArrowForwardIcon/></div>
            </button>
        </div>
    </div>);
}

export default ListeningSubmitArea;