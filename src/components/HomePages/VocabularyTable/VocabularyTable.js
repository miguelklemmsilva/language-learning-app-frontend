import './VocabularyTable.css';
import {useCallback, useContext, useEffect, useState} from "react";
import calculateLastSeen from "../CalculateLastSeen";
import Modal from "./Modal";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";

function VocabularyTable() {
    const { wordTable, handleRemoveWord, updateVocabTable } = useContext(HomeRouteContext);
    const [showModal, setShowModal] = useState(false);

    const onButtonClick = useCallback(() => {
        setShowModal(true);
    }, []);

    const closeModal = () => {
        setShowModal(false);
    };

    return (
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
                        {wordTable && wordTable.map((word, index) => (
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
    );
}

export default VocabularyTable