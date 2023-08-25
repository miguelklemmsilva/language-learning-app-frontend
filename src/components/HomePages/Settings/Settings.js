import CollapsibleForm from "./CollapsibleForm";
import LanguageDropdown from "./LanguageDropdown";
import {useContext} from "react";
import "./Settings.scss";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";

function Settings({}) {
    const context = useContext(HomeRouteContext);

    return (<div className="main-content">
        {context && <div className="content-container">
            <div className="collapsible-form-container">
                {context.selectedLanguages && context.selectedLanguages.map((item) => (<CollapsibleForm
                    key={item.name}
                    language={item}
                    isActive={item.name === context.activeLanguage}
                    setActive={() => context.handleSetActive(item.name)}
                    onRemove={() => context.handleRemoveLanguage(item)}
                    initialSettings={context.initialLanguages.find(lang => lang.name === item.name)?.settings}
                    handleSave={() => context.handleSave(item)}
                    onOptionsChange={context.handleOptionsChange}
                />))}
            </div>
            <LanguageDropdown onLanguageSelect={context.handleLanguageSelect}
                              selectedOptions={context.selectedLanguages}
                              languages={context.languages}/>
        </div>}
    </div>);
}

export default Settings;
