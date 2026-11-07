import { useEffect, useState } from "react";
import "../SubmitArea.scss";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { CircularProgress } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ListeningButton from "../Listening/ListeningButton";
import Divider from "@mui/material/Divider";
import { PracticeSentence, VerifySentenceResult } from "../../../../types/practice";

interface TranslationSubmitAreaProps {
  onSubmit: () => void;
  result: string | null;
  sentence: PracticeSentence;
  correct: VerifySentenceResult | false;
  answer: string;
  setSentenceCorrectness?: (isCorrect: boolean) => void;
}

const TranslationSubmitArea = ({
  onSubmit,
  result,
  sentence,
  correct,
  answer,
  setSentenceCorrectness,
}: TranslationSubmitAreaProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCorrectClick = () => {
    if (setSentenceCorrectness) {
      setSentenceCorrectness(true);
    }
  };

  const handleIncorrectClick = () => {
    if (setSentenceCorrectness) {
      setSentenceCorrectness(false);
    }
  };

  useEffect(() => {
    if (result) setIsLoading(false);
  }, [result]);

  if (!result || correct === false)
    return (
      <div className="submit-wrapper">
        <button
          className={`button blue submit-btn${answer ? "" : " inactive"}`}
          disabled={isLoading || !answer}
          onClick={() => {
            onSubmit();
            setIsLoading(true);
          }}
        >
          {" "}
          {isLoading ? (
            <CircularProgress size="18px" color="inherit" />
          ) : (
            <div>Submit</div>
          )}
        </button>
      </div>
    );

  const verdict = correct.verdict ?? (correct.isCorrect ? "correct" : "incorrect");
  const tone =
    verdict === "technicallyCorrect" ? "technically-correct" : verdict;
  const title =
    verdict === "technicallyCorrect"
      ? "Technically correct"
      : verdict === "correct"
        ? "Correct!"
        : "Incorrect";

  return (
    <div className={`submit-wrapper ${tone}`}>
      <div className="feedback">
        <div style={{ display: "grid", placeItems: "center" }}>
          <div className="visual-feedback">
            {verdict === "incorrect" ? (
              <ClearIcon sx={{ font: "inherit" }} />
            ) : (
              <CheckIcon sx={{ font: "inherit" }} />
            )}
          </div>
        </div>
        <div>
          <div className="feedback-title">
            {title}&nbsp;
            <div className="true-center">
              <ListeningButton sentence={sentence} small={true} />
            </div>
          </div>
          <div>
            <div dangerouslySetInnerHTML={{ __html: result }}></div>
            {verdict !== "correct" && correct.explanation && (
              <>
                <div style={{ marginBottom: "10px" }}></div>
                <Divider />
                <div style={{ marginTop: "10px" }}> {correct.explanation}</div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="sentence-eval-buttons-wrapper">
        <button
          className="button eval"
          onClick={() => {
            if (correct.isCorrect) handleCorrectClick();
            else handleIncorrectClick();
          }}
        >
          CONTINUE&nbsp;
          <div className="arrow-wrapper">
            <ArrowForwardIcon />
          </div>
        </button>
        {!correct.isCorrect && !correct.explanation && (
          <button
            className="button change-result"
            onClick={() => {
              handleCorrectClick();
            }}
          >
            The translation was actually correct!
          </button>
        )}
        {correct.isCorrect && !correct.exact && (
          <button
            className="button change-result"
            onClick={() => {
              handleIncorrectClick();
            }}
          >
            The translation was actually incorrect!
          </button>
        )}
      </div>
    </div>
  );
};

export default TranslationSubmitArea;
