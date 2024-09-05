import { useState, useEffect, createContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";
import { get, put, del } from "aws-amplify/api";
import CustomAuth from "../components/CustomAuth";

export const HomeRouteContext = createContext(undefined);

const defaultSettings = {
  index: 0,
  exercises: {
    translation: true,
    listening: true,
    speaking: true,
  },
};

const languages = [
  {
    name: "Spanish",
    countries: [
      { name: "Spain", flag: "Flags/Spanish/es.png" },
      { name: "Mexico", flag: "Flags/Spanish/mx.png" },
      { name: "Argentina", flag: "Flags/Spanish/ar.png" },
    ],
    settings: defaultSettings,
  },
  {
    name: "Portuguese",
    countries: [
      { name: "Brazil", flag: "Flags/Portuguese/br.png" },
      { name: "Portugal", flag: "Flags/Portuguese/pt.png" },
    ],
    settings: defaultSettings,
  },
  {
    name: "Japanese",
    countries: [{ name: "Japan", flag: "Flags/Japanese/jp.png" }],
    settings: defaultSettings,
  },
  {
    name: "German",
    countries: [{ name: "Germany", flag: "Flags/German/de.png" }],
    settings: defaultSettings,
  },
  {
    name: "Italian",
    countries: [{ name: "Italy", flag: "Flags/Italian/it.png" }],
    settings: defaultSettings,
  },
  {
    name: "French",
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

export const HomeRouteProvider = ({ children, signOut, user }) => {
  const navigate = useNavigate();

  const [state, setState] = useState(() => ({
    wordTable: [],
    selectedLanguages: [],
    initialLanguages: [],
    categories: [],
    activeLanguage: null,
    isLoading: true,
  }));

  const initializeData = useCallback(async () => {
    setState((prevState) => ({ ...prevState, isLoading: true }));
    const authToken =
      (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

    try {
      // Step 1: Fetch active language
      const userResponse = await get({
        apiName: "LanguageLearningApp",
        path: "/user",
        options: { headers: { Authorization: authToken } },
      }).response;
      const json = await userResponse.body.json();
      const activeLanguage = json.user.activeLanguage;

      const fetchedLanguages = json.userLanguages;

      const transformedLanguages = fetchedLanguages.map((entry) => ({
        ...languages.find((language) => language.name === entry.language),
        settings: {
          index: languages
            .find((language) => language.name === entry.language)
            .countries.findIndex((country) => country.name === entry.country),
          exercises: {
            translation: entry.translation,
            listening: entry.listening,
            speaking: entry.speaking,
          },
        },
      }));

      const wordTable = json.vocabulary;

      // Update state with all fetched data
      setState((prevState) => ({
        ...prevState,
        wordTable,
        selectedLanguages: transformedLanguages,
        initialLanguages: transformedLanguages,
        activeLanguage,
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
    async (language) => {
      const languageToUse = language || state.activeLanguage;
      if (!languageToUse) return;

      const authToken =
        (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

      try {
        const request = get({
          apiName: "LanguageLearningApp",
          path: `/vocabulary?language=${languageToUse}`,
          options: {
            headers: {
              Authorization: authToken,
            },
          },
        });

        const response = await request.response;
        const { body } = response;
        const fetchedResponse = await body.json();
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
    async (word) => {
      setState((prevState) => ({
        ...prevState,
        wordTable: prevState.wordTable.filter(
          (item) => item.word !== word.word
        ),
      }));

      const authToken =
        (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

      try {
        await del({
          apiName: "LanguageLearningApp",
          path: `/vocabulary?language=${state.activeLanguage}&word=${word.word}`,
          options: {
            headers: {
              Authorization: authToken,
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
    async (languageName) => {
      try {
        const authToken =
          (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

        await put({
          apiName: "LanguageLearningApp",
          path: "/user",
          options: {
            headers: {
              Authorization: authToken,
            },
            body: {
              activeLanguage: languageName,
            },
          },
        });
        setState((prevState) => ({
          ...prevState,
          activeLanguage: languageName,
        }));
        await updateVocabTable(languageName);
      } catch (e) {
        console.error("PUT call failed: ", e);
      }
    },
    [updateVocabTable]
  );

  const handleLanguageSelect = useCallback(
    (language) => {
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
    [handleSetActive]
  );

  const handleRemoveLanguage = useCallback(
    async (language) => {
      setState((prevState) => ({
        ...prevState,
        selectedLanguages: prevState.selectedLanguages.filter(
          (item) => item !== language
        ),
      }));

      const authToken =
        (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

      try {
        const request = del({
          apiName: "LanguageLearningApp",
          path: `/language?language=${language.name}`,
          options: {
            headers: {
              Authorization: authToken,
            },
          },
        });

        const response = await request.response;
        const { body } = response;
        const fetchedResponse = await body.json();

        setState((prevState) => ({
          ...prevState,
          activeLanguage: fetchedResponse.activeLanguage,
        }));
        updateVocabTable();
      } catch (e) {
        console.error("DELETE call failed: ", e);
      }
    },
    [updateVocabTable]
  );

  const handleOptionsChange = useCallback((updatedLanguage) => {
    setState((prevState) => ({
      ...prevState,
      selectedLanguages: prevState.selectedLanguages.map((item) =>
        item.name === updatedLanguage.name ? updatedLanguage : item
      ),
    }));
  }, []);

  const handleSave = useCallback(
    async (language) => {
      setState((prevState) => ({
        ...prevState,
        initialLanguages: prevState.initialLanguages.map((item) =>
          item.name === language.name ? language : item
        ),
      }));

      const authToken =
        (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

      try {
        await put({
          apiName: "LanguageLearningApp",
          path: "/language",
          options: {
            headers: {
              Authorization: authToken,
            },
            body: {
              language: language.name,
              country: language.countries[language.settings.index].name,
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

    return activeLangObj.countries[activeLangObj.settings.index] || null;
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
