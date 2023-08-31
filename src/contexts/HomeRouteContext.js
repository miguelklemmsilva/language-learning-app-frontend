import {useState, useEffect, createContext} from 'react';
import axios from 'axios';
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";

export const HomeRouteContext = createContext(undefined);

const defaultSettings = {
    index: 0, exercises: {
        translation: true, listening: true, speaking: true
    }
}

const languages = [{
    name: "Spanish",
    countries: [
        {name: "Spain", flag: "Flags/Spanish/es.png"},
        {name: "Mexico", flag: "Flags/Spanish/mx.png"},
        {name: "Argentina", flag: "Flags/Spanish/ar.png"}
    ], settings: defaultSettings
}, {
    name: "Portuguese",
    countries: [
        {name: "Brazil", flag: "Flags/Portuguese/br.png"},
        {name: "Portugal", flag: "Flags/Portuguese/pt.png"}
    ], settings: defaultSettings
}, {
    name: "Japanese",
    countries: [
        {name: "Japan", flag: "Flags/Japanese/jp.png"}
    ], settings: defaultSettings
}, {
    name: "German",
    countries: [
        {name: "Germany", flag: "Flags/German/de.png"},
        {name: "Switzerland", flag: "Flags/German/ch.png"}
    ], settings: defaultSettings
}];

languages.forEach(language => {
    language.countries.forEach(country => {
        const img = new Image();
        img.src = country.flag;
    });
});

export const HomeRouteProvider = ({children, checkIfUserIsRegistered}) => {
    const [wordTable, setWordTable] = useState([]);
    const {getAccessTokenSilently} = useAuth0();
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [initialLanguages, setInitialLanguages] = useState([]);
    const [activeLanguage, setActiveLanguage] = useState(null);
    const navigate = useNavigate();

    const updateVocabTable = async () => {
        axios
            .post("api/user/vocabtable", {}, {
                headers: {
                    Authorization: `Bearer ${await getAccessTokenSilently()}`,
                }
            })
            .then((res) => {
                setWordTable(res.data);
            })
            .catch((err) => console.error(err));
    };

    const handleRemoveWord = async (word) => {
        setWordTable((prev) => prev.filter((item) => item !== word));
        axios
            .post("api/user/removevocabulary", {word_id: word.word_id}, {
                headers: {
                    Authorization: `Bearer ${await getAccessTokenSilently()}`,
                }
            }).catch((err) => console.error(err));
    };

    // Load active languages from the server (similar to how you did in Settings)
    const fetchActiveLanguage = async () => {
        try {
            const activeLanguageResponse = await axios.get("api/user/getactivelanguage", {
                headers: {
                    Authorization: `Bearer ${await getAccessTokenSilently()}`
                }
            });
            setActiveLanguage(activeLanguageResponse.data.active_language);  // assuming the server returns an array
        } catch (err) {
            console.error(err);
        }
    };

    const handleSetActive = async (languageName) => {
        setActiveLanguage(languageName);
        axios.post("api/user/setactivelanguage", {language: languageName}, {
            headers: {
                Authorization: `Bearer ${await getAccessTokenSilently()}`
            }
        }).then(() => {
            updateVocabTable();
        }).catch((err) => {
            console.error(err);
        });
    };

    const handleLanguageSelect = (language) => {
        setSelectedLanguages((prev) => {
            if (!prev.length) handleSetActive(language.name);
            return [...prev, language];
        });

        setInitialLanguages((prev) => [...prev, {...language}]);

        handleSave({...language, settings: defaultSettings})
    };

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const settingsResponse = await axios.get("api/user/languagesettings", {
                    headers: {
                        Authorization: `Bearer ${await getAccessTokenSilently()}`
                    }
                });
                const fetchedSettings = settingsResponse.data.rows;

                const transformedData = fetchedSettings.map(entry => {
                    return {
                        ...languages.find(language => language.name === entry.language), settings: {
                            index: languages.find(language => language.name === entry.language).countries.findIndex(country => country.name === entry.country),
                            exercises: {
                                translation: entry.translation === 1,
                                listening: entry.listening === 1,
                                speaking: entry.speaking === 1
                            }
                        }
                    };
                });

                setSelectedLanguages(transformedData);
                setInitialLanguages(transformedData);
            } catch (err) {
                console.error(err);
            }
        };

        fetchActiveLanguage();
        fetchLanguages();
        updateVocabTable();
    }, []);


    const getSelectedLanguageSettings = () => {
        if (!activeLanguage) return null;  // No active language set

        const activeLangObj = selectedLanguages.find(lang => lang.name === activeLanguage);

        return activeLangObj ? activeLangObj.settings : null;
    }

    const getActiveCountry = () => {
        if (!activeLanguage) return null;  // No active language set

        const activeLangObj = selectedLanguages.find(lang => lang.name === activeLanguage);

        if (!activeLangObj || !activeLangObj.countries) return null;  // Active language not found in the list, or it doesn't have countries

        return activeLangObj.countries[activeLangObj.settings.index] || null;  // Return the active country or null if not found
    }

    const handleRemoveLanguage = async (language) => {
        setSelectedLanguages((prev) => prev.filter((item) => item !== language));
        axios.post("api/user/removelanguage", {language: language.name}, {
            headers: {
                Authorization: `Bearer ${await getAccessTokenSilently()}`
            },
        }).then(() => {
            checkIfUserIsRegistered();
            fetchActiveLanguage();
            updateVocabTable();
        }).catch((err) => {
            console.error(err);
        });
    };

    const handleOptionsChange = (updatedLanguage) => {
        setSelectedLanguages((prev) => prev.map((item) => item.name === updatedLanguage.name ? updatedLanguage : item));
    };

    const handleSave = async (language) => {
        setInitialLanguages((prev) => prev.map((item) => item.name === language.name ? language : item));
        axios.post("api/user/updatelanguage", {language}, {
            headers: {
                Authorization: `Bearer ${await getAccessTokenSilently()}`
            }
        }).then(() => {
            // if this is the user registering their first language
            if (checkIfUserIsRegistered) {
                checkIfUserIsRegistered();
                navigate("/settings");
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    return (<HomeRouteContext.Provider value={{
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
        getSelectedLanguageSettings
    }}>
        {children}
    </HomeRouteContext.Provider>);
};
