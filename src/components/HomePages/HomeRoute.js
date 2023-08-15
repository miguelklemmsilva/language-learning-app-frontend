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

    const checkIfUserIsRegistered = async () => {
        if (isAuthenticated) {
            try {
                const accessToken = await getAccessTokenSilently();

                const response = await axios.get("api/user/isRegistered", {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setUserRegistered(response.data.isRegistered);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        checkIfUserIsRegistered();
    }, [isAuthenticated, getAccessTokenSilently, user]);


    if (isLoading)
        return <div>Loading...</div>;

    if (!isAuthenticated)
        navigate("/");

    if (!userRegistered)
        return <div className="page-container"><Settings/></div>;

    return (
        <HomeRouteProvider checkIfUserIsRegistered={checkIfUserIsRegistered}>
            <div className="page-container">
                <Sidebar/>
                {children}
            </div>
        </HomeRouteProvider>
    )
}

export default HomeRoute;