import { del, get, put } from "aws-amplify/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_NAME, authToken } from "./client";
import { readJson } from "./readJson";
import {
  Language,
  Proficiency,
  RemoveUserLanguageResponse,
  UserLanguage,
  UserResponse,
} from "../types/api";
import { LanguageOption } from "../types/language";
import { useLanguageStore } from "../stores/languageStore";
import { useUserStore } from "../stores/userStore";

type LanguageDraftSnapshot = {
  selectedLanguages: LanguageOption[];
  initialLanguages: LanguageOption[];
};

async function fetchUser(): Promise<UserResponse> {
  const response = await get({
    apiName: API_NAME,
    path: "/user",
    options: {
      headers: { Authorization: await authToken() },
    },
  }).response;

  return readJson<UserResponse>(response);
}

export function useUserData() {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

function upsertLanguage(current: UserResponse, language: LanguageOption): UserResponse {
  const country = language.countries[language.settings.index];
  const existing = current.userLanguages ?? [];
  const previous = existing.find((entry) => entry.language === language.name);
  const nextEntry: UserLanguage = {
    userId: current.user.userId,
    language: language.name,
    proficiency: previous?.proficiency ?? Proficiency.Beginner,
    country: country?.name ?? previous?.country ?? "",
    translation: language.settings.exercises.translation,
    listening: language.settings.exercises.listening,
    speaking: language.settings.exercises.speaking,
  };
  const userLanguages = previous
    ? existing.map((entry) => (entry.language === language.name ? nextEntry : entry))
    : [...existing, nextEntry];

  return {
    ...current,
    user: {
      ...current.user,
      activeLanguage: current.user.activeLanguage ?? language.name,
    },
    userLanguages,
  };
}

function cacheUser(
  queryClient: ReturnType<typeof useQueryClient>,
  user: UserResponse
) {
  queryClient.setQueryData<UserResponse>(["user"], user);
  useUserStore.getState().setUserData(user);
}

async function putActiveLanguage(language: Language): Promise<void> {
  await put({
    apiName: API_NAME,
    path: "/user",
    options: {
      headers: { Authorization: await authToken() },
      body: { activeLanguage: language },
    },
  }).response;
}

export function useSetActiveLanguage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Language>({
    mutationFn: putActiveLanguage,
    onSuccess: (_result, language) => {
      const current = queryClient.getQueryData<UserResponse>(["user"]);
      if (!current) return;

      cacheUser(queryClient, {
        ...current,
        user: { ...current.user, activeLanguage: language },
      });
      void queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.error("PUT call failed: ", error);
    },
  });
}

function proficiencyFor(language: Language): Proficiency {
  const saved = useUserStore
    .getState()
    .userData?.userLanguages?.find((entry) => entry.language === language);

  return saved?.proficiency ?? Proficiency.Beginner;
}

async function putLanguage(language: LanguageOption): Promise<void> {
  const country = language.countries[language.settings.index];
  if (!country) return;

  await put({
    apiName: API_NAME,
    path: "/language",
    options: {
      headers: { Authorization: await authToken() },
      body: {
        language: language.name,
        proficiency: proficiencyFor(language.name),
        country: country.name,
        translation: language.settings.exercises.translation,
        listening: language.settings.exercises.listening,
        speaking: language.settings.exercises.speaking,
      },
    },
  }).response;
}

export function useSaveLanguage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, LanguageOption>({
    mutationFn: putLanguage,
    onSuccess: (_result, language) => {
      useLanguageStore.getState().markSaved(language);
      const current = queryClient.getQueryData<UserResponse>(["user"]);
      if (!current) return;
      cacheUser(queryClient, upsertLanguage(current, language));
    },
    onError: (error) => {
      console.error("PUT call failed: ", error);
    },
  });
}

async function deleteLanguage(language: Language): Promise<RemoveUserLanguageResponse> {
  const response = await del({
    apiName: API_NAME,
    path: `/language?language=${language}`,
    options: {
      headers: { Authorization: await authToken() },
    },
  }).response;

  return readJson<RemoveUserLanguageResponse>(
    response as unknown as { body: { json: () => Promise<unknown> } }
  );
}

export function useRemoveLanguage() {
  const queryClient = useQueryClient();

  return useMutation<RemoveUserLanguageResponse, Error, Language, LanguageDraftSnapshot>({
    mutationFn: deleteLanguage,
    onMutate: async (language) => {
      const { selectedLanguages, initialLanguages, removeLanguage } =
        useLanguageStore.getState();
      const snapshot = { selectedLanguages, initialLanguages };
      removeLanguage(language);
      return snapshot;
    },
    onSuccess: (response, language) => {
      const current = queryClient.getQueryData<UserResponse>(["user"]);
      if (!current) return;

      cacheUser(queryClient, {
        ...current,
        user: {
          ...current.user,
          activeLanguage: response.activeLanguage ?? null,
        },
        userLanguages: (current.userLanguages ?? []).filter(
          (entry) => entry.language !== language
        ),
      });
      void queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error, _language, snapshot) => {
      console.error("DELETE call failed: ", error);
      if (snapshot) useLanguageStore.setState(snapshot);
    },
  });
}
