import React, {useEffect, useState} from "react";
import "../SubmitArea.scss";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import {CircularProgress} from "@mui/material";

const TranslationSubmitArea = ({onSubmit, result, correct, answer, setSentenceCorrectness}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleCorrectClick = () => {
        if (setSentenceCorrectness) {
            setSentenceCorrectness(true);
        }
    };

    const handleIncorrectClick = () => {
        if (setSentenceCorrectness) {
            setSentenceCorrectness(false);
        }
    };

    useEffect(() => {
        if (result) setIsLoading(false);
    }, [result]);


    if (!result) return (<div className="submit-wrapper">
        <button
            className={`button blue submit-btn${answer ? '' : ' inactive'}`}
            disabled={!answer}
            onClick={() => {
                onSubmit();
                setIsLoading(true);
            }}>            {isLoading ? <CircularProgress size="18px"
                                                          color="inherit"/> : <div>Submit</div>}
        </button>
    </div>)

    return (<div className="submit-wrapper">
        <div className={`feedback ${correct ? 'correct' : 'incorrect'}`}>
            <div className="answer" dangerouslySetInnerHTML={{__html: result}}></div>
        </div>
        <div className={`feedback ${correct ? 'correct' : 'incorrect'}`}>
            <div>The AI sentence evaluator thinks the sentence is {correct ?
                <div className="ai-feedback correct">correct</div> :
                <div className="ai-feedback incorrect">incorrect</div>}.
            </div>
        </div>
        <div className="sentence-eval-buttons-wrapper">
            <button className={`button eval incorrect`} onClick={handleIncorrectClick}>Incorrect Translation&nbsp;
                <div className="button-txt"><ClearIcon/></div>
            </button>
            <button className={`button eval correct`} onClick={handleCorrectClick}>Correct Translation&nbsp;
                <div className="button-txt"><CheckIcon/></div>
            </button>
        </div>
    </div>);
};

export default TranslationSubmitArea;
