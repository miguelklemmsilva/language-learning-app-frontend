import {useContext, useEffect} from "react";
import {Link} from "react-router-dom";
import "../HomePage.scss";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";
import calculateTime from "../calculateTime";
import {useAuth0} from "@auth0/auth0-react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TranslateIcon from '@mui/icons-material/Translate';
import HearingIcon from '@mui/icons-material/Hearing';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

function Home() {
    const {wordTable, activeLanguage, getActiveCountry, getSelectedLanguageSettings} = useContext(HomeRouteContext);
    const {user, isAuthenticated, isLoading} = useAuth0();

    const filteredTable = wordTable.filter((word) => {
        return word.minutes_until_due <= 0;
    });

    function BoxBars({boxNumber}) {
        const bars = [];

        for (let i = 1; i <= boxNumber; i++) {
            bars.push(<span key={i} className="box-bar" data-box={i}></span>);
        }

        return <div className="box-bars-container">
            <div>{bars}</div>
        </div>;
    }

    return (<div className="main-content">
        <div className="content-container">
            <div className="header-container">
                <div className="txt">Studying {activeLanguage}</div>
                <img className="flag-btn-img" src={getActiveCountry()?.flag} alt=""/>
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
                    <Link to="/practice" className="practice-btn button">
                        <div className="button-txt">PRACTICE</div>
                        <div className="arrow-wrapper"><ArrowForwardIcon fontSize="inherit"/></div>
                    </Link>
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
                                Add to vocab table
                            </div>
                            <div className="arrow-wrapper"><ArrowForwardIcon/></div>
                        </Link>
                    </div>
                    <div className="table-wrapper home">
                        <table className="vocabulary-table">
                            <thead>
                            <tr>
                                <th>Word</th>
                                <th>Familiarity</th>
                                <th>Last practiced</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTable?.map((word, index) => (<tr key={index}>
                                <td className={"content-td"}>{word.word}</td>
                                <td className={"content-td"}>
                                    <BoxBars boxNumber={word.box_number}/>
                                </td>
                                <td className={"content-td"}>{calculateTime(word.last_seen)} ago</td>
                            </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>);
}

export default Home;
