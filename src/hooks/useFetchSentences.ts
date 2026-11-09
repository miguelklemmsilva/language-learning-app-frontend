import { useEffect, useState } from "react";
import { get } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import Cookie from "universal-cookie";
import { saveSentenceAudio } from "../api/practiceService";
import { readJson } from "../api/readJson";
import {
  canStoreSpeech,
  playbackType,
  readSentenceAudio,
  writeSentenceAudio,
} from "../lib/sentenceAudio";
import { getSelectedLanguageSettings } from "../constants/languages";
import { useLanguageStore } from "../stores/languageStore";
import { useUserStore } from "../stores/userStore";
import { Sentence, SentencesResponse } from "../types/api";
import {
  ExerciseType,
  FetchSentencesError,
  PracticeSentence,
} from "../types/practice";

const countryVoices: Record<string, string[]> = {
  Spain: [
    "es-ES-ElviraNeural",
    "es-ES-AlvaroNeural",
    "es-ES-AbrilNeural",
    "es-ES-ArnauNeural",
    "es-ES-DarioNeural",
    "es-ES-EliasNeural",
    "es-ES-EstrellaNeural",
    "es-ES-IreneNeural",
    "es-ES-LaiaNeural",
    "es-ES-LiaNeural",
    "es-ES-NilNeural",
    "es-ES-SaulNeural",
    "es-ES-TeoNeural",
    "es-ES-TrianaNeural",
    "es-ES-VeraNeural",
  ],
  Mexico: [
    "es-MX-DaliaNeural",
    "es-MX-JorgeNeural",
    "es-MX-BeatrizNeural",
    "es-MX-CandelaNeural",
    "es-MX-CarlotaNeural",
    "es-MX-CecilioNeural",
    "es-MX-GerardoNeural",
    "es-MX-LarissaNeural",
    "es-MX-LibertoNeural",
    "es-MX-LucianoNeural",
    "es-MX-MarinaNeural",
    "es-MX-NuriaNeural",
    "es-MX-PelayoNeural",
    "es-MX-RenataNeural",
    "es-MX-YagoNeural",
  ],
  Argentina: ["es-AR-ElenaNeural", "es-AR-TomasNeural"],
  Brazil: [
    "pt-BR-FranciscaNeural",
    "pt-BR-AntonioNeural",
    "pt-BR-BrendaNeural",
    "pt-BR-DonatoNeural",
    "pt-BR-ElzaNeural",
    "pt-BR-FabioNeural",
    "pt-BR-GiovannaNeural",
    "pt-BR-HumbertoNeural",
    "pt-BR-JulioNeural",
    "pt-BR-LeilaNeural",
    "pt-BR-LeticiaNeural",
    "pt-BR-ManuelaNeural",
    "pt-BR-NicolauNeural",
    "pt-BR-ValerioNeural",
    "pt-BR-YaraNeural",
  ],
  Portugal: ["pt-PT-RaquelNeural", "pt-PT-DuarteNeural", "pt-PT-FernandaNeural"],
  Japan: [
    "ja-JP-NanamiNeural",
    "ja-JP-KeitaNeural",
    "ja-JP-AoiNeural",
    "ja-JP-DaichiNeural",
    "ja-JP-MayuNeural",
    "ja-JP-NaokiNeural",
    "ja-JP-ShioriNeural",
  ],
  Germany: [
    "de-DE-KatjaNeural",
    "de-DE-ConradNeural",
    "de-DE-AmalaNeural",
    "de-DE-BerndNeural",
    "de-DE-ChristophNeural",
    "de-DE-ElkeNeural",
    "de-DE-GiselaNeural",
    "de-DE-KasperNeural",
    "de-DE-KillianNeural",
    "de-DE-ConradNeural",
    "de-DE-KlarissaNeural",
    "de-DE-KlausNeural",
    "de-DE-LouisaNeural",
    "de-DE-MajaNeural",
    "de-DE-RalfNeural",
    "de-DE-TanjaNeural",
  ],
  Italy: [
    "it-IT-ElsaNeural",
    "it-IT-IsabellaNeural",
    "it-IT-DiegoNeural",
    "it-IT-BenignoNeural",
    "it-IT-CalimeroNeural",
    "it-IT-CataldoNeural",
    "it-IT-FabiolaNeural",
    "it-IT-FiammaNeural",
    "it-IT-GianniNeural",
    "it-IT-ImeldaNeural",
    "it-IT-IrmaNeural",
    "it-IT-LisandroNeural",
    "it-IT-PalmiraNeural",
    "it-IT-PierinaNeural",
    "it-IT-RinaldoNeural",
  ],
  France: [
    "fr-FR-DeniseNeural",
    "fr-FR-HenriNeural",
    "fr-FR-AlainNeural",
    "fr-FR-BrigitteNeural",
    "fr-FR-CelesteNeural",
    "fr-FR-ClaudeNeural",
    "fr-FR-CoralieNeural",
    "fr-FR-EloiseNeural",
    "fr-FR-JacquelineNeural",
    "fr-FR-JeromeNeural",
    "fr-FR-JosephineNeural",
    "fr-FR-MauriceNeural",
    "fr-FR-YvesNeural",
    "fr-FR-YvetteNeural",
  ],
  Canada: ["fr-CA-SylvieNeural", "fr-CA-JeanNeural", "fr-CA-AntoineNeural"],
};

class DiscardingPushStream extends sdk.PushAudioOutputStreamCallback {
  public write(_dataBuffer: ArrayBuffer): void {}

  public close(): void {}
}

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    const byte = bytes[i];
    if (byte === undefined) continue;
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary);
};

async function synthesizeText(text: string, voiceName: string, token: string, host: string) {
  console.log(`Synthesizing text: "${text}" with voice: ${voiceName}`);
  const speechConfig = sdk.SpeechConfig.fromEndpoint(new URL(`https://${host}`));
  speechConfig.authorizationToken = token;
  speechConfig.speechSynthesisVoiceName = voiceName;

  const audioConfig = sdk.AudioConfig.fromStreamOutput(new DiscardingPushStream());

  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Speech synthesis timed out"));
    }, 30000);

    speechSynthesizer.speakTextAsync(
      text,
      (result) => {
        clearTimeout(timeout);
        speechSynthesizer.close();
        console.log(`Synthesis completed for: "${text}"`);
        resolve(result.audioData);
      },
      (synthesisError) => {
        clearTimeout(timeout);
        console.error(`Synthesis error for: "${text}"`, synthesisError);
        speechSynthesizer.close();
        reject(synthesisError);
      }
    );
  });
}

const synthesizeSentenceVoice = async (
  completion: string,
  country: string,
  token: string,
  host: string
) => {
  const voicesArray = countryVoices[country];
  if (!voicesArray || voicesArray.length === 0) {
    throw new Error(`No voices available for country: ${country}`);
  }
  const voiceName = voicesArray[Math.floor(Math.random() * voicesArray.length)];
  if (!voiceName) {
    throw new Error(`No voices available for country: ${country}`);
  }
  const voiceData = await synthesizeText(completion, voiceName, token, host);
  return arrayBufferToBase64(voiceData);
};

function toPracticeSentence(
  sentence: Sentence,
  type: ExerciseType,
  voice: string | null,
  contentType?: string,
  error?: string
): PracticeSentence {
  return {
    original: sentence.original,
    word: sentence.word,
    translation: sentence.translation,
    language: sentence.language,
    alignment: sentence.alignment,
    country: sentence.country,
    mistakes: sentence.mistakes ?? 0,
    type,
    voice,
    voiceContentType: contentType,
    error,
  };
}

function toFetchError(error: unknown): FetchSentencesError {
  if (typeof error === "object" && error !== null) {
    const record = error as { code?: unknown; message?: unknown };
    return {
      code: typeof record.code === "number" ? record.code : undefined,
      message: typeof record.message === "string" ? record.message : undefined,
    };
  }
  return { message: "Unknown error" };
}

const useFetchSentences = (): [
  PracticeSentence[] | undefined,
  (sentences: PracticeSentence[]) => void,
  FetchSentencesError | null
] => {
  const [sentences, setSentences] = useState<PracticeSentence[]>();
  const [error, setError] = useState<FetchSentencesError | null>(null);

  useEffect(() => {
    async function getSentences() {
      console.log("Starting getSentences function");
      const cookie = new Cookie();

      try {
        const authToken =
          (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

        const response = await get({
          apiName: "LanguageLearningApp",
          path: "/generatesentences",
          options: { headers: { Authorization: authToken } },
        }).response;

        const json = await readJson<SentencesResponse>(response);
        console.log(`Fetched ${json.sentences?.length ?? 0} sentences`);

        const { sentences: fetchedSentences, issueToken, speechHost } = json;

        cookie.set("speech-token", `${speechHost}:${issueToken}`, {
          maxAge: 540,
          path: "/",
        });

        if (!fetchedSentences || fetchedSentences.length === 0) {
          throw new Error("No sentences received from the API");
        }

        if (!issueToken || !speechHost) {
          throw new Error("No speech token received from the API");
        }

        console.log(`Processing ${fetchedSentences.length} sentences`);

        const sentencesWithVoice = await Promise.all(
          fetchedSentences.map(async (sentence, index) => {
            const stored = sentence.voice
              ? null
              : readSentenceAudio(sentence.original, sentence.country);
            const readyVoice = sentence.voice ?? stored?.voice ?? null;
            if (readyVoice) {
              const contentType = playbackType(
                readyVoice,
                sentence.voiceContentType ?? stored?.contentType
              );
              return {
                sentence,
                voice: readyVoice,
                contentType,
                upload: !sentence.voice && canStoreSpeech(readyVoice),
                error: undefined,
              };
            }

            try {
              console.log(
                `Processing sentence ${index + 1}/${fetchedSentences.length}`
              );
              const voiceData = await synthesizeSentenceVoice(
                sentence.original,
                sentence.country ?? "",
                issueToken,
                speechHost
              );
              const contentType = playbackType(voiceData);
              writeSentenceAudio(sentence.original, voiceData, contentType, sentence.country);
              console.log(`Sentence ${index + 1} processed successfully`);
              return {
                sentence,
                voice: voiceData,
                contentType,
                upload: canStoreSpeech(voiceData),
                error: undefined,
              };
            } catch (sentenceError) {
              console.error(`Error processing sentence ${index + 1}:`, sentenceError);
              return {
                sentence,
                voice: null,
                contentType: undefined,
                upload: false,
                error:
                  sentenceError instanceof Error
                    ? sentenceError.message
                    : "Synthesis failed",
              };
            }
          })
        );

        const toStore = sentencesWithVoice.flatMap((item) => {
          if (!item.upload || !item.voice) return [];
          return [
            {
              word: item.sentence.word,
              language: item.sentence.language,
              voice: item.voice,
              contentType: item.contentType,
            },
          ];
        });
        if (toStore.length > 0) {
          void saveSentenceAudio(toStore).catch((uploadError) => {
            console.error("Could not store sentence audio:", uploadError);
          });
        }

        const languageSettings = getSelectedLanguageSettings(
          useLanguageStore.getState().selectedLanguages,
          useUserStore.getState().userData?.user.activeLanguage
        );
        const enabledExercises = languageSettings?.exercises;

        const processedSentences = sentencesWithVoice.flatMap(
          ({ sentence, voice, contentType, error: voiceError }) => {
            const sentenceTypes: PracticeSentence[] = [];

            if (enabledExercises?.translation) {
              sentenceTypes.push(
                toPracticeSentence(sentence, "translation", voice, contentType, voiceError)
              );
            }
            if (enabledExercises?.listening) {
              sentenceTypes.push(
                toPracticeSentence(sentence, "listening", voice, contentType, voiceError)
              );
            }
            if (enabledExercises?.speaking) {
              sentenceTypes.push(
                toPracticeSentence(sentence, "speaking", voice, contentType, voiceError)
              );
            }

            return sentenceTypes;
          }
        );

        console.log("All sentences processed");
        setSentences(processedSentences);
      } catch (fetchError) {
        console.error("Error in getSentences:", fetchError);
        setError(toFetchError(fetchError));
      }
    }

    console.log("Fetching sentences...");
    getSentences();
    // Fetch once on mount, using the settings from that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [sentences, setSentences, error];
};

export default useFetchSentences;
