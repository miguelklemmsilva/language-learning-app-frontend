import React, {Fragment, useEffect} from "react";
import "./SpeakingOutput.css";
import Tooltip from '@mui/material/Tooltip';
import {PronunciationAssessmentResult, SpeechRecognitionResult} from "microsoft-cognitiveservices-speech-sdk";
import {styled, tooltipClasses} from "@mui/material";

const SpeakingOutput = ({result, scores, setScores, output, setOutput, updateSentence}) => {
    const CustomTooltip = styled(({className, ...props}) => (
        <Tooltip {...props} classes={{popper: className}}/>
    ))(({theme}) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            fontSize: "0.85rem",
        },
    }));

    // Update the textarea value on component mount
    useEffect(() => {
        const formatOutput = () => {
            const words = result.privPronJson.Words;
            const formattedOutput = words.map((word, index) => {
                const {Word, PronunciationAssessment} = word;
                const {AccuracyScore, ErrorType} = PronunciationAssessment;

                let feedback = "\n";

                if (ErrorType !== "None")
                    feedback += ErrorType;

                if (ErrorType !== "Omission") {
                    if (ErrorType !== "None") feedback += ": ";
                    feedback += AccuracyScore;
                }

                // Add a space after each word (except the last one)
                const space = index < words.length - 1 ? " " : "";

                return (<Fragment key={index}>
                    <CustomTooltip title={feedback} placement="bottom" arrow>
                        <div className={`word ${ErrorType}`}>
                            {Word}
                        </div>
                    </CustomTooltip>
                    {space}
                </Fragment>);
            });

            setOutput(formattedOutput);
        };

        let totalScore = 0;

        const formatScores = () => {
            const scoreNames = [{
                name: 'AccuracyScore', display: 'Accuracy Score'
            }, {
                name: 'CompletenessScore', display: 'Completeness Score'
            }, {
                name: 'FluencyScore', display: 'Fluency Score'
            }, {
                name: 'PronScore', display: 'Pronunciation Score'
            }];

            const formattedScores = scoreNames.map((scoreName) => {
                const scoreValue = result.privPronJson.PronunciationAssessment[scoreName.name];
                totalScore += scoreValue;
                let scoreColour = '';
                if (scoreValue >= 95) scoreColour = '#3db03d'; else if (scoreValue >= 80) scoreColour = '#ffcc00'; else scoreColour = '#cb0000';
                return (<div className="score" key={scoreName.name}>
                    <div className="score-name">{scoreName.display}: {scoreValue}</div>
                    <div className="score-bar" style={{width: `${scoreValue}%`, backgroundColor: scoreColour}}/>
                </div>);
            });

            const scores = <div className="scores">{formattedScores}</div>;

            setScores(scores);
        };

        if (result instanceof PronunciationAssessmentResult) {
            formatOutput();
            formatScores();
            if (totalScore/4 >= 85) updateSentence(true); else updateSentence(false); // decides whether to mark the sentence as correct or not depending on mean score
        } else if (result instanceof SpeechRecognitionResult) setOutput(result.text); else setOutput(result);
    }, [result]);

    return <div className="speaking-output-container">
        <div
            className="speaking-output"
            placeholder={"Start speaking!"}>
            {output}
        </div>
        <div className="score-container">
            {scores}
        </div>
    </div>;
};

export default SpeakingOutput;
