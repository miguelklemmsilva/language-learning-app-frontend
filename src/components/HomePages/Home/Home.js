import {useContext} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import "./Home.css";
import calculateLastSeen from "../calculateTime";
import {HomeRouteContext} from "../../../contexts/HomeRouteContext";
import calculateTime from "../calculateTime";

function Home() {
    const {wordTable} = useContext(HomeRouteContext);

    function BoxBars({ boxNumber }) {
        const bars = [];

        for (let i = 1; i <= boxNumber; i++) {
            bars.push(<span key={i} className="box-bar" data-box={i}></span>);
        }

        return <div className="box-bars-container"><div>{bars}</div></div>;
    }

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
                            <th>Familiarity</th>
                            <th>Due</th>
                            <th>Last practiced</th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordTable && wordTable.map((word, index) => (
                            <tr key={index}>
                                <td className={"content-td"}>{word.word}</td>
                                <td className={"content-td"}>
                                    <BoxBars boxNumber={word.box_number} />
                                </td>
                                <td className={"content-td"}>{calculateTime(word.minutes_until_due)}</td>
                                <td className={"content-td"}>{calculateTime(word.last_seen)}</td>
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
