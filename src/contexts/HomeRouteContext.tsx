import {
  useState,
  useEffect,
  createContext,
  useCallback,
  useContext,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, AuthUser } from "aws-amplify/auth";
import { get, put, del } from "aws-amplify/api";
import CustomAuth from "../components/Auth/CustomAuth";
import { readJson } from "../api/readJson";
import {
  Category,
  Language,
  RemoveUserLanguageResponse,
  UserResponse,
  Word,
} from "../types/api";
import {
  CountryOption,
  LanguageOption,
  LanguageSettings,
} from "../types/language";

const defaultSettings: LanguageSettings = {
  index: 0,
  exercises: {
    translation: true,
    listening: true,
    speaking: true,
  },
};

const languages: LanguageOption[] = [
  {
    name: Language.Spanish,
    countries: [
      { name: "Spain", flag: "Flags/Spanish/es.png" },
      { name: "Mexico", flag: "Flags/Spanish/mx.png" },
      { name: "Argentina", flag: "Flags/Spanish/ar.png" },
    ],
    settings: defaultSettings,
  },
  {
    name: Language.Portuguese,
    countries: [
      { name: "Brazil", flag: "Flags/Portuguese/br.png" },
      { name: "Portugal", flag: "Flags/Portuguese/pt.png" },
    ],
    settings: defaultSettings,
  },
  {
    name: Language.Japanese,
    countries: [{ name: "Japan", flag: "Flags/Japanese/jp.png" }],
    settings: defaultSettings,
  },
  {
    name: Language.German,
    countries: [{ name: "Germany", flag: "Flags/German/de.png" }],
    settings: defaultSettings,
  },
  {
    name: Language.Italian,
    countries: [{ name: "Italy", flag: "Flags/Italian/it.png" }],
    settings: defaultSettings,
  },
  {
    name: Language.French,
    countries: [
      { name: "France", flag: "Flags/French/fr.png" },
      { name: "Canada", flag: "Flags/French/ca.png" },
    ],
    settings: defaultSettings,
  },
];

languages.forEach((language) => {
  language.countries.forEach((country) => {
    const img = new Image();
    img.src = country.flag;
  });
});

interface HomeRouteState {
  wordTable: Word[];
  selectedLanguages: LanguageOption[];
  initialLanguages: LanguageOption[];
  categories: Category[];
  activeLanguage: Language | null;
  isLoading: boolean;
}

export interface HomeRouteContextValue extends HomeRouteState {
  updateVocabTable: (language?: Language | null) => Promise<void>;
  handleRemoveWord: (word: { word: string }) => Promise<void>;
  handleSetActive: (languageName: Language) => Promise<void>;
  handleLanguageSelect: (language: LanguageOption) => void;
  handleRemoveLanguage: (language: LanguageOption) => Promise<void>;
  handleOptionsChange: (updatedLanguage: LanguageOption) => void;
  handleSave: (language: LanguageOption) => Promise<void>;
  getSelectedLanguageSettings: () => LanguageSettings | null;
  getActiveCountry: () => CountryOption | null;
  languages: LanguageOption[];
  signOut?: () => void;
  user?: AuthUser;
}

export const HomeRouteContext = createContext<HomeRouteContextValue | undefined>(
  undefined
);

export function useHomeRoute(): HomeRouteContextValue {
  const context = useContext(HomeRouteContext);
  if (!context) {
    throw new Error("useHomeRoute must be used within HomeRouteProvider");
  }
  return context;
}

interface HomeRouteProviderProps {
  children: ReactNode;
  signOut?: () => void;
  user?: AuthUser;
}

async function authToken(): Promise<string> {
  return (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";
}

export const HomeRouteProvider = ({
  children,
  signOut,
  user,
}: HomeRouteProviderProps) => {
  const navigate = useNavigate();

  const [state, setState] = useState<HomeRouteState>(() => ({
    wordTable: [],
    selectedLanguages: [],
    initialLanguages: [],
    categories: [],
    activeLanguage: null,
    isLoading: true,
  }));

  const initializeData = useCallback(async () => {
    setState((prevState) => ({ ...prevState, isLoading: true }));
    const token = await authToken();

    try {
      const userResponse = await get({
        apiName: "LanguageLearningApp",
        path: "/user",
        options: { headers: { Authorization: token } },
      }).response;
      const json = await readJson<UserResponse>(userResponse);
      const activeLanguage = json.user.activeLanguage ?? null;

      const transformedLanguages: LanguageOption[] = [];
      for (const entry of json.userLanguages ?? []) {
        const match = languages.find((language) => language.name === entry.language);
        if (!match) continue;
        transformedLanguages.push({
          ...match,
          settings: {
            index: match.countries.findIndex(
              (country) => country.name === entry.country
            ),
            exercises: {
              translation: entry.translation,
              listening: entry.listening,
              speaking: entry.speaking,
            },
          },
        });
      }

      const wordTable = (json.vocabulary ?? []).filter(
        (word): word is Word => word != null
      );

      const request = await get({
        apiName: "LanguageLearningApp",
        path: `/categories?language=${activeLanguage}`,
        options: {
          headers: {
            Authorization: token,
          },
        },
      }).response;

      const categories = await readJson<Category[]>(request);

      setState((prevState) => ({
        ...prevState,
        wordTable,
        selectedLanguages: transformedLanguages,
        initialLanguages: transformedLanguages,
        activeLanguage,
        categories,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Initialization failed:", error);
      setState((prevState) => ({ ...prevState, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const updateVocabTable = useCallback(
    async (language?: Language | null) => {
      const languageToUse = language || state.activeLanguage;
      if (!languageToUse) return;

      const token = await authToken();

      try {
        const request = get({
          apiName: "LanguageLearningApp",
          path: `/vocabulary?language=${languageToUse}`,
          options: {
            headers: {
              Authorization: token,
            },
          },
        });

        const response = await request.response;
        const fetchedResponse = await readJson<Word[]>(response);
        setState((prevState) => ({ ...prevState, wordTable: fetchedResponse }));
      } catch (e) {
        console.error("GET call failed: ", e);
      }
    },
    [state.activeLanguage]
  );

  useEffect(() => {
    if (state.activeLanguage) {
      updateVocabTable(state.activeLanguage);
    }
  }, [state.activeLanguage, updateVocabTable]);

  const handleRemoveWord = useCallback(
    async (word: { word: string }) => {
      setState((prevState) => ({
        ...prevState,
        wordTable: prevState.wordTable.filter((item) => item.word !== word.word),
      }));

      const token = await authToken();

      try {
        await del({
          apiName: "LanguageLearningApp",
          path: `/vocabulary?language=${state.activeLanguage}&word=${word.word}`,
          options: {
            headers: {
              Authorization: token,
            },
          },
        });
      } catch (e) {
        console.error("DELETE call failed: ", e);
      }
    },
    [state.activeLanguage]
  );

  const handleSetActive = useCallback(
    async (languageName: Language) => {
      try {
        const token = await authToken();

        await put({
          apiName: "LanguageLearningApp",
          path: "/user",
          options: {
            headers: {
              Authorization: token,
            },
            body: {
              activeLanguage: languageName,
            },
          },
        });

        const request = await get({
          apiName: "LanguageLearningApp",
          path: `/categories?language=${languageName}`,
          options: {
            headers: {
              Authorization: token,
            },
          },
        }).response;

        const categories = await readJson<Category[]>(request);

        setState((prevState) => ({
          ...prevState,
          activeLanguage: languageName,
          categories,
        }));
        await updateVocabTable(languageName);
      } catch (e) {
        console.error("PUT call failed: ", e);
      }
    },
    [updateVocabTable]
  );

  const handleOptionsChange = useCallback((updatedLanguage: LanguageOption) => {
    setState((prevState) => ({
      ...prevState,
      selectedLanguages: prevState.selectedLanguages.map((item) =>
        item.name === updatedLanguage.name ? updatedLanguage : item
      ),
    }));
  }, []);

  const handleSave = useCallback(
    async (language: LanguageOption) => {
      setState((prevState) => ({
        ...prevState,
        initialLanguages: prevState.initialLanguages.map((item) =>
          item.name === language.name ? language : item
        ),
      }));

      const country = language.countries[language.settings.index];
      if (!country) return;

      const token = await authToken();

      try {
        await put({
          apiName: "LanguageLearningApp",
          path: "/language",
          options: {
            headers: {
              Authorization: token,
            },
            body: {
              language: language.name,
              country: country.name,
              translation: language.settings.exercises.translation,
              listening: language.settings.exercises.listening,
              speaking: language.settings.exercises.speaking,
            },
          },
        });

        if (!state.activeLanguage) {
          setState((prevState) => ({
            ...prevState,
            activeLanguage: language.name,
          }));
          navigate("/settings");
        }
      } catch (e) {
        console.error("PUT call failed: ", e);
      }
    },
    [navigate, state.activeLanguage]
  );

  const handleLanguageSelect = useCallback(
    (language: LanguageOption) => {
      setState((prevState) => {
        const newSelectedLanguages = [...prevState.selectedLanguages, language];
        if (newSelectedLanguages.length === 1) {
          handleSetActive(language.name);
        }
        return {
          ...prevState,
          selectedLanguages: newSelectedLanguages,
          initialLanguages: [...prevState.initialLanguages, { ...language }],
        };
      });

      handleSave({ ...language, settings: defaultSettings });
    },
    [handleSetActive, handleSave]
  );

  const handleRemoveLanguage = useCallback(
    async (language: LanguageOption) => {
      setState((prevState) => ({
        ...prevState,
        selectedLanguages: prevState.selectedLanguages.filter(
          (item) => item !== language
        ),
      }));

      const token = await authToken();

      try {
        const request = del({
          apiName: "LanguageLearningApp",
          path: `/language?language=${language.name}`,
          options: {
            headers: {
              Authorization: token,
            },
          },
        });

        const response = await request.response;
        const fetchedResponse = await readJson<RemoveUserLanguageResponse>(
          response as unknown as { body: { json: () => Promise<unknown> } }
        );

        setState((prevState) => ({
          ...prevState,
          activeLanguage: fetchedResponse.activeLanguage ?? null,
        }));
        updateVocabTable();
      } catch (e) {
        console.error("DELETE call failed: ", e);
      }
    },
    [updateVocabTable]
  );

  const getSelectedLanguageSettings = useCallback(() => {
    if (!state.activeLanguage) return null;

    const activeLangObj = state.selectedLanguages.find(
      (lang) => lang.name === state.activeLanguage
    );

    return activeLangObj ? activeLangObj.settings : null;
  }, [state.activeLanguage, state.selectedLanguages]);

  const getActiveCountry = useCallback(() => {
    if (!state.activeLanguage) return null;

    const activeLangObj = state.selectedLanguages.find(
      (lang) => lang.name === state.activeLanguage
    );

    if (!activeLangObj || !activeLangObj.countries) return null;

    return activeLangObj.countries[activeLangObj.settings.index] ?? null;
  }, [state.activeLanguage, state.selectedLanguages]);

  return (
    <HomeRouteContext.Provider
      value={{
        ...state,
        updateVocabTable,
        handleRemoveWord,
        handleSetActive,
        handleLanguageSelect,
        handleRemoveLanguage,
        handleOptionsChange,
        handleSave,
        getSelectedLanguageSettings,
        getActiveCountry,
        languages,
        signOut,
        user,
      }}
    >
      <CustomAuth>{children}</CustomAuth>
    </HomeRouteContext.Provider>
  );
};

export default HomeRouteProvider;
