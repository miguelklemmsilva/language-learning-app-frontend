import React, {useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function Finished({ sentences }) {
    const navigate = useNavigate();

    useEffect(() => {
        sentences.map(sentence => {
            sentence.voice = null;
        })
        axios.post(`/user/finishlesson`, {sentences: sentences})
            .then(r => console.log(r))
    }, []);

    return (
        <div className={"content-container"}>
            <h1>Finished</h1>
            <button onClick={() => navigate('/home')}>Dashboard</button>
        </div>
    )
}

export default Finished;
