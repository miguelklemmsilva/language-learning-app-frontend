import CollapsibleForm from "./CollapsibleForm";
import LanguageDropdown from "./LanguageDropdown";
import {useContext, useEffect, useState} from "react";
import "./Settings.css";
import axios from "axios";
import {useAuth0} from "@auth0/auth0-react";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";

function Settings({}) {
    const context = useContext(HomeRouteContext);

    return (<div className="page-container">
        {context && <div className="content-container">
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
            <LanguageDropdown onLanguageSelect={context.handleLanguageSelect}
                              selectedOptions={context.selectedLanguages}
                              languages={context.languages}/>
        </div>}
    </div>);
}

export default Settings;
