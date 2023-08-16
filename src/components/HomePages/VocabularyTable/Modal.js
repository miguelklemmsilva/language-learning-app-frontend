import React, {useState} from 'react';
import './Modal.css';
import axios from "axios";
import {useAuth0} from "@auth0/auth0-react";

function Modal({showModal, onClose, updateVocabTable}) {
    const [words, setWords] = useState('');
    const {getAccessTokenSilently} = useAuth0();

    const close = () => {
        onClose();
        setWords('');
    }

    if (!showModal) {
        return null;
    }

    function cleanString(str) {
        return str
            .replace(/[^a-zA-Z\u00C0-\u017F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF\s]/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim();
    }

    async function onAddWords() {
        close();
        const cleanWords = cleanString(words);
        axios.post("api/user/addvocabulary", {
            words: cleanWords
        }, {
            headers: {
                Authorization: `Bearer ${await getAccessTokenSilently()}`,
            }
        }).then(updateVocabTable)
            .catch((err) => console.error(err));
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className={"info-container"}>
                    <div>Add nouns, verbs, adjectives and adverbs</div>
                    <div>Words must be separated by a space</div>
                </div>
                <div className={"input-wrapper"}>
                    <textarea onChange={(e) => setWords(e.target.value)} value={words} className="vocab-input"
                              placeholder="Add your vocabulary here..."></textarea>
                </div>
                <div className={"modal-buttons-container"}>
                    <button className="modal-button add" onClick={onAddWords}>
                        Add words
                    </button>
                    <button className="modal-button close" onClick={close}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
