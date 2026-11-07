import SpeakingInput from "./SpeakingInput";
import ListeningButton from "../Listening/ListeningButton";
import { useRef, useState, Dispatch, ReactNode, SetStateAction } from "react";
import SpeakingOutput from "./SpeakingOutput";
import SpeakingSubmit from "./SpeakingSubmit";
import { PracticeSentence, QuestionResult } from "../../../../types/practice";

interface SpeakingProps {
  sentence: PracticeSentence;
  result: QuestionResult;
  setResult: Dispatch<SetStateAction<QuestionResult>>;
  handleNextSentence: (correct: boolean | null) => void;
}

const Speaking = ({ sentence, result, setResult, handleNextSentence }: SpeakingProps) => {
  const [listening, setListening] = useState(false);
  const [output, setOutput] = useState<ReactNode>(null);
  const [scores, setScores] = useState<ReactNode>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement>(null);

  const onSubmit = () => {
    setScores(null);
    setOutput(null);
    if (audioElementRef.current) audioElementRef.current.src = "";
    chunksRef.current = [];
    handleNextSentence(true);
  };

  return (
    <div className="question-container">
      <div className="question-type">
        Repeat the sentence
        <div className="help-txt">
          Press the speaker button to listen to the sentence. Press the microphone button
          and start speaking.
        </div>
      </div>
      <div className="translation-text">{sentence.original}</div>
      <div className="speaking-btns-container">
        <ListeningButton sentence={sentence} />
        <SpeakingInput
          sentence={sentence}
          setResult={setResult}
          listening={listening}
          setListening={setListening}
          chunksRef={chunksRef}
          audioElementRef={audioElementRef}
          setScores={setScores}
        />
      </div>
      <SpeakingOutput
        result={result}
        output={output}
        setOutput={setOutput}
        scores={scores}
        setScores={setScores}
        sentence={sentence}
      />
      <SpeakingSubmit result={result} listening={listening} onSubmit={onSubmit} />
    </div>
  );
};

export default Speaking;
