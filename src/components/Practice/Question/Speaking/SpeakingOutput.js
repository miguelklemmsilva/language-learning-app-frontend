import React, {Fragment, useEffect, useState} from "react";
import "./SpeakingOutput.css";
import Tooltip from "../Translation/Tooltip";
import {PronunciationAssessmentResult, SpeechRecognitionResult} from "microsoft-cognitiveservices-speech-sdk";

const SpeakingOutput = ({result}) => {
    const [output, setOutput] = useState(null);
    const [scores, setScores] = useState(null);

    // Update the textarea value on component mount
    useEffect(() => {
        const formatOutput = () => {
            const words = result.privPronJson.Words;
            const formattedOutput = words.map((word, index) => {
                const {Word, PronunciationAssessment} = word;
                const {AccuracyScore, ErrorType} = PronunciationAssessment;

                let feedback = "\n";

                if (ErrorType !== "None") {
                    feedback += ErrorType;
                }

                if (ErrorType !== "Omission") {
                    if (ErrorType !== "None") feedback += ": ";
                    feedback += AccuracyScore;
                }

                // Add a space after each word (except the last one)
                const space = index < words.length - 1 ? " " : "";

                return (
                    <Fragment key={index}>
                        <Tooltip text={feedback} errorType={ErrorType}>
                            {Word}
                        </Tooltip>
                        {space}
                    </Fragment>
                );
            });

            setOutput(formattedOutput);
        };

        const formatScores = () => {
            const scoreNames = [{
                name: 'AccuracyScore',
                display: 'Accuracy Score'
            }, {
                name: 'CompletenessScore',
                display: 'Completeness Score'
            }, {
                name: 'FluencyScore',
                display: 'Fluency Score'
            }, {
                name: 'PronScore',
                display: 'Pronunciation Score'
            }];
            const formattedScores = scoreNames.map((scoreName) => {
                const scoreValue = result.privPronJson.PronunciationAssessment[scoreName.name];
                let scoreColour = '';
                if (scoreValue >= 95)
                    scoreColour = '#3db03d';
                else if (scoreValue >= 80)
                    scoreColour = '#ffcc00';
                else
                    scoreColour = '#cb0000';
                return (
                    <div className="score" key={scoreName.name}>
                        <div className="score-name">{scoreName.display}: {scoreValue}</div>
                        <div className="score-bar" style={{width: `${scoreValue}%`, backgroundColor: scoreColour}}/>
                    </div>
                );
            });

            const scores = <div className="scores">{formattedScores}</div>;

            setScores(scores);
        };

        if (result instanceof PronunciationAssessmentResult) {
            console.log(result);
            formatOutput();
            formatScores();
        } else if (result instanceof SpeechRecognitionResult)
            setOutput(result.text);
        else
            setOutput(result);
    }, [result]);

    return (<div className="speaking-output-container">
        <div className="speaking-output" placeholder={"Start speaking!"}>
            {output}
        </div>
        <div className="score-container">
            {scores}
        </div>
    </div>);
};

export default SpeakingOutput;
