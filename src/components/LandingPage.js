import {useAuth0} from "@auth0/auth0-react";
import {Link} from "react-router-dom";

const LandingPage = () => {
    const {user, isAuthenticated, loginWithRedirect, logout} = useAuth0();

    if (isAuthenticated) {
        return (
            <>
                <Link to={"/home"}>
                    <button className={"button"}>Go to Home</button>
                </Link>
                <Link to={"/vocabularytable"}>
                    <button className={"button"}>Go to Vocabulary Table</button>
                </Link>
                <div>
                    {user.sub}
                </div>
                <button onClick={() => logout()}>Log Out</button>
            </>
        )
    }

    return (
        <>
            <button onClick={() => loginWithRedirect()}>Log In</button>
        </>
    )
}

export default LandingPage;