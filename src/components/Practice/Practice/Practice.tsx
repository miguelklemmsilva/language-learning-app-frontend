import { useCallback, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import useFetchSentences from "../../../hooks/useFetchSentences";
import Question from "../Question/Question";
import Finished from "../Finished";
import PracticeLoading from "../PracticeLoading";
import "./Practice.scss";
import { LinearProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useQueryClient } from "@tanstack/react-query";
import { post } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { forgetMasteredSentenceAudio } from "../../../lib/sentenceAudio";
import { PracticeSentence } from "../../../types/practice";

const Practice = () => {
  const [sentenceNumber, setSentenceNumber] = useState(0);
  const [sentence, setSentence] = useState<PracticeSentence | null>(null);
  const [sentences, setSentences, error] = useFetchSentences();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sentences) setSentence(sentences[sentenceNumber] ?? null);
  }, [sentenceNumber, sentences]);

  useEffect(() => {
    if (error && error.code === 0) navigate("/settings");
  }, [error, navigate]);

  const correctSentences = sentences
    ? sentences.filter((item) => item.correct).length
    : 0;

  const updateSentence = useCallback(
    (correct: boolean) => {
      if (!sentences) return;
      const updatedSentences = sentences.map((item, idx) => {
        if (idx === sentenceNumber) {
          if (correct)
            return {
              ...item,
              correct: true,
            };
          else
            return {
              ...item,
              mistakes: item.mistakes + 1,
            };
        }
        return item;
      });
      setSentences(updatedSentences);
    },
    [sentences, setSentences, sentenceNumber]
  );

  useEffect(() => {
    if (!sentences) return;
    const setNextQuestion = () => {
      const exerciseOrder = ["translation", "speaking", "listening"] as const;
      let nextSentence = -1;

      const currentType = sentences[sentenceNumber]?.type;
      for (let i = sentenceNumber + 1; i < sentences.length; i++) {
        const candidate = sentences[i];
        if (candidate && !candidate.correct && candidate.type === currentType) {
          nextSentence = i;
          break;
        }
      }

      if (nextSentence === -1) {
        for (const type of exerciseOrder) {
          for (let i = 0; i < sentences.length; i++) {
            const candidate = sentences[i];
            if (candidate && !candidate.correct && candidate.type === type) {
              nextSentence = i;
              break;
            }
          }
          if (nextSentence !== -1) break;
        }
      }

      if (nextSentence === -1) {
        const finishLesson = async () => {
          const authToken =
            (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

          await post({
            apiName: "LanguageLearningApp",
            path: "/finishlesson",
            options: {
              headers: { Authorization: authToken },
              body: {
                sentences: sentences.map((item) => ({
                  mistakes: item.mistakes,
                  word: item.word,
                  language: item.language,
                  type: item.type,
                })),
              },
            },
          }).response;
          forgetMasteredSentenceAudio(sentences);
        };

        finishLesson().then(() => {
          void queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
        });
      }

      setSentenceNumber(nextSentence);
    };

    setNextQuestion();
    // Run only when the sentence list changes. Re-running on sentenceNumber skips questions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentences]);

  if (error) {
    if (error.code)
      return (
        <div style={{ justifyContent: "center" }} className="main-content no-margin">
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
              Try logging out then logging back in or switching to another language and
              switching back.
            </h2>
          </div>
          <Link to={"/home"} className="button blue generic" style={{ width: "100%" }}>
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
        <div style={{ justifyContent: "center" }} className="main-content no-margin">
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
