import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPut } from "./client";
import { useUserStore } from "../stores/userStore";
import {
  Language,
  RemoveUserLanguageResponse,
  UserLanguage,
  UserLanguageRequest,
  UserResponse,
} from "../types/api";

function upsertLanguage(languages: UserLanguage[] | null | undefined, next: UserLanguage) {
  const list = languages ?? [];
  const exists = list.some((item) => item.language === next.language);
  if (!exists) return [...list, next];
  return list.map((item) => (item.language === next.language ? next : item));
}

function remember(queryClient: ReturnType<typeof useQueryClient>, user: UserResponse) {
  queryClient.setQueryData<UserResponse>(["user"], user);
  useUserStore.getState().setUserData(user);
}

export function useUserData() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => apiGet<UserResponse>("/user"),
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

export function useSaveLanguage() {
  const queryClient = useQueryClient();

  return useMutation<UserLanguage | null, Error, UserLanguageRequest>({
    mutationFn: async (request) => {
      try {
        return await apiPut<UserLanguage>("/language", { ...request });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (/json|unexpected/i.test(message)) return null;
        throw error;
      }
    },
    onSuccess: (saved, request) => {
      queryClient.setQueryData<UserResponse>(["user"], (old) => {
        if (!old) return old;
        const next: UserLanguage = {
          userId: saved?.userId || old.user.userId,
          language: request.language,
          proficiency: saved?.proficiency ?? request.proficiency,
          country: saved?.country ?? request.country,
          translation: saved?.translation ?? request.translation,
          listening: saved?.listening ?? request.listening,
          speaking: saved?.speaking ?? request.speaking,
        };
        const updated: UserResponse = {
          ...old,
          user: {
            ...old.user,
            activeLanguage: old.user.activeLanguage ?? next.language,
          },
          userLanguages: upsertLanguage(old.userLanguages, next),
        };
        useUserStore.getState().setUserData(updated);
        return updated;
      });
    },
  });
}

export function useSetActiveLanguage() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse | null, Error, Language>({
    mutationFn: async (activeLanguage) => {
      try {
        return await apiPut<UserResponse>("/user", { activeLanguage });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (/json|unexpected/i.test(message)) return null;
        throw error;
      }
    },
    onSuccess: (data, activeLanguage) => {
      if (data?.user) {
        remember(queryClient, data);
      } else {
        const current = queryClient.getQueryData<UserResponse>(["user"]);
        if (current) {
          remember(queryClient, {
            ...current,
            user: { ...current.user, activeLanguage },
          });
        }
      }
      void queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useRemoveLanguage() {
  const queryClient = useQueryClient();

  return useMutation<RemoveUserLanguageResponse | null, Error, Language>({
    mutationFn: (language) =>
      apiDelete<RemoveUserLanguageResponse>(`/language?language=${encodeURIComponent(language)}`),
    onSuccess: (result, language) => {
      const current = queryClient.getQueryData<UserResponse>(["user"]);
      if (!current) return;
      remember(queryClient, {
        ...current,
        user: {
          ...current.user,
          activeLanguage: result?.activeLanguage ?? null,
        },
        userLanguages: (current.userLanguages ?? []).filter((entry) => entry.language !== language),
      });
      void queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
