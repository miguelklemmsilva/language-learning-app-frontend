import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { voiceFor } from "../constants/languages";
import {
  canStoreSpeech,
  playbackType,
  readSentenceAudio,
  writeSentenceAudio,
  forgetSentenceAudio,
} from "./sentenceAudio";
import { PronunciationResult, PronunciationWord } from "../types/practice";

export { canStoreSpeech, forgetSentenceAudio as forgetSpeech };

type PreparedSpeech = {
  voice: string;
  contentType: string;
  fresh: boolean;
};

type SpeechSession = {
  recognizer: sdk.SpeechRecognizer;
  recorder: MediaRecorder | null;
  chunks: Blob[];
  stream: MediaStream;
  latest: PronunciationResult | null;
  recordingUrl: string | null;
};

let playing: HTMLAudioElement | null = null;
let session: SpeechSession | null = null;
let lastRecordingUrl: string | null = null;

class DiscardingPushStream extends sdk.PushAudioOutputStreamCallback {
  public write(_dataBuffer: ArrayBuffer): void {}

  public close(): void {}
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index] ?? 0);
  }
  return window.btoa(binary);
}

function base64ToBlob(voice: string, contentType: string) {
  const binary = window.atob(voice);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: contentType });
}

function playUrl(url: string) {
  stopPlayback();
  const audio = new Audio(url);
  playing = audio;
  return new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Could not play the audio."));
    void audio.play().catch(reject);
  });
}

export function stopPlayback() {
  if (!playing) return;
  playing.pause();
  playing.src = "";
  playing = null;
}

async function synthesize(text: string, country: string, token: string, host: string) {
  const { voice } = voiceFor(country);
  const speechConfig = sdk.SpeechConfig.fromEndpoint(new URL(`https://${host}`));
  speechConfig.authorizationToken = token;
  speechConfig.speechSynthesisVoiceName = voice;
  const audioConfig = sdk.AudioConfig.fromStreamOutput(new DiscardingPushStream());
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  const audio = await new Promise<ArrayBuffer>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      synthesizer.close();
      reject(new Error("Could not create the audio for this sentence."));
    }, 30000);
    synthesizer.speakTextAsync(
      text,
      (result) => {
        window.clearTimeout(timeout);
        synthesizer.close();
        if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted || !result.audioData) {
          reject(new Error("Could not create the audio for this sentence."));
          return;
        }
        resolve(result.audioData);
      },
      (error) => {
        window.clearTimeout(timeout);
        synthesizer.close();
        reject(error instanceof Error ? error : new Error("Could not create the audio for this sentence."));
      }
    );
  });

  return bytesToBase64(new Uint8Array(audio));
}

export async function prepareSpeech(
  text: string,
  country: string,
  token: string,
  host: string,
  cachedAudio?: string | null,
  contentType?: string | null
): Promise<PreparedSpeech> {
  if (cachedAudio) {
    const type = playbackType(cachedAudio, contentType);
    writeSentenceAudio(text, cachedAudio, type, country);
    return { voice: cachedAudio, contentType: type, fresh: false };
  }

  const stored = readSentenceAudio(text, country);
  if (stored) return { ...stored, fresh: false };

  const voice = await synthesize(text, country, token, host);
  const type = playbackType(voice);
  writeSentenceAudio(text, voice, type, country);
  return { voice, contentType: type, fresh: true };
}

export async function playSpeech(
  text: string,
  country: string,
  token: string,
  host: string,
  cachedAudio?: string | null,
  contentType?: string | null
) {
  const prepared = await prepareSpeech(text, country, token, host, cachedAudio, contentType);
  const blob = base64ToBlob(prepared.voice, prepared.contentType);
  const url = URL.createObjectURL(blob);
  try {
    await playUrl(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function wordsFrom(result: sdk.PronunciationAssessmentResult): PronunciationWord[] {
  const detail = result.detailResult as { Words?: Array<{
    Word?: string;
    PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
  }> } | undefined;
  const fallback = (result as unknown as {
    privPronJson?: { Words?: Array<{
      Word?: string;
      PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
    }> };
  }).privPronJson?.Words;
  const words = detail?.Words ?? fallback ?? [];
  return words.map((word) => ({
    text: word.Word ?? "",
    accuracy: Math.round(word.PronunciationAssessment?.AccuracyScore ?? 0),
    errorType: word.PronunciationAssessment?.ErrorType ?? "None",
  }));
}

function toResult(assessment: sdk.PronunciationAssessmentResult, displayText: string): PronunciationResult {
  return {
    accuracy: Math.round(assessment.accuracyScore),
    fluency: Math.round(assessment.fluencyScore),
    completeness: Math.round(assessment.completenessScore),
    pronScore: Math.round(assessment.pronunciationScore),
    displayText,
    words: wordsFrom(assessment),
  };
}

function stopTracks(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

function stopRecorder(current: SpeechSession) {
  const recorder = current.recorder;
  if (!recorder || recorder.state === "inactive") {
    stopTracks(current.stream);
    return Promise.resolve(current.recordingUrl);
  }

  return new Promise<string | null>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(current.chunks, { type: recorder.mimeType || "audio/webm" });
      const url = URL.createObjectURL(blob);
      current.recordingUrl = url;
      lastRecordingUrl = url;
      stopTracks(current.stream);
      resolve(url);
    };
    recorder.stop();
  });
}

export function isRecording() {
  return session !== null;
}

export async function stopRecording() {
  const current = session;
  if (!current) return;
  session = null;
  try {
    current.recognizer.close();
  } catch {
    // The recognizer is already closed.
  }
  await stopRecorder(current);
}

export async function beginPronunciation(
  original: string,
  country: string,
  token: string,
  host: string,
  onPartial: (text: string) => void
) {
  if (session) await stopRecording();
  if (lastRecordingUrl) {
    URL.revokeObjectURL(lastRecordingUrl);
    lastRecordingUrl = null;
  }
  stopPlayback();

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser cannot use the microphone.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const { locale } = voiceFor(country);
  const speechConfig = sdk.SpeechConfig.fromEndpoint(new URL(`https://${host}`));
  speechConfig.authorizationToken = token;
  speechConfig.speechRecognitionLanguage = locale;
  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  const assessment = new sdk.PronunciationAssessmentConfig(
    original,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true
  );
  assessment.applyTo(recognizer);

  const chunks: Blob[] = [];
  const recorder = typeof MediaRecorder === "undefined" ? null : new MediaRecorder(stream);
  if (recorder) {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.start();
  }

  const next: SpeechSession = {
    recognizer,
    recorder,
    chunks,
    stream,
    latest: null,
    recordingUrl: null,
  };
  session = next;

  recognizer.recognizing = (_sender, event) => {
    onPartial(event.result.text);
  };
  recognizer.recognized = (_sender, event) => {
    if (event.result.reason !== sdk.ResultReason.RecognizedSpeech) return;
    const pronunciation = sdk.PronunciationAssessmentResult.fromResult(event.result);
    next.latest = toResult(pronunciation, event.result.text);
    onPartial(event.result.text);
  };

  await recognizer.startContinuousRecognitionAsync();
}

export async function completePronunciation() {
  const current = session;
  if (!current) throw new Error("Not recording.");
  session = null;

  const result = await new Promise<PronunciationResult | null>((resolve) => {
    const finish = () => resolve(current.latest);
    const timer = window.setTimeout(finish, 1600);
    const previous = current.recognizer.recognized;
    current.recognizer.recognized = (sender, event) => {
      previous?.call(current.recognizer, sender, event);
      if (current.latest) {
        window.clearTimeout(timer);
        finish();
      }
    };
    current.recognizer.stopContinuousRecognitionAsync(
      () => {
        window.clearTimeout(timer);
        finish();
      },
      () => {
        window.clearTimeout(timer);
        finish();
      }
    );
  });

  try {
    current.recognizer.close();
  } catch {
    // The recognizer is already closed.
  }
  const recordingUrl = await stopRecorder(current);
  if (!result) {
    const error = new Error("Could not score that recording. Try speaking again.") as Error & {
      recordingUrl?: string | null;
    };
    error.recordingUrl = recordingUrl;
    throw error;
  }
  return { result, recordingUrl };
}

export function playRecording(url: string) {
  return playUrl(url);
}
