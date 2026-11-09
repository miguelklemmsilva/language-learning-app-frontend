import { voiceFor } from "../../constants/languages";
import { PronunciationResult, PronunciationWord } from "../../types/practice";
import { SAMPLE_RATE, wavBody } from "./pcm";

const SPEECH_REGION = "uksouth";

const pronunciationLocales: Record<string, string> = {
  Spain: "es-ES",
  Mexico: "es-MX",
  // Pronunciation assessment has no es-AR model. The phone scores Argentina with es-MX.
  Argentina: "es-MX",
  Brazil: "pt-BR",
  Portugal: "pt-PT",
  Japan: "ja-JP",
  Germany: "de-DE",
  Italy: "it-IT",
  France: "fr-FR",
  Canada: "fr-CA",
};

export type LiveCaptions = {
  sendPcm: (pcm: Uint8Array) => void;
  close: () => void;
};

export function assessmentLocale(country: string) {
  return pronunciationLocales[country] ?? voiceFor(country).locale;
}

export function speechService(host: string, token: string) {
  const serviceHost = host.trim().replace(/\/+$/, "").replace(/^https?:\/\//, "");
  const serviceToken = token.trim();
  if (!serviceHost || !serviceToken) throw new Error("Speech is unavailable right now.");
  return { host: serviceHost, token: serviceToken };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index] ?? 0);
  }
  return window.btoa(binary);
}

function requestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (symbol) => {
    const random = Math.floor(Math.random() * 16);
    const value = symbol === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function textMessage(headers: Record<string, string>, body: string) {
  const prefix = Object.entries(headers)
    .map(([name, value]) => `${name}: ${value}\r\n`)
    .join("");
  return `${prefix}\r\n${body}`;
}

function binaryMessage(headers: Record<string, string>, body?: Uint8Array) {
  const headerText = Object.entries(headers)
    .map(([name, value]) => `${name}: ${value}\r\n`)
    .join("");
  const headerBytes = new TextEncoder().encode(headerText);
  const payload = new Uint8Array(2 + headerBytes.length + (body?.length ?? 0));
  payload[0] = (headerBytes.length >> 8) & 0xff;
  payload[1] = headerBytes.length & 0xff;
  payload.set(headerBytes, 2);
  if (body) payload.set(body, 2 + headerBytes.length);
  return payload;
}

function messageHeaders(path: string, id: string, contentType?: string) {
  const headers: Record<string, string> = {
    Path: path,
    "X-RequestId": id,
    "X-Timestamp": new Date().toISOString(),
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

function parseMessage(value: string) {
  const splitAt = value.indexOf("\r\n\r\n");
  const headerText = splitAt >= 0 ? value.slice(0, splitAt) : value;
  const body = splitAt >= 0 ? value.slice(splitAt + 4) : "";
  const pathLine = headerText.split("\r\n").find((line) => line.toLowerCase().startsWith("path:"));
  const path = pathLine ? pathLine.slice(pathLine.indexOf(":") + 1).trim().toLowerCase() : "";
  return { path, body };
}

function streamWavHeader() {
  const header = new Uint8Array(44);
  const view = new DataView(header.buffer);
  const write = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  };
  write(0, "RIFF");
  write(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  return header;
}

function partialText(body: string) {
  try {
    const json = JSON.parse(body) as {
      Text?: string;
      DisplayText?: string;
      NBest?: Array<{ Display?: string }>;
    };
    return json.Text || json.DisplayText || json.NBest?.[0]?.Display || "";
  } catch {
    return "";
  }
}

function captionUrl(locale: string, token: string, id: string) {
  const query = [
    `language=${encodeURIComponent(locale)}`,
    "format=detailed",
    `Authorization=${encodeURIComponent(`Bearer ${token}`)}`,
    `X-ConnectionId=${encodeURIComponent(id)}`,
  ].join("&");
  // The custom domain redirects this socket and drops the sign-in. The regional host accepts it.
  return `wss://${SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?${query}`;
}

export function openLiveCaptions(locale: string, token: string, onPartial: (text: string) => void): Promise<LiveCaptions> {
  const id = requestId();
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(captionUrl(locale, token, id));
    socket.binaryType = "arraybuffer";
    let opened = false;
    let settled = false;
    let committed = "";
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      socket.close();
      reject(new Error("Could not transcribe while recording."));
    }, 8000);

    function sendAudio(pcm?: Uint8Array) {
      try {
        socket.send(binaryMessage(messageHeaders("audio", id), pcm));
      } catch {
        opened = false;
      }
    }

    socket.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      socket.close();
      reject(new Error("Could not transcribe while recording."));
    };
    socket.onclose = () => {
      opened = false;
    };
    socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const message = parseMessage(event.data);
      const text = partialText(message.body);
      if (!text) return;
      if (message.path === "speech.phrase") {
        committed = committed ? `${committed} ${text}` : text;
        onPartial(committed);
        return;
      }
      if (message.path === "speech.hypothesis") onPartial(committed ? `${committed} ${text}` : text);
    };
    socket.onopen = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      socket.send(
        textMessage(
          messageHeaders("speech.config", id, "application/json"),
          JSON.stringify({ context: { system: { version: "1.0.0" } } })
        )
      );
      socket.send(binaryMessage(messageHeaders("audio", id, "audio/x-wav"), streamWavHeader()));
      opened = true;
      resolve({
        sendPcm: (pcm) => {
          if (!opened || pcm.length === 0) return;
          const chunkSize = 8192;
          for (let offset = 0; offset < pcm.length; offset += chunkSize) {
            sendAudio(pcm.subarray(offset, offset + chunkSize));
          }
        },
        close: () => {
          opened = false;
          socket.close();
        },
      });
    };
  });
}

type AzureScores = {
  AccuracyScore?: number;
  FluencyScore?: number;
  CompletenessScore?: number;
  PronScore?: number;
};

type AzureWord = {
  Word?: string;
  AccuracyScore?: number;
  ErrorType?: string;
  PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
};

type AzureResponse = {
  RecognitionStatus?: string;
  DisplayText?: string;
  NBest?: Array<
    AzureScores & {
      Display?: string;
      PronunciationAssessment?: AzureScores;
      Words?: AzureWord[];
    }
  >;
};

function assessmentHeader(reference: string) {
  const json = JSON.stringify({
    ReferenceText: reference,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive",
    EnableMiscue: true,
  });
  return bytesToBase64(new TextEncoder().encode(json));
}

function parseAssessment(phrase: string): PronunciationResult {
  let body: AzureResponse;
  try {
    body = JSON.parse(phrase) as AzureResponse;
  } catch {
    throw new Error("Pronunciation scoring failed. Try speaking again.");
  }
  const best = body.NBest?.[0];
  const scores =
    best?.PronunciationAssessment ??
    (best?.PronScore !== undefined || best?.AccuracyScore !== undefined ? best : undefined);
  if (body.RecognitionStatus !== "Success" || !best) {
    throw new Error("Could not hear a full sentence. Try again a little louder.");
  }
  if (!scores) throw new Error("Pronunciation scoring failed. Try speaking again.");

  const words: PronunciationWord[] = (best.Words ?? []).map((word) => ({
    text: word.Word ?? "",
    accuracy: Math.round(word.PronunciationAssessment?.AccuracyScore ?? word.AccuracyScore ?? 0),
    errorType: word.PronunciationAssessment?.ErrorType ?? word.ErrorType ?? "None",
  }));
  return {
    accuracy: Math.round(scores.AccuracyScore ?? 0),
    fluency: Math.round(scores.FluencyScore ?? 0),
    completeness: Math.round(scores.CompletenessScore ?? 0),
    pronScore: Math.round(scores.PronScore ?? 0),
    displayText: best.Display || body.DisplayText || "",
    words,
  };
}

export async function scorePronunciation(
  host: string,
  locale: string,
  token: string,
  reference: string,
  wav: Uint8Array
) {
  const url = `https://${host}/stt/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(locale)}&format=detailed`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        Accept: "application/json",
        "Pronunciation-Assessment": assessmentHeader(reference),
      },
      body: wavBody(wav),
    });
  } catch {
    throw new Error("Pronunciation scoring failed. Try speaking again.");
  }
  if (!response.ok) throw new Error("Pronunciation scoring failed. Try speaking again.");
  return parseAssessment(await response.text());
}
