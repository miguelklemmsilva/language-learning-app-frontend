import './VocabularyTable.css';
import {useCallback, useContext, useEffect, useState} from "react";
import calculateTime from "../calculateTime";
import Modal from "./Modal";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";

function VocabularyTable() {
    const {wordTable, handleRemoveWord, updateVocabTable} = useContext(HomeRouteContext);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        console.log(wordTable)
    }, [wordTable]);

    const onButtonClick = useCallback(() => {
        setShowModal(true);
    }, []);

    const closeModal = () => {
        setShowModal(false);
    };

    function BoxBars({ boxNumber }) {
        const bars = [];

        for (let i = 1; i <= boxNumber; i++) {
            bars.push(<span key={i} className="box-bar" data-box={i}></span>);
        }

        return <div className="box-bars-container"><div>{bars}</div></div>;
    }



    return (<div className="page-container">
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
                            <th>Familiarity</th>
                            <th>Due</th>
                            <th>Last practiced</th>
                            <th>Remove</th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordTable && wordTable.map((word, index) => (
                            <tr key={index}>
                                <td className={"content-td"}>{word.word}</td>
                                <td className={"content-td"}>
                                    <BoxBars boxNumber={word.box_number} />
                                </td>
                                <td className={"content-td"}>{calculateTime(word.minutes_until_due)}</td>
                                <td className={"content-td"}>{calculateTime(word.last_seen)}</td>
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
    </div>);
}

export default VocabularyTable