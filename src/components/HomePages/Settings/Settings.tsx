import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut as authSignOut } from "aws-amplify/auth";
import { readError } from "../../../api/client";
import { useRemoveLanguage, useSaveLanguage, useSetActiveLanguage, useUserData } from "../../../api/userService";
import { LoadingScreen } from "../../../routes/LoadingScreen";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { Modal } from "../../ui/Modal";
import { LANGUAGES, languageInfo } from "../../../constants/languages";
import { useUserStore } from "../../../stores/userStore";
import { Language, Proficiency, UserLanguage } from "../../../types/api";

const PROFICIENCY = [Proficiency.Beginner, Proficiency.Intermediate, Proficiency.Advanced];

export default function Settings() {
  const queryClient = useQueryClient();
  const clearUserData = useUserStore((state) => state.clearUserData);
  const { data, isLoading, isError, refetch } = useUserData();
  const saveLanguage = useSaveLanguage();
  const setActive = useSetActiveLanguage();
  const removeLanguage = useRemoveLanguage();
  const [drafts, setDrafts] = useState<UserLanguage[]>([]);
  const [adding, setAdding] = useState(false);
  const [pendingCountry, setPendingCountry] = useState<Language | null>(null);

  useEffect(() => {
    setDrafts((data?.userLanguages ?? []).map((item) => ({ ...item })));
  }, [data?.userLanguages]);

  if (isLoading) return <LoadingScreen />;

  if (isError || !data) {
    return (
      <div className="page">
        <div className="page-message">
          <h1 className="title">Could not load settings</h1>
          <PrimaryButton label="Try again" onClick={() => void refetch()} />
        </div>
      </div>
    );
  }

  const available = LANGUAGES.filter((item) => !drafts.some((draft) => draft.language === item.language));

  function updateDraft(language: Language, patch: Partial<UserLanguage>) {
    setDrafts((current) => current.map((item) => (item.language === language ? { ...item, ...patch } : item)));
  }

  function signOut() {
    const confirmed = window.confirm("Sign out? You can sign back in at any time.");
    if (!confirmed) return;
    clearUserData();
    queryClient.clear();
    void authSignOut();
  }

  function add(language: Language, country: string) {
    saveLanguage.mutate(
      {
        language,
        country,
        proficiency: Proficiency.Beginner,
        translation: true,
        listening: true,
        speaking: true,
      },
      {
        onSuccess: () => {
          setAdding(false);
          setPendingCountry(null);
        },
      }
    );
  }

  return (
    <div className="page">
      <div>
        <h1 className="title">Settings</h1>
        {data.user.email ? <p className="muted">{data.user.email}</p> : null}
      </div>
      {drafts.map((draft) => {
        const saved = data.userLanguages?.find((item) => item.language === draft.language);
        const info = languageInfo(draft.language);
        const dirty =
          !saved ||
          saved.country !== draft.country ||
          saved.proficiency !== draft.proficiency ||
          saved.translation !== draft.translation ||
          saved.listening !== draft.listening ||
          saved.speaking !== draft.speaking;
        const active = data.user.activeLanguage === draft.language;

        return (
          <section key={draft.language} className={active ? "language-card active" : "language-card"}>
            <div className="spread">
              <div className="row">
                <span className="flag-lg">{info?.flag}</span>
                <div>
                  <h2 className="section-title" style={{ fontSize: 20 }}>
                    {info?.label}
                  </h2>
                  <p className="muted">{active ? "Active language" : "Saved language"}</p>
                </div>
              </div>
              {active ? null : (
                <button type="button" className="text-button" onClick={() => setActive.mutate(draft.language)}>
                  Set active
                </button>
              )}
            </div>
            <p className="kicker">Country</p>
            <div className="wrap">
              {(info?.countries ?? []).map((country) => {
                const selected = draft.country === country.name;
                return (
                  <button
                    key={country.name}
                    type="button"
                    className={selected ? "chip selected" : "chip"}
                    onClick={() => updateDraft(draft.language, { country: country.name })}
                  >
                    {country.flag} {country.name}
                  </button>
                );
              })}
            </div>
            <p className="kicker">Level</p>
            <div className="wrap">
              {PROFICIENCY.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={draft.proficiency === level ? "chip selected" : "chip"}
                  onClick={() => updateDraft(draft.language, { proficiency: level })}
                >
                  {level}
                </button>
              ))}
            </div>
            <Toggle label="Translation" value={draft.translation} onChange={(translation) => updateDraft(draft.language, { translation })} />
            <Toggle label="Listening" value={draft.listening} onChange={(listening) => updateDraft(draft.language, { listening })} />
            <Toggle label="Speaking" value={draft.speaking} onChange={(speaking) => updateDraft(draft.language, { speaking })} />
            {dirty ? (
              <PrimaryButton
                label="Save"
                loading={saveLanguage.isPending}
                onClick={() =>
                  saveLanguage.mutate({
                    language: draft.language,
                    proficiency: draft.proficiency,
                    country: draft.country,
                    translation: draft.translation,
                    listening: draft.listening,
                    speaking: draft.speaking,
                  })
                }
              />
            ) : null}
            <button
              type="button"
              className="text-button danger"
              onClick={() => {
                const confirmed = window.confirm(
                  `Remove ${info?.label}? Words for this language stay saved if you add it again.`
                );
                if (confirmed) removeLanguage.mutate(draft.language);
              }}
            >
              Remove language
            </button>
          </section>
        );
      })}
      {available.length > 0 ? (
        <PrimaryButton label="Add a language" tone="quiet" onClick={() => setAdding(true)} />
      ) : null}
      {saveLanguage.isError ? <p className="bad-text">{readError(saveLanguage.error)}</p> : null}
      {setActive.isError ? <p className="bad-text">{readError(setActive.error)}</p> : null}
      {removeLanguage.isError ? <p className="bad-text">{readError(removeLanguage.error)}</p> : null}
      <button type="button" className="text-button danger" onClick={signOut} style={{ alignSelf: "center" }}>
        Sign out
      </button>
      <Modal
        open={adding}
        title={pendingCountry ? "Choose a country" : "Add a language"}
        onClose={() => {
          setAdding(false);
          setPendingCountry(null);
        }}
      >
        <div className="stack-tight">
          {pendingCountry
            ? languageInfo(pendingCountry)?.countries.map((country) => (
                <button
                  key={country.name}
                  type="button"
                  className="language-row"
                  onClick={() => add(pendingCountry, country.name)}
                >
                  <span className="flag-lg">{country.flag}</span>
                  {country.name}
                </button>
              ))
            : available.map((item) => (
                <button
                  key={item.language}
                  type="button"
                  className="language-row"
                  onClick={() => {
                    const only = item.countries[0];
                    if (item.countries.length === 1 && only) add(item.language, only.name);
                    else setPendingCountry(item.language);
                  }}
                >
                  <span className="flag-lg">{item.flag}</span>
                  {item.label}
                </button>
              ))}
        </div>
        {saveLanguage.isPending ? <p className="muted">Saving…</p> : null}
        {saveLanguage.isError ? <p className="bad-text">{readError(saveLanguage.error)}</p> : null}
      </Modal>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button
        type="button"
        className="switch"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
      >
        <i />
      </button>
    </div>
  );
}
