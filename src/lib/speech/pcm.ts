export const SAMPLE_RATE = 16000;

const SPEECH_LEVEL = 0.02;
const SILENCE_LEVEL = 0.01;
const SPEECH_START_MS = 250;
const TRAILING_SILENCE_MS = 1200;

export type Resampler = {
  ratio: number;
  position: number;
  pending: Float32Array;
};

export type SilenceWatch = {
  noise: number;
  speechMs: number;
  silenceMs: number;
};

export function createResampler(inputRate: number): Resampler {
  return { ratio: inputRate / SAMPLE_RATE, position: 0, pending: new Float32Array() };
}

export function createSilenceWatch(): SilenceWatch {
  return { noise: 0, speechMs: 0, silenceMs: 0 };
}

function clampSample(sample: number) {
  const clamped = Math.max(-1, Math.min(1, sample));
  return clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
}

export function resample(resampler: Resampler, input: Float32Array) {
  const pending = resampler.pending;
  const merged = new Float32Array(pending.length + input.length);
  merged.set(pending);
  merged.set(input, pending.length);

  const values: number[] = [];
  let position = resampler.position;
  while (position + 1 < merged.length) {
    const index = Math.floor(position);
    const fraction = position - index;
    const left = merged[index] ?? 0;
    const right = merged[index + 1] ?? left;
    values.push(left + (right - left) * fraction);
    position += resampler.ratio;
  }

  const consumed = Math.floor(position);
  resampler.pending = merged.subarray(consumed);
  resampler.position = position - consumed;

  const output = new Int16Array(values.length);
  for (let index = 0; index < values.length; index += 1) output[index] = clampSample(values[index] ?? 0);
  return output;
}

export function mergeSamples(chunks: Int16Array[]) {
  let length = 0;
  for (const chunk of chunks) length += chunk.length;
  const merged = new Int16Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

export function chunkLevel(samples: Int16Array) {
  if (samples.length === 0) return 0;
  let energy = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = (samples[index] ?? 0) / 32768;
    energy += sample * sample;
  }
  return Math.sqrt(energy / samples.length);
}

export function noteSilence(watch: SilenceWatch, level: number, durationMs: number) {
  if (level <= Math.max(SILENCE_LEVEL, watch.noise * 1.5)) {
    watch.noise = watch.noise === 0 ? level : watch.noise * 0.9 + level * 0.1;
  }
  const speechLevel = Math.max(SPEECH_LEVEL, watch.noise * 4);
  const silenceLevel = Math.max(SILENCE_LEVEL, watch.noise * 1.8);
  if (level >= speechLevel) {
    watch.speechMs += durationMs;
    watch.silenceMs = 0;
    return false;
  }
  if (watch.speechMs < SPEECH_START_MS || level >= silenceLevel) {
    watch.silenceMs = 0;
    return false;
  }
  watch.silenceMs += durationMs;
  return watch.silenceMs >= TRAILING_SILENCE_MS;
}

export function signalLevel(samples: Int16Array) {
  if (samples.length === 0) return 0;
  const step = Math.max(1, Math.floor(samples.length / 8000));
  let energy = 0;
  let count = 0;
  for (let index = 0; index < samples.length; index += step) {
    const sample = (samples[index] ?? 0) / 32768;
    energy += sample * sample;
    count += 1;
  }
  return Math.sqrt(energy / count);
}

export function writeWav(samples: Int16Array) {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const write = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, dataSize, true);
  new Int16Array(buffer, 44).set(samples);
  return new Uint8Array(buffer);
}

export function pcmBytes(samples: Int16Array) {
  return new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength);
}

export function wavBody(wav: Uint8Array) {
  const copy = new ArrayBuffer(wav.byteLength);
  new Uint8Array(copy).set(wav);
  return copy;
}
