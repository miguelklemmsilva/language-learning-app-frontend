import Login from "./Login";
import Register from "./Register";
import {Link} from "react-router-dom";

const LandingPage = () => {
    return (
        <>
            <Link to={"/login"}>
                <button className={"login-btn"}>Log in</button>
            </Link>
            <Link to={"/register"}>
                <button className={"signup-btn"}>Sign-up</button>
            </Link>
        </>
    )
}

export default LandingPage;