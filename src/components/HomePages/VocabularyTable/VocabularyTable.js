import './VocabularyTable.css';
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import calculateLastSeen from "../CalculateLastSeen";
import Modal from "./Modal";
import {useAuthContext} from "../../../contexts/AuthProvider";

function VocabularyTable() {
    const {auth} = useAuthContext();
    const [wordTable, setWordTable] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const updateVocabTable = () => {
        axios.defaults.withCredentials = true;
        axios
            .get("/user/vocabtable")
            .then((res) => {
                setWordTable(res.data);
            })
            .catch((err) => console.log(err));
    }

    const handleRemoveWord = (word) => {
        axios
            .post("/user/removevocabulary", {
                word_id: word.word_id,
            })
            .then((res) => {
                if (res.data.success) {
                    updateVocabTable();
                } else
                    console.log("Failed to remove word");
            })
            .catch((err) => console.log(err));
    };


    useEffect(() => {
        updateVocabTable();
    }, []);

    const onButtonClick = useCallback(() => {
        setShowModal(true);
    }, []);

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        auth ?
            <div className="page-container">
                <div className="content-container">
                    <div className={"add-vocabulary-button-wrapper"}>
                        <button className="add-vocabulary-button" onClick={onButtonClick}>ADD
                            VOCABULARY
                        </button>
                    </div>
                    <div className="table-wrapper">
                        <table className="vocabulary-table">
                            <thead>
                            <tr>
                                <th>Word</th>
                                <th>Interval</th>
                                <th>Last practiced</th>
                                <th>Remove</th>
                            </tr>
                            </thead>
                            <tbody>
                            {wordTable.map((word, index) => (
                                <tr key={index}>
                                    <td className={"content-td"}>{word.word}</td>
                                    <td className={"content-td"}>{word.interval_score}</td>
                                    <td className={"content-td"}>{calculateLastSeen(word.last_seen)}</td>
                                    <td className={"remove-word-td"}>
                                        <button className={"remove-word-btn"}
                                                onClick={() => handleRemoveWord(word)}>REMOVE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Modal showModal={showModal} onClose={closeModal} updateVocabTable={updateVocabTable}/>
            </div>
            : null
    );
}

export default VocabularyTable