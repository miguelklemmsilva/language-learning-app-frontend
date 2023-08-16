import Sidebar from "./Sidebar/Sidebar";
import {HomeRouteProvider} from "../../contexts/HomeRouteContext";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import Settings from "./Settings/Settings";

const HomeRoute = ({children}) => {
    const {user, isAuthenticated, isLoading, getAccessTokenSilently} = useAuth0();
    const [userRegistered, setUserRegistered] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const checkIfUserIsRegistered = async () => {
        if (isAuthenticated) {
            try {
                const response = await axios.get("api/user/isRegistered", {
                    headers: {
                        'Authorization': `Bearer ${await getAccessTokenSilently()}`
                    }
                });
                setUserRegistered(response.data.isRegistered);
                setLoading(false);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        checkIfUserIsRegistered().then(() => setLoading(false));
    }, [isAuthenticated, getAccessTokenSilently, user]);


    if (isLoading || loading)
        return <div>Loading...</div>;

    if (!isAuthenticated)
        navigate("/");

    if (!userRegistered) {
        return <HomeRouteProvider checkIfUserIsRegistered={checkIfUserIsRegistered}>
            <div className="page-container"><Settings/></div>;
        </HomeRouteProvider>
    }

    return (
        <HomeRouteProvider>
            <div className="page-container">
                <Sidebar/>
                {children}
            </div>
        </HomeRouteProvider>
    )
}

export default HomeRoute;