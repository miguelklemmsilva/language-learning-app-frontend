import { assessmentLocale, openLiveCaptions, scorePronunciation, speechService, LiveCaptions } from "./azure";
import { playRecording, playSpeech, prepareSpeech, stopPlayback, suspendPlayback } from "./playback";
import {
  SAMPLE_RATE,
  chunkLevel,
  createResampler,
  createSilenceWatch,
  mergeSamples,
  noteSilence,
  pcmBytes,
  resample,
  signalLevel,
  wavBody,
  writeWav,
} from "./pcm";

export { canStoreSpeech, forgetSentenceAudio as forgetSpeech } from "../sentenceAudio";
export { playRecording, playSpeech, prepareSpeech, stopPlayback };

type SpeechSession = {
  stream: MediaStream;
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  capture: AudioWorkletNode;
  mute: GainNode;
  resampler: ReturnType<typeof createResampler>;
  samples: Int16Array[];
  captions: LiveCaptions | null;
  reference: string;
  locale: string;
  token: string;
  host: string;
};

let session: SpeechSession | null = null;
let lastRecordingUrl: string | null = null;

async function createCaptureNode(context: AudioContext) {
  await context.audioWorklet.addModule(`${import.meta.env.BASE_URL}pcm-capture-processor.js`);
  return new AudioWorkletNode(context, "pcm-capture");
}

async function detach(current: SpeechSession) {
  current.capture.port.onmessage = null;
  current.captions?.close();
  current.captions = null;
  try {
    current.source.disconnect();
    current.capture.disconnect();
    current.mute.disconnect();
  } catch {
    // The audio graph is already stopped.
  }
  current.stream.getTracks().forEach((track) => track.stop());
  await current.context.close();
}

function publishRecording(samples: Int16Array) {
  if (lastRecordingUrl) {
    URL.revokeObjectURL(lastRecordingUrl);
    lastRecordingUrl = null;
  }
  if (samples.length === 0) return { url: null, wav: null };
  const wav = writeWav(samples);
  const url = URL.createObjectURL(new Blob([wavBody(wav)], { type: "audio/wav" }));
  lastRecordingUrl = url;
  return { url, wav };
}

function withRecording(error: unknown, recordingUrl: string | null) {
  if (error instanceof Error) {
    (error as Error & { recordingUrl?: string | null }).recordingUrl = recordingUrl;
    return error;
  }
  const wrapped = new Error("Pronunciation scoring failed. Try speaking again.") as Error & {
    recordingUrl?: string | null;
  };
  wrapped.recordingUrl = recordingUrl;
  return wrapped;
}

function microphoneError(error: unknown): Error {
  if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
    return new Error("Allow microphone access to practice speaking.");
  }
  if (error instanceof Error && (error.message === "This browser cannot use the microphone." || error.message === "Speech is unavailable right now.")) {
    return error;
  }
  return new Error("This browser cannot use the microphone.");
}

export function isRecording() {
  return session !== null;
}

export async function stopRecording() {
  const current = session;
  if (!current) return;
  session = null;
  await detach(current);
}

export async function beginPronunciation(
  original: string,
  country: string,
  token: string,
  host: string,
  onPartial: (text: string) => void,
  onSilence?: () => void
) {
  let context: AudioContext;
  try {
    context = new AudioContext();
  } catch {
    throw new Error("This browser cannot use the microphone.");
  }
  const resumed = context.resume();
  let stream: MediaStream | null = null;
  let credentials: { host: string; token: string };
  try {
    if (session) await stopRecording();
    if (lastRecordingUrl) {
      URL.revokeObjectURL(lastRecordingUrl);
      lastRecordingUrl = null;
    }
    stopPlayback();
    await suspendPlayback();
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser cannot use the microphone.");
    credentials = speechService(host, token);
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    await resumed;
  } catch (error) {
    stream?.getTracks().forEach((track) => track.stop());
    await context.close();
    throw microphoneError(error);
  }

  if (!stream) throw new Error("This browser cannot use the microphone.");
  const source = context.createMediaStreamSource(stream);
  let capture: AudioWorkletNode;
  try {
    capture = await createCaptureNode(context);
  } catch {
    stream.getTracks().forEach((track) => track.stop());
    await context.close();
    throw new Error("This browser cannot use the microphone.");
  }
  const mute = context.createGain();
  mute.gain.value = 0;
  const next: SpeechSession = {
    stream,
    context,
    source,
    capture,
    mute,
    resampler: createResampler(context.sampleRate),
    samples: [],
    captions: null,
    reference: original,
    locale: assessmentLocale(country),
    token: credentials.token,
    host: credentials.host,
  };

  let pending = new Uint8Array();
  let silenceQueued = false;
  const silence = createSilenceWatch();
  const sendPcm = (pcm: Uint8Array) => {
    if (session !== next) return;
    if (next.captions) {
      next.captions.sendPcm(pcm);
      return;
    }
    const merged = new Uint8Array(pending.length + pcm.length);
    merged.set(pending);
    merged.set(pcm, pending.length);
    const cap = SAMPLE_RATE * 2 * 8;
    pending = merged.length > cap ? merged.subarray(merged.length - cap) : merged;
  };

  capture.port.onmessage = (event: MessageEvent<Float32Array>) => {
    if (session !== next) return;
    const pcm = resample(next.resampler, event.data);
    if (pcm.length === 0) return;
    next.samples.push(pcm);
    sendPcm(pcmBytes(pcm));
    if (silenceQueued || !onSilence) return;
    if (!noteSilence(silence, chunkLevel(pcm), (pcm.length / SAMPLE_RATE) * 1000)) return;
    silenceQueued = true;
    window.setTimeout(() => {
      if (session === next) onSilence();
    }, 0);
  };

  session = next;
  try {
    source.connect(capture);
    capture.connect(mute);
    mute.connect(context.destination);
  } catch {
    session = null;
    await detach(next);
    throw new Error("This browser cannot use the microphone.");
  }

  void openLiveCaptions(next.locale, next.token, (text) => {
    if (session === next) onPartial(text);
  })
    .then((captions) => {
      if (session !== next) {
        captions.close();
        return;
      }
      next.captions = captions;
      if (pending.length > 0) captions.sendPcm(pending);
      pending = new Uint8Array();
    })
    .catch(() => undefined);
}

export async function completePronunciation() {
  const current = session;
  if (!current) throw new Error("Not recording.");
  session = null;
  await detach(current);

  const samples = mergeSamples(current.samples);
  const recording = publishRecording(samples);
  try {
    if (samples.length < SAMPLE_RATE * 0.3) {
      throw new Error("That recording was too short. Speak the whole sentence, then tap stop.");
    }
    if (signalLevel(samples) < 0.005) {
      throw new Error("The microphone didn't pick up any sound. Move closer and try again.");
    }
    if (!recording.wav) throw new Error("Pronunciation scoring failed. Try speaking again.");
    const result = await scorePronunciation(current.host, current.locale, current.token, current.reference, recording.wav);
    return { result, recordingUrl: recording.url };
  } catch (error) {
    throw withRecording(error, recording.url);
  }
}
