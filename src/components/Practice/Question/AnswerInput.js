import React from "react";
import "./AnswerInput.scss";

const AnswerInput = React.forwardRef(({value, onChange, result, onSubmit}, ref) => (
    <div className="answer-input-container">
        <textarea className={`answer-input ${result ? 'submitted' : ''}`}
                  ref={ref}
                  value={value}
                  disabled={result}
                  onChange={onChange}
                  placeholder="Write your answer here"
        />
    </div>
));

export default AnswerInput;
