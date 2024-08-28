import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";
import { get, post, put, del } from "aws-amplify/api";
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

export const HomeRouteProvider = ({
  children,
  activeLanguage,
  setActiveLanguage,
  signOut,
  user,
}) => {
  const [wordTable, setWordTable] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [initialLanguages, setInitialLanguages] = useState([]);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const updateVocabTable = async () => {
    const authToken =
      (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

    try {
      const request = get({
        apiName: "LanguageLearningApp",
        path: `/vocabulary?language=${activeLanguage}`,
        options: {
          headers: {
            Authorization: authToken,
          },
        },
      });

      const response = await request.response;
      const { body } = response;
      const fetchedResponse = await body.json();
      console.log(fetchedResponse);
      setWordTable(fetchedResponse);
    } catch (e) {
      console.error("POST call failed: ", JSON.parse(await e.response.body));
    }
  };

  const handleRemoveWord = async (word) => {
    setWordTable((prev) =>
      prev.filter((item) =>  item.word !== word.word)
    );

    console.log(word.word);

    const authToken =
      (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

    try {
      del({
        apiName: "LanguageLearningApp",
        path: `/vocabulary?language=${activeLanguage}&word=${word.word}`,
        options: {
          headers: {
            Authorization: authToken,
          },
        },
      });
    } catch (e) {
      console.error("DELETE call failed: ", JSON.parse(await e.response.body));
    }
  };

  const handleSetActive = async (languageName: string) => {
    try {
      const authToken =
        (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

      put({
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
      setActiveLanguage(languageName);
      updateVocabTable();
    } catch (e) {
      console.error("POST call failed: ", JSON.parse(await e.response.body));
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguages((prev) => {
      if (!prev.length) handleSetActive(language.name);
      return [...prev, language];
    });

    setInitialLanguages((prev) => [...prev, { ...language }]);

    handleSave({ ...language, settings: defaultSettings });
  };

  // useEffect(() => {
  //     if (!activeLanguage) return;  // No active language set
  //     const getCategories = async () => {
  //         await axios.post("api/user/getcategories", {}, {
  //             headers: {
  //                 Authorization: `Bearer ${await getAccessTokenSilently()}`
  //             }
  //         }).then((res) => {
  //            setCategories(res.data)
  //         });
  //     };

  //     getCategories();
  // }, [activeLanguage]);

  const fetchLanguages = async () => {
    const authToken =
      (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";
    try {
      const request = get({
        apiName: "LanguageLearningApp",
        path: "/languages",
        options: {
          headers: {
            Authorization: authToken,
          },
        },
      });

      const response = await request.response;
      const { body } = response;
      const fetchedSettings = await body.json();

      const transformedData = fetchedSettings.map((entry) => {
        return {
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
        };
      });

      setSelectedLanguages(transformedData);
      setInitialLanguages(transformedData);
    } catch (e) {
      console.error("POST call failed: ", JSON.parse(await e.response.body));
    }
  };

  useEffect(() => {
    console.log(user);
    fetchLanguages();
    updateVocabTable();
  }, []);

  const getSelectedLanguageSettings = () => {
    if (!activeLanguage) return null; // No active language set

    const activeLangObj = selectedLanguages.find(
      (lang) => lang.name === activeLanguage
    );

    return activeLangObj ? activeLangObj.settings : null;
  };

  const getActiveCountry = () => {
    if (!activeLanguage) return null; // No active language set

    const activeLangObj = selectedLanguages.find(
      (lang) => lang.name === activeLanguage
    );

    if (!activeLangObj || !activeLangObj.countries) return null; // Active language not found in the list, or it doesn't have countries

    return activeLangObj.countries[activeLangObj.settings.index] || null; // Return the active country or null if not found
  };

  const handleRemoveLanguage = async (language) => {
    setSelectedLanguages((prev) => prev.filter((item) => item !== language));

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

      setActiveLanguage(fetchedResponse.activeLanguage);
      updateVocabTable();
    } catch (e) {
      console.error("POST call failed: ", JSON.parse(await e.response.body));
    }
  };

  const handleOptionsChange = (updatedLanguage) => {
    setSelectedLanguages((prev) =>
      prev.map((item) =>
        item.name === updatedLanguage.name ? updatedLanguage : item
      )
    );
  };

  const handleSave = async (language) => {
    setInitialLanguages((prev) =>
      prev.map((item) => (item.name === language.name ? language : item))
    );
    const authToken =
      (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

    try {
      put({
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

      if (!activeLanguage) {
        setActiveLanguage(language.name);
        navigate("/settings");
      }
    } catch (e) {
      console.log("POST call failed: ", JSON.parse(e.response.body));
    }
  };

  return (
    <HomeRouteContext.Provider
      value={{
        wordTable,
        handleRemoveWord,
        updateVocabTable,
        handleSetActive,
        selectedLanguages,
        handleRemoveLanguage,
        handleOptionsChange,
        initialLanguages,
        handleLanguageSelect,
        handleSave,
        languages,
        activeLanguage,
        getActiveCountry,
        getSelectedLanguageSettings,
        categories,
        signOut,
        user,
      }}
    >
      <CustomAuth>{children}</CustomAuth>
    </HomeRouteContext.Provider>
  );
};
