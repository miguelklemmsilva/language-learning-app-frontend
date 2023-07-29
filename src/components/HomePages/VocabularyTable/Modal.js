import React, {useState} from 'react';
import './Modal.css';
import axios from "axios";

function Modal({showModal, onClose, updateVocabTable}) {
    const [words, setWords] = useState('');

    const close = () => {
        onClose();
        setWords('');
    }

    if (!showModal) {
        return null;
    }

    function cleanString(str) {
        return str
            .replace(/[^a-zA-Z\u00C0-\u017F\s]/g, '')
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim();
    }
    async function getValidWords() {
        const cleanWords = cleanString(words);

        const {data} = await axios.get('https://py-ai-api-test.azurewebsites.net/api/GetValidWords', {
            params: {
                words: cleanWords,
            }
        }).catch((err) => console.log(err));
        return data.valid_words;
    }

    async function onAddWords() {
        close();
        const validWords = await getValidWords();
        axios.defaults.withCredentials = true;
        axios.post("api/user/addvocabulary", {
            words: validWords
        }).then(updateVocabTable)
            .catch((err) => console.log(err));
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
