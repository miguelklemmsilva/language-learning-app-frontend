import React, {Fragment, useRef} from 'react';
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import {getTokenOrRefresh} from "./token_util";
import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';

const SpeakingInput = ({sentence, setResult, listening, setListening, chunksRef, audioElementRef, setScores}) => {
    const mediaRecorderRef = useRef(null);
    const recognizerRef = useRef(null);

    const sttFromMic = async () => {
        const tokenObj = await getTokenOrRefresh();
        const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "3000");
        speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "3000");

        const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

        const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(sentence.original, sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Phoneme, true)

        speechConfig.speechRecognitionLanguage = sentence.locale;

        if (recognizerRef.current) {
            // If already listening, stop recognition and recording
            if (listening) {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    stopRecording();
                }
                recognizerRef.current.stopContinuousRecognitionAsync();
                recognizerRef.current = null; // Clear the ref
                setListening(false);
                return;
            }
        }

        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        pronunciationAssessmentConfig.applyTo(recognizer);
        recognizerRef.current = recognizer; // Store it in the ref

        audioElementRef.current.src = "";
        chunksRef.current = [];

        setResult(null);
        setScores(null);
        setListening(true);

        let complete = false;

        recognizer.recognizing = function (s, e) {
            setResult(e.result);
        };

        recognizer.recognized = function (s, e) {
            recognizer.stopContinuousRecognitionAsync();
        };

        recognizer.startContinuousRecognitionAsync();

        startRecording();

        const cancelRecognition = () => {
            if (!complete && recognizerRef.current) {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    stopRecording();
                }
                recognizerRef.current.stopContinuousRecognitionAsync();
                recognizerRef.current = null; // Clear the ref
                setListening(false);
            }
        };

        setTimeout(cancelRecognition, 15000);

        recognizer.recognizeOnceAsync(result => {
            const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(result);
            recognizer.close();
            setResult(pronunciationResult);
            complete = true;
            stopRecording();
            setListening(false);
        }, error => {
            console.error(error);
            complete = false
            setResult("ERROR: Speech was cancelled. Ensure your microphone is working properly.");
            stopRecording();
            setListening(false);
        });
    };

    const startRecording = () => {
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
            navigator.mediaDevices.getUserMedia({audio: true})
                .then((stream) => {
                    mediaRecorderRef.current = new MediaRecorder(stream);

                    mediaRecorderRef.current.ondataavailable = (event) => {
                        if (event.data.size > 0) chunksRef.current.push(event.data);
                    };

                    mediaRecorderRef.current.onstop = () => {
                        const audioBlob = new Blob(chunksRef.current, {type: "audio/mpeg"});
                        audioElementRef.current.src = URL.createObjectURL(audioBlob);
                    };

                    mediaRecorderRef.current.start();
                })
                .catch(error => {
                    console.error('Error accessing the microphone:', error);
                    setResult('ERROR: Could not access the microphone. Make sure you have granted the necessary permissions.');
                });
        } else {
            console.error('getUserMedia is not supported in this browser.');
            setResult('ERROR: getUserMedia is not supported in this browser. Try using a different browser.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    };

    return (<Fragment>
        <button
            className={`question-btn button ${listening ? "listening" : ""}`}
            draggable={false}
            onClick={sttFromMic}
        >
            {listening ? <MicIcon sx={{font: "inherit"}}/> : <MicNoneIcon sx={{font: "inherit"}}/>}
        </button>
        <audio ref={audioElementRef} controls/>
    </Fragment>);
};


export default SpeakingInput;
