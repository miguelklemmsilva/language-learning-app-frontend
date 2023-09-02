import React, {Fragment, useEffect} from "react";
import "./SpeakingOutput.scss";
import {PronunciationAssessmentResult, SpeechRecognitionResult} from "microsoft-cognitiveservices-speech-sdk";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomTooltip from "../../CustomTooltip";

const SpeakingOutput = ({result, scores, setScores, output, setOutput, sentence}) => {
    function ScoreCircle({scoreValue, color}) {
        const radius = 21;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (scoreValue / 100) * circumference;

        return (<div className="score-circle">
            <svg viewBox="0 0 50 50">
                <circle
                    cx="25"
                    cy="25"
                    r={radius}
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="4"
                />
                <circle
                    cx="25"
                    cy="25"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="score-circle-text">{scoreValue}</div>
        </div>);
    }

    // Update the textarea value on component mount
    useEffect(() => {
        const formatOutput = () => {
            const words = result.privPronJson.Words;
            const formattedOutput = words.map((word, index) => {
                const {Word, PronunciationAssessment} = word;
                const {AccuracyScore, ErrorType} = PronunciationAssessment;

                let feedback = "\n";

                if (ErrorType !== "None") feedback += ErrorType;

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

        const formatScores = () => {
            const scoreNames = [{
                name: 'PronScore', display: <div className="score-description">Pronunciation Score&nbsp;<CustomTooltip
                    title="Overall score indicating the pronunciation quality of the given speech. This is aggregated from AccuracyScore, FluencyScore, and CompletenessScore with weight."
                    sx={{font: "inherit"}} arrow><HelpOutlineIcon
                    sx={{font: "inherit", color: "gray"}}/></CustomTooltip></div>
            }, {
                name: 'AccuracyScore', display: <div className="score-description">Accuracy Score&nbsp;<CustomTooltip
                    title="Pronunciation accuracy of the speech. Accuracy indicates how closely the phonemes match a native speaker's pronunciation. Word and full text accuracy scores are aggregated from phoneme-level accuracy score."
                    sx={{font: "inherit"}} arrow><HelpOutlineIcon
                    sx={{font: "inherit", color: "gray"}}/></CustomTooltip></div>
            }, {
                name: 'FluencyScore', display: <div className="score-description">Fluency Score&nbsp;<CustomTooltip
                    title="Fluency of the given speech. Fluency indicates how closely the speech matches a native speaker's use of silent breaks between words."
                    sx={{font: "inherit"}} arrow><HelpOutlineIcon
                    sx={{font: "inherit", color: "gray"}}/></CustomTooltip></div>
            }, {
                name: 'CompletenessScore',
                display: <div className="score-description">Completeness Score&nbsp;<CustomTooltip
                    title="Completeness of the speech, calculated by the ratio of pronounced words to the input reference text."
                    sx={{font: "inherit"}} arrow><HelpOutlineIcon
                    sx={{font: "inherit", color: "gray"}}/></CustomTooltip></div>
            }];

            const formattedScores = scoreNames.map((scoreName) => {
                const scoreValue = result.privPronJson.PronunciationAssessment[scoreName.name];
                let scoreColour;
                if (scoreValue >= 80) scoreColour = '#3db03d'; else if (scoreValue >= 60) scoreColour = '#ffcc00'; else scoreColour = '#cb0000';
                return (<div className="score" key={scoreName.name}>
                    <ScoreCircle scoreValue={scoreValue} color={scoreColour}/>
                    <div className="score-name">{scoreName.display}</div>
                </div>);
            });

            const scores = <Fragment>
                <div className="feedback correct">{sentence.translation}</div>
                <div className="scores">{formattedScores}</div>
            </Fragment>;

            setScores(scores);
        };

        if (result instanceof PronunciationAssessmentResult) {
            formatOutput();
            formatScores();
        } else if (result instanceof SpeechRecognitionResult) setOutput(result.text); else setOutput(result);
    }, [result]);

    return <div className="speaking-output-container">
        <div
            className="speaking-output"
            placeholder="Start speaking!">
            {output}
        </div>
        <div className="score-container">
            {scores}
        </div>
    </div>;
};

export default SpeakingOutput;
