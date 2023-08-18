import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import useFetchSentences from "../../../hooks/useFetchSentences";
import Question from "../Question/Question";
import Finished from "../Finished";
import PracticeLoading from "../PracticeLoading";
import "./Practice.css";

const Practice = () => {
    const [sentenceNumber, setSentenceNumber] = useState(0);
    const [sentence, setSentence] = useState(null);
    const [sentences, setSentences] = useFetchSentences("api/ai/generatesentences");

    useEffect(() => {
        if (sentences)
            setSentence(sentences[sentenceNumber]);
    }, [sentenceNumber, sentences]);

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

    if (sentences) {
        if (sentenceNumber >= 0) {
            return <div className="practice-wrapper">
                <div className="question-component-wrapper">
                    {sentence &&
                        <Question sentence={sentence} setNextQuestion={setNextQuestion} sentenceNumber={sentenceNumber}
                                  updateSentence={updateSentence}/>}
                </div>
            </div>;
        } else return <Finished sentences={sentences}/>
    } else return <PracticeLoading/>;
}

export default Practice;
