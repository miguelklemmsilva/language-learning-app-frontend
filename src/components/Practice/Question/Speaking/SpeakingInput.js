import React, { Fragment, useEffect, useRef, useState } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { getTokenOrRefresh } from "./token_util";
import MicIcon from "@mui/icons-material/Mic";
import MicNoneIcon from "@mui/icons-material/MicNone";
import CircularProgress from "@mui/material/CircularProgress";

const pronunciationAssessmentLocaleCodes = {
  Spain: "es-ES",
  Mexico: "es-MX",
  Argentina: "es-MX",
  Brazil: "pt-BR",
  Portugal: "pt-PT",
  Japan: "ja-JP",
  Germany: "de-DE",
  Italy: "it-IT",
  France: "fr-FR",
  Canada: "fr-CA",
};

const SpeakingInput = ({
  sentence,
  setResult,
  listening,
  setListening,
  chunksRef,
  audioElementRef,
  setScores,
}) => {
  const mediaRecorderRef = useRef(null);
  const recognizerRef = useRef(null);
  const [speechConfig, setSpeechConfig] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initializeSpeechConfig = async () => {
      const tokenObj = await getTokenOrRefresh();
      const config = sdk.SpeechConfig.fromAuthorizationToken(
        tokenObj.authToken,
        tokenObj.region
      );
      config.setProperty(
        sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
        "3000"
      );
      config.setProperty(
        sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs,
        "3000"
      );
      setSpeechConfig(config);
    };

    initializeSpeechConfig();
  }, [sentence]);

  useEffect(() => {
    if (speechConfig && sentence) {
      const localeCode = pronunciationAssessmentLocaleCodes[sentence.country];
      if (localeCode) {
        speechConfig.speechRecognitionLanguage = localeCode;
      }
    }
  }, [sentence, speechConfig]);

  const sttFromMic = async () => {
    if (!speechConfig) {
      console.error("Speech config not initialized");
      setResult("ERROR: Speech config not initialized.");
      return;
    }

    if (listening) {
      stopRecognition();
      return;
    }

    setIsInitializing(true);

    try {
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const pronunciationAssessmentConfig =
        new sdk.PronunciationAssessmentConfig(
          sentence?.original || "",
          sdk.PronunciationAssessmentGradingSystem.HundredMark,
          sdk.PronunciationAssessmentGranularity.Phoneme,
          true
        );

      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationAssessmentConfig.applyTo(recognizer);
      recognizerRef.current = recognizer;

      // Reset audio and results
      audioElementRef.current.src = "";
      chunksRef.current = [];
      setResult(null);
      setScores(null);

      recognizer.recognizing = (s, e) => setResult(e.result);
      recognizer.recognized = (s, e) => {
        recognizer.stopContinuousRecognitionAsync();
        stopRecognition();
      };

      // Start recording first
      await startRecording();

      // Then start the recognizer
      await recognizer.startContinuousRecognitionAsync();

      // Only now set listening to true
      setListening(true);
      setIsInitializing(false);

      // Set up timeout to cancel recognition after 15 seconds
      const timeoutId = setTimeout(() => stopRecognition(), 15000);

      recognizer.recognizeOnceAsync(
        (result) => {
          clearTimeout(timeoutId);
          if (result) {
            const pronunciationResult =
              sdk.PronunciationAssessmentResult.fromResult(result);
            setResult(pronunciationResult);
          } else {
            setResult("ERROR: No result from speech recognizer.");
          }
          stopRecognition();
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error(error);
          setResult(
            "ERROR: Speech was cancelled. Ensure your microphone is working properly."
          );
          stopRecognition();
        }
      );
    } catch (error) {
      console.error("Error starting recognition:", error);
      setResult("ERROR: Failed to start speech recognition.");
      setIsInitializing(false);
      setListening(false);
    }
  };

  const startRecording = async () => {
    return new Promise((resolve, reject) => {
      if (
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
      ) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
              if (event.data.size > 0) chunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
              const audioBlob = new Blob(chunksRef.current, {
                type: "audio/mpeg",
              });
              audioElementRef.current.src = URL.createObjectURL(audioBlob);
            };

            mediaRecorderRef.current.start();
            resolve();
          })
          .catch((error) => {
            console.error("Error accessing the microphone:", error);
            setResult(
              "ERROR: Could not access the microphone. Make sure you have granted the necessary permissions."
            );
            reject(error);
          });
      } else {
        console.error("getUserMedia is not supported in this browser.");
        setResult(
          "ERROR: getUserMedia is not supported in this browser. Try using a different browser."
        );
        reject(new Error("getUserMedia not supported"));
      }
    });
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const stopRecognition = () => {
    stopRecording();
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync();
      recognizerRef.current = null;
    }
    setListening(false);
    setIsInitializing(false);
  };

  return (
    <Fragment>
      <button
        className={`question-btn button ${listening ? "listening" : ""}`}
        draggable={false}
        onClick={sttFromMic}
        disabled={isInitializing}
      >
        {isInitializing ? (
          <CircularProgress size={24} />
        ) : listening ? (
          <MicIcon sx={{ font: "inherit" }} />
        ) : (
          <MicNoneIcon sx={{ font: "inherit" }} />
        )}
      </button>
      <audio ref={audioElementRef} controls />
    </Fragment>
  );
};

export default SpeakingInput;
