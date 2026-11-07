import { RefObject, useState } from "react";
import ListeningButton from "./ListeningButton";
import AnswerInput from "../AnswerInput";
import ListeningSubmitArea from "./ListeningSubmitArea";
import { PracticeSentence } from "../../../../types/practice";

interface ListeningProps {
  sentence: PracticeSentence;
  textarea: RefObject<HTMLTextAreaElement>;
  answer: string;
  handleInputChange: (event: { target: { value: string } }) => void;
  handleSubmit: (correct: boolean, feedback: string) => void;
  result: string | null;
  cleanString: (value: string) => string;
  handleNextSentence: (correct: boolean | null) => void;
}

const Listening = ({
  sentence,
  textarea,
  answer,
  handleInputChange,
  handleSubmit,
  result,
  cleanString,
  handleNextSentence,
}: ListeningProps) => {
  const [correct, setCorrect] = useState(false);

  const onSubmit = () => {
    const isCorrect =
      cleanString(answer).toLowerCase() === cleanString(sentence.original).toLowerCase();
    setCorrect(isCorrect);
    const feedback = isCorrect ? sentence.translation ?? "" : sentence.original;
    handleSubmit(isCorrect, feedback);
  };

  return (
    <div className="question-container">
      <div className="question-type">
        Write what you hear
        <div className="help-txt">Click the speaker button to listen to the sentence</div>
      </div>
      <ListeningButton sentence={sentence} />
      <AnswerInput
        ref={textarea}
        value={answer}
        result={result}
        onChange={handleInputChange}
        onSubmit={onSubmit}
        language={sentence.language}
      />
      <ListeningSubmitArea
        sentence={sentence}
        onSubmit={onSubmit}
        result={result}
        correct={correct}
        answer={answer}
        handleNextSentence={handleNextSentence}
      />
    </div>
  );
};

export default Listening;
