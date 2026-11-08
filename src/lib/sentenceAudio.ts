const PREFIX = "sentence-audio:v1:";
const SERVER_AUDIO_BYTES = 320_000;

export type StoredSentenceAudio = {
  voice: string;
  contentType: string;
};

function storageKey(original: string, country?: string | null) {
  return `${PREFIX}${country ?? ""}:${original}`;
}

export function playbackType(voice: string, contentType?: string | null) {
  if (contentType?.toLowerCase().includes("wav") || voice.startsWith("UklGR")) return "audio/wav";
  return contentType || "audio/mpeg";
}

export function canStoreSpeech(voice: string) {
  return Math.floor((voice.length * 3) / 4) <= SERVER_AUDIO_BYTES;
}

export function readSentenceAudio(original: string, country?: string | null): StoredSentenceAudio | null {
  try {
    const raw = localStorage.getItem(storageKey(original, country));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSentenceAudio;
    if (typeof parsed.voice !== "string" || parsed.voice.length === 0) return null;
    return {
      voice: parsed.voice,
      contentType: playbackType(parsed.voice, parsed.contentType),
    };
  } catch {
    return null;
  }
}

export function writeSentenceAudio(
  original: string,
  voice: string,
  contentType: string,
  country?: string | null
) {
  try {
    localStorage.setItem(
      storageKey(original, country),
      JSON.stringify({ voice, contentType: playbackType(voice, contentType) })
    );
  } catch {
    // Storage can reject the write when it is full. This session still has the audio.
  }
}

export function forgetSentenceAudio(original: string, country?: string | null) {
  try {
    localStorage.removeItem(storageKey(original, country));
  } catch {
    // The recording is already gone.
  }
}

export function forgetMasteredSentenceAudio(
  sentences: { word: string; original: string; mistakes: number; country?: string | null }[]
) {
  const byWord = new Map<string, typeof sentences>();
  for (const sentence of sentences) {
    const group = byWord.get(sentence.word) ?? [];
    group.push(sentence);
    byWord.set(sentence.word, group);
  }
  for (const group of byWord.values()) {
    if (!group.every((item) => item.mistakes === 0)) continue;
    const sample = group[0];
    if (sample) forgetSentenceAudio(sample.original, sample.country);
  }
}
