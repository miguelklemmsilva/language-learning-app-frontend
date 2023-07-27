import React from "react";
import "./SubmitArea.css";

const SubmitArea = ({onSubmit, result, correct, answer}) => (
    <div className={`submit-wrapper-container`}>
        <div className={`submit-wrapper${result ? ' submitted' : ''}${correct ? ' correct' : ' wrong'}`}>
            <div className="answer" dangerouslySetInnerHTML={{__html: result}}></div>
            <button
                className={`submit-btn ${answer ? '' : 'inactive'} ${result ? 'submitted' : ''} ${correct ? '' : 'wrong'}`}
                onClick={onSubmit}>{result ? "Next" : "Submit"}</button>
        </div>
    </div>
);

export default SubmitArea;
