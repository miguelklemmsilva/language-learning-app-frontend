import React from "react";
import {Skeleton} from "@mui/material";

const PracticeLoading = () => (
    <div style={{justifyContent: "center"}} className="main-content no-margin">
        <div className="question-container">
            <div className="top-container"><Skeleton/></div>
            <div className="question-component-wrapper">
                <div className="question-container">
                    <div className="question-type"><Skeleton/></div>
                    <div className="translation-text"><Skeleton/><Skeleton/></div>
                    <div className="answer-input-container">
                        <div><Skeleton height={150}/></div>
                    </div>
                    <div className="submit-wrapper">
                        <div className="submit-btn">
                            <Skeleton/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default PracticeLoading;
