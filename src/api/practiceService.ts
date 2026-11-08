import { post } from "aws-amplify/api";
import { API_NAME, authToken } from "./client";
import { Language } from "../types/api";

export async function saveSentenceAudio(
  sentences: { word: string; language: Language; voice: string; contentType?: string }[]
) {
  if (sentences.length === 0) return;
  await post({
    apiName: API_NAME,
    path: "/sentenceaudio",
    options: {
      headers: { Authorization: await authToken() },
      body: { sentences },
    },
  }).response;
}
