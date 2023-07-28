import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import calculateLastSeen from "../CalculateLastSeen";
import { useAuthContext } from "../../../contexts/AuthProvider";

function Home() {
    const [wordTable, setWordTable] = useState([]);
    const { auth } = useAuthContext();

    useEffect(() => {
        if (auth) {
            axios.defaults.withCredentials = true;
            axios
                .get("api/user/vocabularypreview")
                .then((res) => {
                    setWordTable(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [auth]);

    if (!auth)
        return null; // If the user is not authenticated, render nothing

    return (
        <div className="page-container">
            <div className={"content-container"}>
                <div className={"practice-button-wrapper"}>
                    <Link className={"practice-link"} to={"/practice"}>
                        <button className="practice-button">PRACTICE</button>
                    </Link>
                </div>
                <div className="table-wrapper home">
                    <table className="vocabulary-table">
                        <thead>
                        <tr>
                            <th>Word</th>
                            <th>Interval</th>
                            <th>Last practiced</th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordTable.map((word, index) => (
                            <tr key={index}>
                                <td className={"content-td"}>{word.word}</td>
                                <td className={"content-td"}>{word.interval_score}</td>
                                <td className={"content-td"}>
                                    {calculateLastSeen(word.last_seen)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Home;
