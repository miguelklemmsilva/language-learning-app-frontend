import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Finished({ sentences }) {
    const navigate = useNavigate();

    useEffect(() => {
        sentences.forEach(sentence => {
            sentence.voice = null;
        });
        axios.post(`api/user/finishlesson`, { sentences: sentences })
            .then(r => console.log(r))
            .catch(error => console.error(error));
    }, [sentences]);

    return (
        <div className={"content-container"}>
            <h1>Finished</h1>
            <button onClick={() => navigate('/home')}>Dashboard</button>
        </div>
    )
}

export default Finished;
