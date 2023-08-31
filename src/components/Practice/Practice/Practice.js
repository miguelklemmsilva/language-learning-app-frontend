import {useCallback, useEffect, useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import useFetchSentences from "../../../hooks/useFetchSentences";
import Question from "../Question/Question";
import Finished from "../Finished";
import PracticeLoading from "../PracticeLoading";
import "./Practice.scss";
import {LinearProgress} from "@mui/material";
import {Link} from "react-router-dom";

const Practice = () => {
    const [sentenceNumber, setSentenceNumber] = useState(0);
    const [sentence, setSentence] = useState(null);
    const [sentences, setSentences] = useFetchSentences("api/ai/generatesentences");

    useEffect(() => {
        if (sentences) setSentence(sentences[sentenceNumber]);
    }, [sentenceNumber, sentences]);

    const correctSentences = sentences ? sentences.filter(sentence => sentence.correct).length : 0;

    const updateSentence = useCallback((correct) => {
        const updatedSentences = sentences.map((sentence, idx) => {
            if (idx === sentenceNumber) {
                if (correct) return {
                    ...sentence, correct: true,
                }; else return {
                    ...sentence, mistakes: sentence.mistakes + 1,
                }
            }
            return sentence;
        });
        setSentences(updatedSentences);
    }, [sentences, setSentences, sentenceNumber])


    useEffect(() => {
        if (!sentences) return;
        const setNextQuestion = () => {
            let nextSentence = -1;

            for (let i = sentenceNumber + 1; i < sentences.length; i++) {
                if (!sentences[i].correct) {
                    nextSentence = i;
                    break;
                }
            }

            if (nextSentence === -1) {
                for (let i = 0; i <= sentenceNumber; i++) {
                    if (!sentences[i].correct) {
                        nextSentence = i;
                        break;
                    }
                }
            }

            setSentenceNumber(nextSentence);
        };

        setNextQuestion();
    }, [sentences]);


    if (sentences) {
        if (sentenceNumber >= 0) {
            return <div className="main-content practice">
                <div className="practice-container">
                    <div className="top-container"><Link to="/home">
                        <div style={{display: "grid"}}><CloseIcon sx={{color: "#9f9f9f"}}/></div>
                    </Link>
                        <div className="progress-bar-container"><LinearProgress variant="determinate"
                                                                                value={correctSentences * 100 / sentences.length}/>
                        </div>
                        <div>{correctSentences}/{sentences.length}</div>
                    </div>
                    <div className="question-component-wrapper">
                        {sentence && <Question sentence={sentence}
                                               sentenceNumber={sentenceNumber}
                                               updateSentence={updateSentence}/>}
                    </div>
                </div>
            </div>;
        } else return <Finished sentences={sentences}/>
    } else return <PracticeLoading/>;
}

export default Practice;
