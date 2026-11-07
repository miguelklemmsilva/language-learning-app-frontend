import CollapsibleForm from "./CollapsibleForm";
import LanguageDropdown from "./LanguageDropdown";
import "./Settings.scss";
import { createDefaultSettings, languages } from "../../../constants/languages";
import { useActiveLanguageSelection } from "../../../hooks/useActiveLanguageSelection";
import {
  useRemoveLanguage,
  useSaveLanguage,
  useSetActiveLanguage,
} from "../../../api/userService";
import { useLanguageStore } from "../../../stores/languageStore";
import { LanguageOption } from "../../../types/language";

function Settings() {
  const { activeLanguage, selectedLanguages, initialLanguages } =
    useActiveLanguageSelection();
  const updateDraft = useLanguageStore((state) => state.updateDraft);
  const addLanguage = useLanguageStore((state) => state.addLanguage);
  const setActiveLanguage = useSetActiveLanguage();
  const removeLanguage = useRemoveLanguage();
  const saveLanguage = useSaveLanguage();

  const handleLanguageSelect = (language: LanguageOption) => {
    const draft: LanguageOption = {
      ...language,
      settings: createDefaultSettings(),
    };
    const isFirst = useLanguageStore.getState().selectedLanguages.length === 0;
    addLanguage(draft);
    if (isFirst) setActiveLanguage.mutate(draft.name);
    saveLanguage.mutate(draft);
  };

  return (
    <div className="main-content">
      <div className="content-container">
        <div className="collapsible-form-container">
          {selectedLanguages.map((item) => (
            <CollapsibleForm
              key={item.name}
              language={item}
              isActive={item.name === activeLanguage}
              setActive={() => setActiveLanguage.mutate(item.name)}
              onRemove={() => removeLanguage.mutate(item.name)}
              initialSettings={
                initialLanguages.find((lang) => lang.name === item.name)?.settings
              }
              handleSave={() => saveLanguage.mutate(item)}
              onOptionsChange={updateDraft}
            />
          ))}
        </div>
        <LanguageDropdown
          onLanguageSelect={handleLanguageSelect}
          selectedOptions={selectedLanguages}
          languages={languages}
        />
      </div>
    </div>
  );
}

export default Settings;
