import { useCallback, useContext, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import useFetchSentences from "../../../hooks/useFetchSentences";
import Question from "../Question/Question";
import Finished from "../Finished";
import PracticeLoading from "../PracticeLoading";
import "./Practice.scss";
import { LinearProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { HomeRouteContext } from "../../../contexts/HomeRouteContext";
import { post } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";

const Practice = () => {
  const [sentenceNumber, setSentenceNumber] = useState(0);
  const [sentence, setSentence] = useState(null);
  const [sentences, setSentences, error] = useFetchSentences();
  const navigate = useNavigate();
  const { updateVocabTable } = useContext(HomeRouteContext);

  useEffect(() => {
    if (sentences) setSentence(sentences[sentenceNumber]);
  }, [sentenceNumber, sentences]);

  useEffect(() => {
    if (error && error.code === 0) navigate("/settings");
  }, [error]);

  const correctSentences = sentences
    ? sentences.filter((sentence) => sentence.correct).length
    : 0;

  const updateSentence = useCallback(
    (correct) => {
      const updatedSentences = sentences.map((sentence, idx) => {
        if (idx === sentenceNumber) {
          if (correct)
            return {
              ...sentence,
              correct: true,
            };
          else
            return {
              ...sentence,
              mistakes: sentence.mistakes + 1,
            };
        }
        return sentence;
      });
      setSentences(updatedSentences);
    },
    [sentences, setSentences, sentenceNumber]
  );

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

      if (nextSentence === -1) {
        const finishLesson = async () => {
          const filteredSentences = sentences.map((sentence) => ({
            mistakes: sentence.mistakes,
            word: sentence.word,
            language: sentence.language,
            type: sentence.type,
          }));

          const authToken =
            (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

          await post({
            apiName: "LanguageLearningApp",
            path: "/finishlesson",
            options: {
              headers: { Authorization: authToken },
              body: { sentences: filteredSentences },
            },
          }).response;
        };

        finishLesson().then(() => {
          updateVocabTable();
        });
      }

      setSentenceNumber(nextSentence);
    };

    setNextQuestion();
  }, [sentences]);

  if (error) {
    if (error.code)
      return (
        <div
          style={{ justifyContent: "center" }}
          className="main-content no-margin"
        >
          <div className="practice-container">
            <h1>No words to practice!</h1>
            <h2>Add some words into your vocabulary table to practice</h2>
            <Link
              to={"/vocabularytable"}
              className="button blue generic"
              style={{ width: "100%" }}
            >
              <div className="button-txt">Go to vocabulary table</div>
              <div className="arrow-wrapper">
                <ArrowForwardIcon />
              </div>
            </Link>
          </div>
        </div>
      );
    else
      return (
        <div className="main-content no-margin">
          <div className="practice-container">
            <h1>Something went wrong while generating sentences!</h1>
            <h2>
              Try logging out then logging back in or switching to another
              language and switching back.
            </h2>
          </div>
          <Link
            to={"/home"}
            className="button blue generic"
            style={{ width: "100%" }}
          >
            <div className="button-txt">Go Home</div>
            <div className="arrow-wrapper">
              <ArrowForwardIcon />
            </div>
          </Link>
        </div>
      );
  }

  if (sentences) {
    if (sentenceNumber >= 0) {
      return (
        <div
          style={{ justifyContent: "center" }}
          className="main-content no-margin"
        >
          <div className="practice-container">
            <div className="top-container">
              <Link to="/home">
                <div style={{ display: "grid", padding: "10px" }}>
                  <CloseIcon sx={{ color: "#9f9f9f" }} />
                </div>
              </Link>
              <div className="progress-bar-container">
                <LinearProgress
                  variant="determinate"
                  value={(correctSentences * 100) / sentences.length}
                />
              </div>
              <div style={{ padding: "10px" }}>
                {correctSentences}/{sentences.length}
              </div>
            </div>
            <div className="question-component-wrapper">
              {sentence && (
                <Question
                  sentence={sentence}
                  sentenceNumber={sentenceNumber}
                  updateSentence={updateSentence}
                />
              )}
            </div>
          </div>
        </div>
      );
    } else return <Finished sentences={sentences} />;
  } else return <PracticeLoading />;
};

export default Practice;
