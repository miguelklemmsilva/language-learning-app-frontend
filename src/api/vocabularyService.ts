import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPut } from "./client";
import { markWordNeedsPractice } from "./practiceService";
import { sameWord } from "../lib/words";
import { Category, Language, UserResponse, Word } from "../types/api";

export function useVocabulary(language?: Language | null) {
  return useQuery({
    queryKey: ["vocabulary", language],
    queryFn: async () => {
      const words = await apiGet<Array<Word | null>>(
        `/vocabulary?language=${encodeURIComponent(language ?? "")}`
      );
      return words.filter((word): word is Word => Boolean(word?.word));
    },
    enabled: Boolean(language),
  });
}

export function useCategories(language?: Language | null) {
  return useQuery({
    queryKey: ["categories", language],
    queryFn: () => apiGet<Category[]>(`/categories?language=${encodeURIComponent(language ?? "")}`),
    enabled: Boolean(language),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useAddVocabulary(language: Language | null | undefined, allowUnlisted = false) {
  const queryClient = useQueryClient();

  return useMutation<string[], Error, string[]>({
    mutationFn: (vocabulary) => {
      if (!language) throw new Error("Choose a language first.");
      return apiPut<string[]>("/vocabulary", { language, vocabulary, allowUnlisted });
    },
    onSuccess: async (added) => {
      if (language && added.length > 0) {
        await queryClient.cancelQueries({ queryKey: ["vocabulary", language] });
        const user = queryClient.getQueryData<UserResponse>(["user"]);
        queryClient.setQueryData<Word[]>(["vocabulary", language], (current) => {
          const words = current ?? [];
          const additions = added
            .filter((word) => !words.some((item) => sameWord(item.word, word)))
            .map(
              (word): Word => ({
                userId: user?.user.userId ?? "",
                language,
                word,
                lastPracticed: Math.floor(Date.now() / 1000),
                category: null,
                boxNumber: 0,
                lastSeen: 0,
                minutesUntilDue: 0,
              })
            );
          return additions.length > 0 ? [...additions, ...words] : words;
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["vocabulary", language] });
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useMarkForPractice(language: Language | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (word: string) => {
      if (!language) throw new Error("Choose a language first.");
      return markWordNeedsPractice(language, word);
    },
    onSuccess: async (_result, word) => {
      if (!language) return;
      await queryClient.cancelQueries({ queryKey: ["vocabulary", language] });
      queryClient.setQueryData<Word[]>(["vocabulary", language], (current) =>
        (current ?? []).map((item) =>
          sameWord(item.word, word)
            ? {
                ...item,
                boxNumber: 1,
                minutesUntilDue: 0,
                lastSeen: 0,
                lastPracticed: Math.floor(Date.now() / 1000),
              }
            : item
        )
      );
      void queryClient.invalidateQueries({ queryKey: ["vocabulary", language] });
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useRemoveVocabulary(language: Language | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string, { previous?: Word[] }>({
    mutationFn: (word) => {
      if (!language) throw new Error("Choose a language first.");
      return apiDelete(
        `/vocabulary?language=${encodeURIComponent(language)}&word=${encodeURIComponent(word)}`
      );
    },
    onMutate: async (word) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary", language] });
      const previous = queryClient.getQueryData<Word[]>(["vocabulary", language]);
      queryClient.setQueryData<Word[]>(["vocabulary", language], (old) =>
        (old ?? []).filter((item) => item.word !== word)
      );
      return { previous };
    },
    onError: (_error, _word, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["vocabulary", language], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["vocabulary", language] });
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
