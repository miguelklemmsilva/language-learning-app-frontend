import {
  Dispatch,
  Fragment,
  MutableRefObject,
  ReactNode,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { getTokenOrRefresh } from "./token_util";
import MicIcon from "@mui/icons-material/Mic";
import MicNoneIcon from "@mui/icons-material/MicNone";
import CircularProgress from "@mui/material/CircularProgress";
import { PracticeSentence, QuestionResult } from "../../../../types/practice";

const pronunciationAssessmentLocaleCodes: Record<string, string> = {
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

interface SpeakingInputProps {
  sentence: PracticeSentence;
  setResult: Dispatch<SetStateAction<QuestionResult>>;
  listening: boolean;
  setListening: Dispatch<SetStateAction<boolean>>;
  chunksRef: MutableRefObject<Blob[]>;
  audioElementRef: RefObject<HTMLAudioElement>;
  setScores: Dispatch<SetStateAction<ReactNode>>;
}

const SpeakingInput = ({
  sentence,
  setResult,
  listening,
  setListening,
  chunksRef,
  audioElementRef,
  setScores,
}: SpeakingInputProps) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);
  const [speechConfig, setSpeechConfig] = useState<sdk.SpeechConfig | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initializeSpeechConfig = async () => {
      const tokenObj = await getTokenOrRefresh();
      if (!tokenObj.authToken || !tokenObj.host) return;
      const config = sdk.SpeechConfig.fromEndpoint(new URL(`https://${tokenObj.host}`));
      config.authorizationToken = tokenObj.authToken;
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
      const localeCode = sentence.country
        ? pronunciationAssessmentLocaleCodes[sentence.country]
        : undefined;
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
      const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
        sentence?.original || "",
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        true
      );

      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationAssessmentConfig.applyTo(recognizer);
      recognizerRef.current = recognizer;

      if (audioElementRef.current) audioElementRef.current.src = "";
      chunksRef.current = [];
      setResult(null);
      setScores(null);

      recognizer.recognizing = (_sender, event) => setResult(event.result);
      recognizer.recognized = () => {
        recognizer.stopContinuousRecognitionAsync();
        stopRecognition();
      };

      await startRecording();

      await recognizer.startContinuousRecognitionAsync();

      setListening(true);
      setIsInitializing(false);

      const timeoutId = setTimeout(() => stopRecognition(), 15000);

      recognizer.recognizeOnceAsync(
        (recognitionResult) => {
          clearTimeout(timeoutId);
          if (recognitionResult) {
            const pronunciationResult =
              sdk.PronunciationAssessmentResult.fromResult(recognitionResult);
            setResult(pronunciationResult);
          } else {
            setResult("ERROR: No result from speech recognizer.");
          }
          stopRecognition();
        },
        (recognitionError) => {
          clearTimeout(timeoutId);
          console.error(recognitionError);
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
    return new Promise<void>((resolve, reject) => {
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
              if (audioElementRef.current) {
                audioElementRef.current.src = URL.createObjectURL(audioBlob);
              }
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
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
