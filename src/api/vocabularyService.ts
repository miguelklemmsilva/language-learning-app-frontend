import { del, get, put } from "aws-amplify/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_NAME, authToken } from "./client";
import { readJson } from "./readJson";
import { useUserData } from "./userService";
import { Category, Language, Word } from "../types/api";

async function fetchVocabulary(language: Language): Promise<Word[]> {
  const response = await get({
    apiName: API_NAME,
    path: `/vocabulary?language=${language}`,
    options: {
      headers: { Authorization: await authToken() },
    },
  }).response;

  return readJson<Word[]>(response);
}

async function fetchCategories(language: Language): Promise<Category[]> {
  const response = await get({
    apiName: API_NAME,
    path: `/categories?language=${language}`,
    options: {
      headers: { Authorization: await authToken() },
    },
  }).response;

  return readJson<Category[]>(response);
}

export function useVocabulary() {
  const { data } = useUserData();
  const language = data?.user.activeLanguage ?? null;

  return useQuery({
    queryKey: ["vocabulary", language],
    queryFn: () => fetchVocabulary(language as Language),
    enabled: language != null,
    staleTime: 15 * 60 * 1000,
  });
}

export function useCategories() {
  const { data } = useUserData();
  const language = data?.user.activeLanguage ?? null;

  return useQuery({
    queryKey: ["categories", language],
    queryFn: () => fetchCategories(language as Language),
    enabled: language != null,
    staleTime: 15 * 60 * 1000,
  });
}

export function useRemoveWord() {
  const queryClient = useQueryClient();
  const { data } = useUserData();
  const language = data?.user.activeLanguage ?? null;

  return useMutation<void, Error, string, { previous?: Word[] }>({
    mutationFn: async (word) => {
      await del({
        apiName: API_NAME,
        path: `/vocabulary?language=${language}&word=${word}`,
        options: {
          headers: { Authorization: await authToken() },
        },
      }).response;
    },
    onMutate: async (word) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary", language] });
      const previous = queryClient.getQueryData<Word[]>(["vocabulary", language]);
      queryClient.setQueryData<Word[]>(["vocabulary", language], (current) =>
        (current ?? []).filter((item) => item.word !== word)
      );
      return { previous };
    },
    onError: (error, _word, context) => {
      console.error("DELETE call failed: ", error);
      if (context?.previous) {
        queryClient.setQueryData(["vocabulary", language], context.previous);
      }
    },
  });
}

export function useAddVocabulary() {
  const queryClient = useQueryClient();

  return useMutation<string[], Error, { language: Language; vocabulary: string[] }>({
    mutationFn: async ({ language, vocabulary }) => {
      const response = await put({
        apiName: API_NAME,
        path: "/vocabulary",
        options: {
          headers: { Authorization: await authToken() },
          body: { vocabulary, language },
        },
      }).response;

      return readJson<string[]>(response);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
    onError: (error) => {
      console.error("PUT call failed: ", error);
    },
  });
}
