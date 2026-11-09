import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { readError } from "../../api/client";
import { useSaveLanguage } from "../../api/userService";
import { LANGUAGES, languageInfo } from "../../constants/languages";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Icon } from "../ui/Icon";
import { Language, Proficiency } from "../../types/api";

const LEVELS = [Proficiency.Beginner, Proficiency.Intermediate, Proficiency.Advanced];

export function OnboardingLanguage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Language | null>(null);

  return (
    <div className="stack">
      <h1 className="title">Choose your language</h1>
      <div className="choice-grid">
        {LANGUAGES.map((item) => {
          const isSelected = selected === item.language;
          return (
            <button
              key={item.language}
              type="button"
              className={isSelected ? "choice-card selected" : "choice-card"}
              onClick={() => setSelected(item.language)}
            >
              {isSelected ? (
                <span className="check">
                  <Icon name="check" size={24} />
                </span>
              ) : null}
              <span className="flag-lg">{item.flag}</span>
              {item.label}
            </button>
          );
        })}
      </div>
      <PrimaryButton
        label="Continue"
        disabled={selected === null}
        onClick={() => {
          if (selected) navigate(`/onboarding/level?language=${encodeURIComponent(selected)}`);
        }}
      />
    </div>
  );
}

export function OnboardingLevel() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const language = params.get("language") as Language | null;
  const info = languageInfo(language);
  const [selected, setSelected] = useState<Proficiency | null>(null);

  if (!info) {
    return (
      <div className="stack">
        <h1 className="title">That language is not available.</h1>
        <PrimaryButton label="Back" onClick={() => navigate("/onboarding", { replace: true })} />
      </div>
    );
  }

  return (
    <div className="stack">
      <h1 className="title">How comfortable are you?</h1>
      <div className="stack-tight">
        {LEVELS.map((level) => {
          const isSelected = selected === level;
          return (
            <button
              key={level}
              type="button"
              className={isSelected ? "choice-card selected" : "choice-card"}
              onClick={() => setSelected(level)}
            >
              {isSelected ? (
                <span className="check">
                  <Icon name="check" size={24} />
                </span>
              ) : null}
              {level}
            </button>
          );
        })}
      </div>
      <PrimaryButton
        label="Continue"
        disabled={selected === null}
        onClick={() => {
          if (selected && language) {
            navigate(
              `/onboarding/country?language=${encodeURIComponent(language)}&proficiency=${encodeURIComponent(selected)}`
            );
          }
        }}
      />
    </div>
  );
}

export function OnboardingCountry() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const language = params.get("language") as Language | null;
  const proficiency = (params.get("proficiency") as Proficiency | null) || Proficiency.Beginner;
  const info = languageInfo(language);
  const countries = info?.countries ?? [];
  const saveLanguage = useSaveLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const started = useRef(false);

  async function save(country: string) {
    if (!language) return;
    try {
      await saveLanguage.mutateAsync({
        language,
        proficiency,
        country,
        translation: true,
        listening: true,
        speaking: true,
      });
      navigate("/home", { replace: true });
    } catch {
      // The button stays available so the save can be tried again.
    }
  }

  useEffect(() => {
    const onlyCountry = countries.length === 1 ? countries[0] : undefined;
    if (!onlyCountry || started.current || !language) return;
    started.current = true;
    void save(onlyCountry.name);
    // Save once when this language has a single country.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  if (!info || !language) {
    return (
      <div className="stack">
        <h1 className="title">That language is not available.</h1>
        <PrimaryButton label="Back" onClick={() => navigate("/onboarding", { replace: true })} />
      </div>
    );
  }

  if (countries.length <= 1) {
    const onlyCountry = countries[0];
    return (
      <div className="stack">
        <h1 className="title">{saveLanguage.isError ? "Could not save your language." : "Saving your preferences…"}</h1>
        {saveLanguage.isError ? <p className="bad-text">{readError(saveLanguage.error)}</p> : null}
        {saveLanguage.isError && onlyCountry ? (
          <PrimaryButton label="Try again" onClick={() => void save(onlyCountry.name)} loading={saveLanguage.isPending} />
        ) : (
          <span className="spinner" />
        )}
      </div>
    );
  }

  return (
    <div className="stack">
      <h1 className="title">Where will you learn from?</h1>
      <div className="choice-grid">
        {countries.map((country) => {
          const isSelected = selected === country.name;
          return (
            <button
              key={country.name}
              type="button"
              className={isSelected ? "choice-card selected" : "choice-card"}
              onClick={() => setSelected(country.name)}
            >
              {isSelected ? (
                <span className="check">
                  <Icon name="check" size={24} />
                </span>
              ) : null}
              <span className="flag-lg">{country.flag}</span>
              {country.name}
            </button>
          );
        })}
      </div>
      <PrimaryButton
        label={saveLanguage.isPending ? "Saving…" : "Finish"}
        disabled={!selected || saveLanguage.isPending}
        loading={saveLanguage.isPending}
        onClick={() => {
          if (selected) void save(selected);
        }}
      />
      {saveLanguage.isError ? <p className="bad-text">{readError(saveLanguage.error)}</p> : null}
    </div>
  );
}
