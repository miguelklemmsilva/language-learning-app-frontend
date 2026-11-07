import { RefObject, useState } from "react";
import AnswerInput from "../AnswerInput";
import TranslationSubmitArea from "./TranslationSubmitArea";
import CustomTooltip from "../../CustomTooltip";
import { fetchAuthSession } from "aws-amplify/auth";
import { post } from "aws-amplify/api";
import { readJson } from "../../../../api/readJson";
import { VerifySentenceResponse } from "../../../../types/api";
import { PracticeSentence, VerifySentenceResult } from "../../../../types/practice";

interface AlignmentRange {
  original: { start: number; end: number };
  translated: { start: number; end: number };
}

interface TranslationProps {
  sentence: PracticeSentence;
  textarea: RefObject<HTMLTextAreaElement>;
  answer: string;
  result: string | null;
  handleInputChange: (event: { target: { value: string } }) => void;
  handleSubmit: (correct: boolean, feedback: string) => void;
  cleanString: (value: string) => string;
  handleNextSentence: (correct: boolean | null) => void;
  cleanEmptyArea: (value: string) => string;
}

const Translation = ({
  sentence,
  textarea,
  answer,
  result,
  handleInputChange,
  handleSubmit,
  cleanString,
  handleNextSentence,
  cleanEmptyArea,
}: TranslationProps) => {
  const [correct, setCorrect] = useState<VerifySentenceResult | false>(false);

  const setSentenceCorrectness = (isCorrect: boolean) => {
    handleSubmit(isCorrect, sentence.original);
    handleNextSentence(isCorrect);
  };

  const formatAlignment = (alignment?: string | null): AlignmentRange[] => {
    if (!alignment) return [];
    const items = alignment.split(" ");
    const formattedObjects: AlignmentRange[] = [];
    for (const item of items) {
      const [original, translated] = item.split("-");
      if (!original || !translated) continue;
      const [originalStart, originalEnd] = original.split(":");
      const [translatedStart, translatedEnd] = translated.split(":");
      if (
        originalStart === undefined ||
        originalEnd === undefined ||
        translatedStart === undefined ||
        translatedEnd === undefined
      ) {
        continue;
      }

      formattedObjects.push({
        original: {
          start: parseInt(originalStart),
          end: parseInt(originalEnd),
        },
        translated: {
          start: parseInt(translatedStart),
          end: parseInt(translatedEnd),
        },
      });
    }
    return formattedObjects;
  };

  function sanitizeInput(input: string) {
    return input.replace(/[^\u0000-\u007F]/g, function (char) {
      return "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0");
    });
  }

  const renderTranslation = () => {
    const alignments = formatAlignment(sentence.alignment);
    const translation = sentence.translation;
    const original = sentence.original;
    if (!translation) return null;

    const components: Array<string | { index: number; word: string | null; text: string }> =
      [];
    let buffer: string[] = [];
    let currentWord: string | null = null;

    const isPunctuation = (char: string) => /[.,?!¡¿]/.test(char);

    for (let index = 0; index < translation.length; index++) {
      const char = translation[index];
      if (char === undefined) continue;
      const matchedRange = alignments.find(
        (range) => index >= range.translated.start && index <= range.translated.end
      );

      if (matchedRange && !isPunctuation(char)) {
        const word = original.slice(
          matchedRange.original.start,
          matchedRange.original.end + 1
        );

        if (currentWord && currentWord === word) {
          buffer.push(char);
        } else {
          if (buffer.length && !isPunctuation(buffer.join(""))) {
            components.push({
              index: index - buffer.length,
              word: currentWord,
              text: buffer.join(""),
            });
            buffer = [];
          }
          buffer.push(char);
          currentWord = word;
        }
      } else {
        if (buffer.length && !isPunctuation(buffer.join(""))) {
          components.push({
            index: index - buffer.length,
            word: currentWord,
            text: buffer.join(""),
          });
          buffer = [];
        }
        currentWord = null;
        components.push(char);
      }
    }

    if (buffer.length && !isPunctuation(buffer.join(""))) {
      components.push({
        index: translation.length - buffer.length,
        word: currentWord,
        text: buffer.join(""),
      });
    }

    return components.map((comp) => {
      if (typeof comp === "string") return comp;
      else {
        return (
          <CustomTooltip placement="bottom" key={comp.index} title={comp.word ?? ""} arrow>
            <div className={`word`}>{comp.text}</div>
          </CustomTooltip>
        );
      }
    });
  };

  const checkTranslation = async (): Promise<VerifySentenceResult> => {
    const comparisonString = cleanEmptyArea(sentence.original);

    const exact = cleanString(answer) === cleanString(comparisonString);

    if (exact) return { isCorrect: true, exact: true };

    try {
      const authToken =
        (await fetchAuthSession()).tokens?.idToken?.toString() ?? "";

      const response = await post({
        apiName: "LanguageLearningApp",
        path: "/verifysentence",
        options: {
          headers: { Authorization: authToken },
          body: {
            original: cleanEmptyArea(sentence.translation ?? ""),
            translation: sanitizeInput(answer),
            language: sentence.language,
          },
        },
      }).response;

      const verified = await readJson<VerifySentenceResponse>(response);
      return verified;
    } catch (e) {
      console.error(e);
      return { isCorrect: false, exact: false };
    }
  };

  const onSubmit = async () => {
    const verification = await checkTranslation();
    console.log(verification);
    setCorrect(verification);
    handleSubmit(verification.isCorrect, sentence.original);
  };

  return (
    <div className="question-container">
      <div className="question-type">
        Translate the sentence into {sentence.language}
        <div className="help-txt">Click on the highlighted words for help!</div>
      </div>
      <div className="translation-text">{renderTranslation()}</div>
      <AnswerInput
        ref={textarea}
        value={answer}
        result={result}
        onChange={handleInputChange}
        onSubmit={onSubmit}
        language={sentence.language}
      />
      <TranslationSubmitArea
        sentence={sentence}
        onSubmit={onSubmit}
        result={result}
        correct={correct}
        answer={answer}
        setSentenceCorrectness={setSentenceCorrectness}
      />
    </div>
  );
};

export default Translation;
