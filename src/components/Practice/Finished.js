import React, {useContext, useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import {HomeRouteContext} from "../../contexts/HomeRouteContext";
import "./Finished.scss";
import TranslateIcon from "@mui/icons-material/Translate";
import HearingIcon from "@mui/icons-material/Hearing";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import Listening from "./Question/Listening/Listening";
import ListeningButton from "./Question/Listening/ListeningButton";

function Finished({sentences}) {
    const navigate = useNavigate();

    useEffect(() => {
        console.log(sentences);
    }, []);

    return (<div className="main-content no-margin">
        <div className="content-container">
            <h1 style={{textAlign: 'center'}}>
                Lesson Completed!
            </h1>
            <div className="finished-body">
                <div className="collapsible-form-container">
                    {sentences && sentences.map((sentence, idx) => (<div key={idx} className="language-form">
                        <div className="header-container form">
                            {sentence.translation && <div className="info-container finished">
                                <div className="main-info">
                                    <TranslateIcon fontSize="inherit"/>
                                </div>
                                <div className="sub-info">Translation</div>
                            </div>}
                            {sentence.listening && <div className="info-container finished">
                                <div className="main-info">
                                    <HearingIcon fontSize="inherit"/>
                                </div>
                                <div className="sub-info">Listening</div>
                            </div>}
                            {sentence.speaking && <div className="info-container finished">
                                <div className="main-info">
                                    <RecordVoiceOverIcon fontSize="inherit"/>
                                </div>
                                <div className="sub-info">Speaking</div>
                            </div>}
                            <div className="info-container">
                                <div className="main-info">{sentence.word}</div>
                            </div>
                            {!sentence.listening &&
                                <div className="remove-btn-wrapper">mistakes: {sentence.mistakes}</div>}
                        </div>
                        <div className="body-container">
                            <div className="info-container">
                                <div className="main-info">
                                    Sentence:
                                </div>
                                <div className="sub-info">
                                    <ListeningButton small={true} sentence={sentence}/>
                                    {sentence.original}
                                </div>
                                <br/>
                                <div className="main-info">Translation:</div>
                                <div className="sub-info">
                                    {sentence.translation}
                                </div>
                            </div>
                        </div>
                    </div>))}
                    <button className="button blue finished-button" onClick={() => navigate("/home")}>CONTINUE</button>
                </div>
            </div>
        </div>
    </div>)
}

export default Finished;
