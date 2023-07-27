import React, {Fragment, useRef} from 'react';
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import {getTokenOrRefresh} from "./token_util";

const Pronunciation = ({sentence, setResult, listening, setListening}) => {
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const audioElementRef = useRef(null);

    const sttFromMic = async () => {
        if (listening)
            return;

        setListening(true);

        let complete = false;

        const tokenObj = await getTokenOrRefresh();
        const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "3000");
        speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "3000");

        const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

        const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
            sentence.original,
            sdk.PronunciationAssessmentGradingSystem.HundredMark,
            sdk.PronunciationAssessmentGranularity.Phoneme,
            true
        )

        speechConfig.speechRecognitionLanguage = 'es-MX';

        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        pronunciationAssessmentConfig.applyTo(recognizer);

        recognizer.recognizing = function (s, e) {
            setResult(e.result);
        };

        recognizer.recognized = function (s, e) {
            recognizer.stopContinuousRecognitionAsync();
        };

        recognizer.startContinuousRecognitionAsync();

        startRecording();

        const cancelRecognition = () => {
            if (!complete) {
                recognizer.stopContinuousRecognitionAsync();
                recognizer.close();
                setResult("ERROR: Speech recognition timed out. Ensure your microphone is working properly.");
            }
        };

        setTimeout(cancelRecognition, 20000);

        recognizer.recognizeOnceAsync(result => {
            const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(result);
            recognizer.close();
            setResult(pronunciationResult);
            complete = true;
            stopRecording();
        }, error => {
            console.error(error);
            setResult("ERROR: Speech was cancelled. Ensure your microphone is working properly.");
            stopRecording();
        });
    };

    const startRecording = () => {
        const streamPromise = navigator.mediaDevices.getUserMedia({audio: true});

        streamPromise.then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0)
                    chunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, {type: "audio/wav"});
                // You can save the audioBlob or send it to the server for further processing.
                audioElementRef.current.src = URL.createObjectURL(audioBlob);
            };

            mediaRecorderRef.current.start();
        });
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    };

    return (
        <Fragment>
            <button
                className={`question-btn ${listening ? "disabled" : ""}`}
                draggable={false}
                onClick={sttFromMic}
            >
                <img
                    className="question-btn-img"
                    src={"./MicrophoneButton.png"}
                    alt="speaking-button"
                />
            </button>
            <audio ref={audioElementRef} controls/>
        </Fragment>
    );
};


export default Pronunciation;
