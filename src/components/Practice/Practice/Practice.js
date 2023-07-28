import {useState} from "react";
import axios from "axios";
import useFetchSentences from "../../../hooks/useFetchSentences";
import Question from "../Question/Question";
import Finished from "../Finished";
import PracticeLoading from "../PracticeLoading";
import "./Practice.css";

const Practice = () => {
    const [sentenceNumber, setSentenceNumber] = useState(0);
    const [sentences, setSentences] = useFetchSentences("api/ai/generatesentences");

    axios.defaults.withCredentials = true;

    const updateSentence = (index, correct) => {
        const updatedSentences = sentences.map((sentence, idx) => {
            if (idx === index) {
                if (correct) return {
                    ...sentence, correct: true,
                }; else return {
                    ...sentence, mistakes: sentence.mistakes + 1,
                }
            }
            return sentence;
        });
        setSentences(updatedSentences);
    };

    const getSentence = () => {
        return sentences[sentenceNumber];
    };

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
                    <Question sentence={getSentence()} setNextQuestion={setNextQuestion} sentenceNumber={sentenceNumber}
                              updateSentence={updateSentence}/>
                </div>
            </div>;
        } else return <Finished sentences={sentences}/>
    } else return <PracticeLoading/>;
}

export default Practice;
