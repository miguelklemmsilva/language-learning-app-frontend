import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../../../api/userService";
import { LoadingScreen } from "../../../routes/LoadingScreen";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { Icon } from "../../ui/Icon";
import { LessonComplete } from "../LessonComplete";
import { ListeningQuestion } from "../ListeningQuestion";
import { SpeakingQuestion } from "../SpeakingQuestion";
import { TranslationQuestion } from "../TranslationQuestion";
import { useLesson } from "../../../hooks/useLesson";
import { isRecording, stopPlayback, stopRecording } from "../../../lib/speech";

export default function Practice() {
  const navigate = useNavigate();
  const { data, isLoading } = useUserData();
  const active = data?.userLanguages?.find((item) => item.language === data.user.activeLanguage);
  const lesson = useLesson(active);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (isRecording()) void stopRecording();
    };
  }, []);

  function leave() {
    if (lesson.status === "ready") {
      const confirmed = window.confirm("Leave lesson? Progress is saved when you finish the lesson.");
      if (!confirmed) return;
    }
    navigate("/home");
  }

  if (isLoading || (!active && lesson.status === "loading")) {
    return <LoadingScreen label="Preparing your lesson…" />;
  }

  const progress = lesson.sentences.length === 0 ? 0 : lesson.solved / lesson.sentences.length;

  return (
    <div className="practice-screen">
      <div className="practice-header">
        <button type="button" className="icon-button" onClick={leave} aria-label="Close lesson">
          <Icon name="close" size={26} />
        </button>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="practice-count">
          {lesson.sentences.length === 0 ? "" : `${lesson.solved}/${lesson.sentences.length}`}
        </div>
      </div>
      <div className="practice-body">
        {lesson.status === "loading" ? (
          <div className="page-message">
            <span className="spinner" />
            <p className="muted">Writing sentences…</p>
          </div>
        ) : null}
        {lesson.status === "empty" ? (
          <div className="page-message">
            <h1 className="title">Nothing is due</h1>
            <p className="muted">Add words, or come back when the ones you already know are ready to review.</p>
            <PrimaryButton label="Go to words" onClick={() => navigate("/vocabulary", { replace: true })} />
          </div>
        ) : null}
        {lesson.status === "error" ? (
          <div className="page-message">
            <h1 className="title">Could not start the lesson</h1>
            <p className="muted">{lesson.errorMessage}</p>
            <PrimaryButton label="Back home" onClick={() => navigate("/home")} />
          </div>
        ) : null}
        {lesson.status === "ready" && lesson.current?.type === "translation" ? (
          <TranslationQuestion
            key={`${lesson.index}-${lesson.attempt}`}
            sentence={lesson.current}
            onGrade={lesson.grade}
            onWordAdded={lesson.noteAddedWord}
            onWordRevision={lesson.noteRevisionWord}
            canComeBackLater={lesson.sentences.some(
              (item, itemIndex) => itemIndex !== lesson.index && !item.correct && item.type === "translation"
            )}
          />
        ) : null}
        {lesson.status === "ready" && lesson.current?.type === "listening" ? (
          <ListeningQuestion
            key={`${lesson.index}-${lesson.attempt}`}
            sentence={lesson.current}
            token={lesson.token}
            speechHost={lesson.speechHost}
            onGrade={lesson.grade}
          />
        ) : null}
        {lesson.status === "ready" && lesson.current?.type === "speaking" ? (
          <SpeakingQuestion
            key={`${lesson.index}-${lesson.attempt}`}
            sentence={lesson.current}
            token={lesson.token}
            speechHost={lesson.speechHost}
            onGrade={lesson.grade}
          />
        ) : null}
        {lesson.status === "done" ? (
          <LessonComplete
            sentences={lesson.sentences}
            addedWords={lesson.addedWords}
            revisionWords={lesson.revisionWords}
            saving={lesson.saving}
            error={lesson.finishError}
            onRetry={lesson.retrySave}
            onDone={() => navigate("/home")}
          />
        ) : null}
      </div>
    </div>
  );
}
