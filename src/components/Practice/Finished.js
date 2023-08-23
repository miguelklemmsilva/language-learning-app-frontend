import React, {useContext, useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import {HomeRouteContext} from "../../contexts/HomeRouteContext";

function Finished({sentences}) {
    const navigate = useNavigate();
    const {getAccessTokenSilently} = useAuth0();
    const {updateVocabTable} = useContext(HomeRouteContext);

    useEffect(() => {
        const finishLesson = async () => {
            const filteredSentences = sentences.map(sentence => ({
                mistakes: sentence.mistakes,
                word: sentence.word,
                language: sentence.language,
                type: sentence.type,
            }));

            axios.post(`api/user/finishlesson`, {sentences: filteredSentences}, {
                headers: {
                    'Authorization': `Bearer ${await getAccessTokenSilently()}`
                }
            })
                .catch(error => console.error(error));
        }

        finishLesson().then(() => {
            updateVocabTable();
        });
    }, [sentences]);

    return (
        <div className={"content-container"}>
            <h1>Finished</h1>
            <button onClick={() => navigate('/home')}>Dashboard</button>
        </div>
    )
}

export default Finished;
