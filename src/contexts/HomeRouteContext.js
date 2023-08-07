import { useState, useEffect, createContext } from 'react';
import axios from 'axios';

export const HomeRouteContext = createContext();

export const HomeRouteProvider = ({ children }) => {
    const [wordTable, setWordTable] = useState([]);

    const updateVocabTable = () => {
        axios.defaults.withCredentials = true;
        axios
            .post("api/user/vocabtable")
            .then((res) => {
                setWordTable(res.data);
            })
            .catch((err) => console.log(err));
    };

    const handleRemoveWord = (word) => {
        axios
            .post("api/user/removevocabulary", { word_id: word.word_id })
            .then((res) => {
                if (res.data.success) {
                    updateVocabTable();
                } else console.log("Failed to remove word");
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        updateVocabTable();
    }, []);

    return (
        <HomeRouteContext.Provider value={{ wordTable, handleRemoveWord, updateVocabTable }}>
            {children}
        </HomeRouteContext.Provider>
    );
};
