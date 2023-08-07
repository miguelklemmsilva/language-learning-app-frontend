import CollapsibleForm from "./CollapsibleForm";
import LanguageDropdown from "./LanguageDropdown";
import {useEffect, useState} from "react";
import "./Settings.css";
import axios from "axios";
import {useAuth0} from "@auth0/auth0-react";

function Settings({checkIfUserIsRegistered}) {
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [activeLanguage, setActiveLanguage] = useState("");
    const [initialLanguages, setInitialLanguages] = useState([]);
    const {getAccessTokenSilently} = useAuth0();

    const defaultSettings = {
        index: 0,
        exercises: {
            translation: true,
            listening: true,
            speaking: true
        }
    }

    const languages = [{
        name: "Spanish",
        countries: [
            {name: "Spain", flag: {src: "Flags/Spanish/es.png", alt: "es flag"}},
            {name: "Mexico", flag: {src: "Flags/Spanish/mx.png", alt: "mx flag"}},
            {name: "Argentina", flag: {src: "Flags/Spanish/ar.png", alt: "ar flag"}},
        ],
        settings: defaultSettings
    }, {
        name: "Portuguese",
        countries: [
            {name: "Brazil", flag: {src: "Flags/Portuguese/br.png"}, alt: "br flag"},
            {name: "Portugal", flag: {src: "Flags/Portuguese/pt.png"}, alt: "pt flag"},
        ],
        settings: defaultSettings
    }];

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
                        ...languages.find(language => language.name === entry.language),
                        settings: {
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
                console.log(err);
            }
        };
        fetchLanguages();
    }, []);

    const fetchActiveLanguage = async () => {
        try {
            const activeLanguageResponse = await axios.get("api/user/getactivelanguage", {
                headers: {
                    Authorization: `Bearer ${await getAccessTokenSilently()}`
                }
            });
            console.log(activeLanguageResponse)
            setActiveLanguage(activeLanguageResponse.data.active_language);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchActiveLanguage();
    }, []);

    const handleLanguageSelect = (language) => {
        setSelectedLanguages((prev) => {
            if (!prev.length) handleSetActive(language.name);
            return [...prev, language];
        });

        setInitialLanguages((prev) => [...prev, {...language}]);

        handleSave({...language, settings: defaultSettings})
    };

    const handleSetActive = async (languageName) => {
        setActiveLanguage(languageName);
        axios.post("api/user/setactivelanguage", {language: languageName}, {
            headers: {
                Authorization: `Bearer ${await getAccessTokenSilently()}`
            }
        }).catch((err) => {
            console.log(err);
        });
    };

    const handleRemoveLanguage = async (language) => {
        setSelectedLanguages((prev) => prev.filter((item) => item !== language));
        axios.post("api/user/removelanguage", {language: language.name}, {
            headers: {
                Authorization: `Bearer ${await getAccessTokenSilently()}`
            },
        }).then(() => {
                fetchActiveLanguage()
            }
        ).catch((err) => {
            console.log(err);
        });
    };

    const handleOptionsChange = (updatedLanguage) => {
        setSelectedLanguages((prev) =>
            prev.map((item) => item.name === updatedLanguage.name ? updatedLanguage : item)
        );
    };

    const handleSave = async (language) => {
        setInitialLanguages((prev) => prev.map((item) => item.name === language.name ? language : item));
        axios.post("api/user/updatelanguage", {language}, {
            headers: {
                Authorization: `Bearer ${await getAccessTokenSilently()}`
            }
        }).then(() => {
            // if this is the user registering their first language
            if (checkIfUserIsRegistered)
                checkIfUserIsRegistered();
        }).catch((err) => {
            console.log(err);
        });
    }

    return (
        <div className="page-container">
            <div className="content-container">
                {selectedLanguages.map((item) => (<CollapsibleForm
                    key={item.name}
                    language={item}
                    isActive={item.name === activeLanguage}
                    setActive={() => handleSetActive(item.name)}
                    onRemove={() => handleRemoveLanguage(item)}
                    initialSettings={initialLanguages.find(lang => lang.name === item.name)?.settings}
                    handleSave={() => handleSave(item)}
                    onOptionsChange={handleOptionsChange}
                />))}
                <LanguageDropdown onLanguageSelect={handleLanguageSelect} selectedOptions={selectedLanguages}
                                  languages={languages}/>
            </div>
        </div>);
}

export default Settings;
