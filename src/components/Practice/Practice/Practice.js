import {useCallback, useEffect, useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import useFetchSentences from "../../../hooks/useFetchSentences";
import Question from "../Question/Question";
import Finished from "../Finished";
import PracticeLoading from "../PracticeLoading";
import "./Practice.scss";
import {LinearProgress} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const Practice = () => {
    const [sentenceNumber, setSentenceNumber] = useState(0);
    const [sentence, setSentence] = useState(null);
    const [sentences, setSentences, error] = useFetchSentences("api/ai/generatesentences");
    const {isAuthenticated, isLoading} = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (sentences) setSentence(sentences[sentenceNumber]);
    }, [sentenceNumber, sentences]);

    useEffect(() => {
        if (isAuthenticated == null)
            return;
        if (!isAuthenticated && !isLoading)
            navigate("/");
        if (error && error.code === 0)
            navigate("/settings");
    }, [isAuthenticated, isLoading, error]);

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

    if (error) return (
        <div className="main-content practice">
            <div className="practice-container">
                <h1>No words to practice!</h1>
                <h2>Add some words into your vocabulary table to practice</h2>
                <Link to={"/vocabularytable"} className="button blue generic" style={{width: "100%"}}>
                    <div className="button-txt">Go to vocabulary table</div>
                    <div className="arrow-wrapper"><ArrowForwardIcon/></div>
                </Link>
            </div>
        </div>
    );

    if (sentences) {
        if (sentenceNumber >= 0) {
            return <div className="main-content practice">
                <div className="practice-container">
                    <div className="top-container"><Link to="/home">
                        <div style={{display: "grid", padding: "10px"}}><CloseIcon sx={{color: "#9f9f9f"}}/></div>
                    </Link>
                        <div className="progress-bar-container"><LinearProgress variant="determinate"
                                                                                value={correctSentences * 100 / sentences.length}/>
                        </div>
                        <div style={{padding: "10px"}}>{correctSentences}/{sentences.length}</div>
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
