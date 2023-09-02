import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React from "react";

const SpeakingSubmit = ({result, onSubmit, listening}) => {
    if (!result)
        return (
            <div className="submit-wrapper-container">
                <div className="submit-wrapper">
                    <button
                        className={`button submit-btn ${listening ? 'inactive' : 'skip'}`}
                        disabled={listening}
                        onClick={onSubmit}>
                        <div className="button-txt">Skip&nbsp;</div>
                        <div className="arrow-wrapper"><ArrowForwardIcon/></div>
                    </button>
                </div>
            </div>
        )


    return (
        <div className="submit-wrapper-container">
            <div className="submit-wrapper">
                <button disabled={listening} className={`submit-btn blue eval button ${listening ? 'inactive' : ''}`}
                onClick={onSubmit}>
                    <div className="button-txt">CONTINUE&nbsp;</div>
                    <div className="arrow-wrapper"><ArrowForwardIcon/></div>
                </button>
            </div>
        </div>
    )
}

export default SpeakingSubmit