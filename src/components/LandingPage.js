import {useAuth0} from "@auth0/auth0-react";
import "./LandingPage.scss";
import {Link} from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import React from "react";
import TableChartIcon from "@mui/icons-material/TableChart";

const LandingPage = () => {
    const {user, isAuthenticated, loginWithRedirect, logout} = useAuth0();

    function isAuth() {
        return (<div className="true-center">
                <div className="welcome-info">
                    Welcome {user.name}!
                    <Link className="nav-link-container button blue" to="/home">
                        <div className="img-wrapper true-center">
                            <HomeIcon fontSize="inherit"/>
                        </div>
                        <div className="nav-link-wrapper">
                            <div className="nav-title">Home</div>
                        </div>
                    </Link>
                    <Link className="nav-link-container button blue" to="/vocabtable">
                        <div className="img-wrapper true-center">
                            <TableChartIcon fontSize="inherit"/>
                        </div>
                        <div className="nav-link-wrapper">
                            <div className="nav-title">Vocabulary Table</div>
                        </div>
                    </Link>
                    <Link className="nav-link-container button blue" to="/settings">Settings</Link>
                    <button className="nav-link-container button blue" onClick={() => logout()}>Log Out</button>
                </div>
            </div>)
    }

    return (<div className="main-content no-margin">
            <div style={{maxWidth: "2000px"}}>
                <div className="welcome-lp-container">
                    <div className="welcome-info">
                        <div className="slogan">Babble Today, Fluent Tomorrow</div>
                        <div className="">Achieve fluency through translation, listening, and speaking
                            drills. Boost your lexicon with a personalized vocabulary list. All with basic knowledge.
                        </div>
                        <div className="true-center" style={{padding: "20px"}}>
                            <img src="/CapyLogo.png" style={{width: "256px"}}/>
                        </div>
                    </div>

                    {isAuthenticated ? isAuth() : null}
                </div>
            </div>
        </div>)
}

export default LandingPage;