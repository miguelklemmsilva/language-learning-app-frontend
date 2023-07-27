import React from "react";
import "./AnswerInput.css";

const AnswerInput = React.forwardRef(({value, onChange, result, onSubmit}, ref) => (
    <div className="answer-input-container">
        <textarea className={`answer-input ${result ? 'submitted' : ''}`}
                  ref={ref}
                  value={value}
                  onKeyDown={(e) => {
                      if (e.key === "Enter") {
                          onSubmit();
                          e.preventDefault();
                      }
                  }}
                  readOnly={result}
                  onChange={onChange}
                  placeholder={"Write your answer here"}
        />
    </div>
));

export default AnswerInput;
