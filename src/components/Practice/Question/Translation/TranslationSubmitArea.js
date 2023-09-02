import React, {useEffect, useState} from "react";
import "../SubmitArea.scss";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import {CircularProgress} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

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

    function GrammaticalError({content}) {
        // Split the content by lines
        const lines = content.split('\n');
        const message = lines[1].split("Message:")[1];
        const suggestion = lines[2]?.split("Suggestion:")[1]?.split(";")[0]
        const errorSentence = lines[3];
        const errorLoc = lines[4];

        const startPos = errorLoc.indexOf("^");
        const endPos = errorLoc.lastIndexOf("^");

        // Underline the portion of errorSentence between startPos and endPos
        const underlinedErrorSentence = errorSentence.split('').map((char, index) => {
            if (index >= startPos && index <= endPos) {
                return <u key={index}>{char}</u>;
            }
            return char;
        });

        return (<div className="feedback-message">
            <div>{message}</div>
            <div>{underlinedErrorSentence}</div>
            <div>Suggestion: {suggestion}</div>
        </div>);
    }

    if (!result) return (<div className="submit-wrapper">
        <button
            className={`button blue submit-btn${answer ? '' : ' inactive'}`}
            disabled={isLoading || !answer}
            onClick={() => {
                onSubmit();
                setIsLoading(true);
            }}>            {isLoading ? <CircularProgress size="18px"
                                                          color="inherit"/> : <div>Submit</div>}
        </button>
    </div>)

    return (<div className={`submit-wrapper ${correct.correct ? 'correct' : 'incorrect'}`}>
        <div className="feedback">
            <div style={{display: "grid", placeItems: "center"}}>
                <div className="visual-feedback">
                    {correct.correct ? <CheckIcon sx={{font: "inherit"}}/> : <ClearIcon sx={{font: "inherit"}}/>}
                </div>
            </div>
            <div>
                <div className="feedback-title">{correct.correct ? "Correct!" : "Incorrect"}</div>
                <div className="feedback-message" dangerouslySetInnerHTML={{__html: result}}></div>
                {!correct.correct && <>
                    {correct.error && <>
                        <div className={"feedback-title"}
                             style={{fontSize: "1.4rem", marginTop: "10px"}}>Grammatical error!
                        </div>
                        <GrammaticalError content={correct.error}/>
                    </>}
                </>}
            </div>
        </div>
        <div className="sentence-eval-buttons-wrapper">
            <button className="button eval" onClick={() => {
                if (correct.correct) handleCorrectClick(); else handleIncorrectClick();
            }}>CONTINUE&nbsp;
                <div className="arrow-wrapper"><ArrowForwardIcon/></div>
            </button>
            {!correct.correct && !correct.error && <button className="button change-result" onClick={() => {
                handleCorrectClick();
            }}>The translation was correct</button>}
            {correct.correct && !correct.exact && <button className="button change-result" onClick={() => {
                handleIncorrectClick();
            }}>The translation was incorrect</button>}
        </div>
    </div>);
};

export default TranslationSubmitArea;
