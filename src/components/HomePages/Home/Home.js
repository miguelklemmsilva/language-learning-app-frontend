import React, {useContext} from "react";
import {Link} from "react-router-dom";
import "../HomePage.scss";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";
import {useAuth0} from "@auth0/auth0-react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TranslateIcon from '@mui/icons-material/Translate';
import HearingIcon from '@mui/icons-material/Hearing';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VocabularyTable from "../VocabularyTable/VocabularyTable";
import {useNavigate} from "react-router-dom";
import ScrollToTop from "../../../ScrollToTop";

function Home() {
    const {
        wordTable, activeLanguage, getActiveCountry, getSelectedLanguageSettings, selectedLanguages, handleSave
    } = useContext(HomeRouteContext);
    const {user} = useAuth0();
    const navigate = useNavigate();

    const filteredTable = wordTable.filter((word) => {
        return word.minutes_until_due <= 0;
    });

    const practiceButton = () => {
        if (filteredTable.length > 0 && (getSelectedLanguageSettings()?.exercises.translation || getSelectedLanguageSettings()?.exercises.listening || getSelectedLanguageSettings()?.exercises.speaking)) {
            return <button onClick={async () => {
                handleSave(selectedLanguages.filter(lang => lang.name === activeLanguage)[0]);
                // fuck it good enough
                await new Promise(resolve => setTimeout(resolve, 100));
                navigate("/practice");
            }} className="practice-btn button">
                <div className="button-txt">PRACTICE</div>
                <div className="arrow-wrapper"><ArrowForwardIcon fontSize="inherit"/></div>
            </button>
        } else if (filteredTable.length <= 0) {
            return <Link to="/vocabularytable" className="practice-btn button">
                <div className="button-txt">ADD TO VOCABULARY TABLE</div>
                <div className="arrow-wrapper"><ArrowForwardIcon fontSize="inherit"/></div>
            </Link>
        } else {
            return <Link to="/settings" className="practice-btn button">
                <div className="button-txt">SELECT EXERCISES</div>
                <div className="arrow-wrapper"><ArrowForwardIcon fontSize="inherit"/></div>
            </Link>
        }
    }

    return (<div className="main-content">
        <div className="content-container">
            <div className="header-container">
                <div className="txt"><strong>Studying {activeLanguage}</strong></div>
                <img className="flag-img big" src={getActiveCountry()?.flag} alt=""/>
            </div>
            <div className="welcome-container">
                <div className="messages-container">
                    <div className="welcome-message">Hello {user.nickname}!</div>
                    <div className="message">You
                        have <strong>{filteredTable.length}</strong> {filteredTable.length === 1 ? "word" : "words"} to
                        practice
                        for {activeLanguage}!
                    </div>
                </div>
                <div className="practice-button-wrapper">
                    {practiceButton()}
                </div>
            </div>
            <div className="info-container">
                <Link to="/settings" className="language-settings">
                    <div className="language-settings-container">
                        <div className="header-container">
                            <strong>Language Settings</strong>
                            <div className="button">
                                <div className="button-txt">Configure</div>
                                <div className="arrow-wrapper"><ArrowForwardIcon/></div>
                            </div>
                        </div>
                        <div className="info-content">
                            <div className="active-country info">
                                <div className="info-txt">
                                    <div>Studying <strong>{activeLanguage}</strong> from</div>
                                </div>
                                <img src={getActiveCountry()?.flag} alt="" className="flag-img"/>
                            </div>
                            <div className="active-exercises info">
                                <div>Active exercises:</div>
                                <div className="exercises-container">
                                    <div className="exercise"
                                         style={getSelectedLanguageSettings()?.exercises.translation ? {color: "green"} : {color: "red"}}>
                                        <TranslateIcon fontSize="inherit"/>
                                    </div>
                                    <div className="exercise"
                                         style={getSelectedLanguageSettings()?.exercises.listening ? {color: "green"} : {color: "red"}}>
                                        <HearingIcon fontSize="inherit"/>
                                    </div>
                                    <div className="exercise"
                                         style={getSelectedLanguageSettings()?.exercises.speaking ? {color: "green"} : {color: "red"}}>
                                        <RecordVoiceOverIcon fontSize="inherit"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
                <div className="home-table-container">
                    <div className="header-container">
                        <div className="horizontal-align-txt"><strong>Your due words</strong></div>
                        <Link to="/vocabularytable" className="button vocab-add-btn">
                            <div className="button-txt">
                                View Table
                            </div>
                            <div className="arrow-wrapper"><ArrowForwardIcon/></div>
                        </Link>
                    </div>
                    {filteredTable.length > 0 ? <VocabularyTable wordTable={filteredTable} isHome={true}/> : <div>
                        <div className="header-container">You have no words to practice for {activeLanguage}!
                        </div>
                        <br/>
                        <Link to="/vocabularytable" className="button vocab-add-btn">
                            <div className="button-txt">
                                Add more words here
                            </div>
                            <div className="arrow-wrapper"><ArrowForwardIcon/></div>
                        </Link>
                    </div>}
                </div>
            </div>
        </div>
    </div>);
}

export default Home;
