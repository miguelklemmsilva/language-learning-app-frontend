import { voiceFor } from "../../constants/languages";
import { playbackType, readSentenceAudio, writeSentenceAudio } from "../sentenceAudio";
import { speechService } from "./azure";

type PreparedSpeech = {
  voice: string;
  contentType: string;
  fresh: boolean;
};

let output: AudioContext | null = null;
let outputSource: AudioBufferSourceNode | null = null;
let finishPlayback: (() => void) | null = null;
let playGeneration = 0;

function outputContext() {
  if (!output || output.state === "closed") output = new AudioContext();
  return output;
}

async function bytesToBase64(bytes: Uint8Array) {
  const parts: string[] = [];
  const chunkSize = 8192;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const end = Math.min(index + chunkSize, bytes.length);
    let piece = "";
    for (let cursor = index; cursor < end; cursor += 1) {
      piece += String.fromCharCode(bytes[cursor] ?? 0);
    }
    parts.push(piece);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
  return window.btoa(parts.join(""));
}

function base64ToBlob(voice: string, contentType: string) {
  const binary = window.atob(voice);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: contentType });
}

async function playArrayBuffer(bytes: ArrayBuffer) {
  stopPlayback();
  const generation = playGeneration;
  const context = outputContext();
  if (context.state === "suspended") await context.resume();
  if (generation !== playGeneration) return;
  let buffer: AudioBuffer;
  try {
    buffer = await context.decodeAudioData(bytes.slice(0));
  } catch {
    throw new Error("Could not play the audio.");
  }
  if (generation !== playGeneration) return;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  outputSource = source;
  await new Promise<void>((resolve) => {
    finishPlayback = resolve;
    source.onended = () => {
      if (finishPlayback === resolve) finishPlayback = null;
      if (outputSource === source) outputSource = null;
      resolve();
    };
    source.start();
  });
}

export function stopPlayback() {
  playGeneration += 1;
  const finish = finishPlayback;
  finishPlayback = null;
  const source = outputSource;
  outputSource = null;
  if (source) {
    source.onended = null;
    try {
      source.stop();
    } catch {
      // The clip has already stopped.
    }
    source.disconnect();
  }
  finish?.();
}

export async function suspendPlayback() {
  if (output && output.state === "running") await output.suspend();
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function synthesize(text: string, country: string, token: string, host: string) {
  const { locale, voice } = voiceFor(country);
  const { host: serviceHost, token: serviceToken } = speechService(host, token);
  const ssml = `<speak version="1.0" xml:lang="${locale}"><voice name="${voice}">${escapeXml(text)}</voice></speak>`;
  let response: Response;
  try {
    response = await fetch(`https://${serviceHost}/tts/cognitiveservices/v1`, {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: {
        Authorization: `Bearer ${serviceToken}`,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "language-learning-app",
      },
      body: ssml,
    });
  } catch {
    throw new Error("Could not create the audio for this sentence.");
  }
  if (!response.ok) throw new Error("Could not create the audio for this sentence.");
  return bytesToBase64(new Uint8Array(await response.arrayBuffer()));
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
  const type = playbackType(voice, "audio/mpeg");
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
  await playArrayBuffer(await blob.arrayBuffer());
}

export async function playRecording(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not play the audio.");
  await playArrayBuffer(await response.arrayBuffer());
}
