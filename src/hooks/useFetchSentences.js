import { useEffect, useState, useContext } from "react";
import { get } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import Cookie from "universal-cookie";
import { HomeRouteContext } from "../contexts/HomeRouteContext";

const useFetchSentences = () => {
  const [sentences, setSentences] = useState();
  const [error, setError] = useState(null);
  const { getSelectedLanguageSettings } = useContext(HomeRouteContext);

  const countryVoices = {
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
    Portugal: [
      "pt-PT-RaquelNeural",
      "pt-PT-DuarteNeural",
      "pt-PT-FernandaNeural",
    ],
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

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  async function synthesizeText(text, voiceName, token) {
    console.log(`Synthesizing text: "${text}" with voice: ${voiceName}`);
    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
      token,
      "uksouth"
    );
    speechConfig.speechSynthesisVoiceName = voiceName;

    const audioConfig = sdk.AudioConfig.fromStreamOutput(
      new sdk.PushAudioOutputStreamCallback()
    );

    const speechSynthesizer = new sdk.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Speech synthesis timed out"));
      }, 30000); // 30 seconds timeout

      speechSynthesizer.speakTextAsync(
        text,
        (result) => {
          clearTimeout(timeout);
          speechSynthesizer.close();
          console.log(`Synthesis completed for: "${text}"`);
          resolve(result.audioData);
        },
        (error) => {
          clearTimeout(timeout);
          console.error(`Synthesis error for: "${text}"`, error);
          speechSynthesizer.close();
          reject(error);
        }
      );
    });
  }

  const synthesizeSentenceVoice = async (completion, country, token) => {
    try {
      const voicesArray = countryVoices[country];
      if (!voicesArray || voicesArray.length === 0) {
        throw new Error(`No voices available for country: ${country}`);
      }
      const voiceData = await synthesizeText(
        completion,
        voicesArray[Math.floor(Math.random() * voicesArray.length)],
        token
      );
      return arrayBufferToBase64(voiceData);
    } catch (error) {
      console.error(`Error synthesizing voice for country ${country}:`, error);
      throw error;
    }
  };

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

      const json = await response.body.json();
      console.log("Fetched sentences:", json);

      const { sentences: fetchedSentences, issueToken } = json;

      cookie.set("speech-token", "uksouth:" + issueToken, {
        maxAge: 540,
        path: "/",
      });

      if (!fetchedSentences || fetchedSentences.length === 0) {
        throw new Error("No sentences received from the API");
      }

      if (!issueToken) {
        throw new Error("No issueToken received from the API");
      }

      console.log(`Processing ${fetchedSentences.length} sentences`);

      const sentencesWithVoice = await Promise.all(
        fetchedSentences.map(async (sentence, index) => {
          try {
            console.log(
              `Processing sentence ${index + 1}/${fetchedSentences.length}`
            );
            const voiceData = await synthesizeSentenceVoice(
              sentence.original,
              sentence.country,
              issueToken
            );
            console.log(`Sentence ${index + 1} processed successfully`);
            return { ...sentence, voice: voiceData };
          } catch (error) {
            console.error(`Error processing sentence ${index + 1}:`, error);
            return { ...sentence, voice: null, error: error.message };
          }
        })
      );

      const languageSettings = getSelectedLanguageSettings();
      const enabledExercises = languageSettings?.exercises || {};

      const processedSentences = sentencesWithVoice.flatMap((sentence) => {
        const sentenceTypes = [];

        if (enabledExercises.translation) {
          sentenceTypes.push({ ...sentence, type: "translation" });
        }
        if (enabledExercises.listening) {
          sentenceTypes.push({ ...sentence, type: "listening" });
        }
        if (enabledExercises.speaking) {
          sentenceTypes.push({ ...sentence, type: "speaking" });
        }

        return sentenceTypes;
      });

      console.log("All sentences processed");
      setSentences(processedSentences);
    } catch (error) {
      console.error("Error in getSentences:", error);
      setError(error);
    }
  }

  useEffect(() => {
    console.log("Fetching sentences...");
    getSentences();
  }, []);

  return [sentences, setSentences, error];
};

export default useFetchSentences;
