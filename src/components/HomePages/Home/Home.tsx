import { useNavigate } from "react-router-dom";
import { useUserData } from "../../../api/userService";
import { useVocabulary } from "../../../api/vocabularyService";
import { LoadingScreen } from "../../../routes/LoadingScreen";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { Icon, IconName } from "../../ui/Icon";
import { WordRow } from "../../words/WordRow";
import { countryInfo, languageInfo } from "../../../constants/languages";
import { formatMinutes } from "../../../lib/text";
import { dueWords, nextDueMinutes } from "../../../lib/words";

const EXERCISES: { key: "translation" | "listening" | "speaking"; label: string; icon: IconName }[] = [
  { key: "translation", label: "Translate", icon: "language" },
  { key: "listening", label: "Listen", icon: "headset" },
  { key: "speaking", label: "Speak", icon: "mic" },
];

export default function Home() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useUserData();
  const activeLanguage = data?.user.activeLanguage;
  const active = data?.userLanguages?.find((item) => item.language === activeLanguage);
  const vocabulary = useVocabulary(activeLanguage);
  const info = languageInfo(activeLanguage);
  const country = countryInfo(activeLanguage, active?.country);
  const words = vocabulary.data ?? [];
  const due = dueWords(words);
  const exercisesOn = Boolean(active?.translation || active?.listening || active?.speaking);
  const upcoming = nextDueMinutes(words);

  if (isLoading || vocabulary.isLoading || !activeLanguage) return <LoadingScreen />;

  if (isError || vocabulary.isError || !data || !active || !info) {
    return (
      <div className="page">
        <div className="page-message">
          <h1 className="title">Could not load your studies</h1>
          <PrimaryButton
            label="Try again"
            onClick={() => {
              void refetch();
              void vocabulary.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  let actionLabel = "Practice";
  let actionPath = "/practice";
  let actionDetail = due.length === 1 ? "1 word is ready." : `${due.length} words are ready.`;
  if (!exercisesOn) {
    actionLabel = "Choose exercises";
    actionPath = "/settings";
    actionDetail = "Turn on translation, listening, or speaking.";
  } else if (due.length === 0 && words.length === 0) {
    actionLabel = "Add words";
    actionPath = "/vocabulary";
    actionDetail = "Start with a few words you want to learn.";
  } else if (due.length === 0) {
    actionLabel = "Review words";
    actionPath = "/vocabulary";
    actionDetail = upcoming === null ? "You are caught up." : `Next review ${formatMinutes(upcoming).toLowerCase()}.`;
  }

  return (
    <div className="page">
      <div className="spread">
        <div>
          <p className="kicker">Studying</p>
          <h1 className="title">{info.label}</h1>
          <p className="muted">
            {country?.flag} {active.country}
          </p>
        </div>
        <span className="flag-xl">{info.flag}</span>
      </div>
      <section className="hero">
        <p className="hero-count">{due.length}</p>
        <p className="muted" style={{ marginTop: -8 }}>
          {actionDetail}
        </p>
        <div className="wrap">
          {EXERCISES.map((exercise) => {
            const enabled = Boolean(active[exercise.key]);
            return (
              <span key={exercise.key} className={enabled ? "exercise-chip on" : "exercise-chip"}>
                <Icon name={exercise.icon} size={16} />
                {exercise.label}
              </span>
            );
          })}
        </div>
        <PrimaryButton label={actionLabel} onClick={() => navigate(actionPath)} />
      </section>
      <div className="spread">
        <h2 className="section-title">Due now</h2>
        <button type="button" className="text-button" onClick={() => navigate("/vocabulary")}>
          All words
        </button>
      </div>
      {due.length === 0 ? (
        <p className="muted">{words.length === 0 ? "Your word list is empty." : "Nothing is due. Enjoy the break."}</p>
      ) : (
        <div className="stack-tight">
          {due.slice(0, 8).map((word) => (
            <WordRow key={word.word} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}
