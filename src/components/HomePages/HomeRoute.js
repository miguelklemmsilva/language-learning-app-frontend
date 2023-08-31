import Sidebar from "./Navbar/Navbar";
import {HomeRouteProvider} from "../../contexts/HomeRouteContext";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import Settings from "./Settings/Settings";

const HomeRoute = ({children}) => {
    const {user, isAuthenticated, isLoading, getAccessTokenSilently} = useAuth0();
    const [userRegistered, setUserRegistered] = useState(null);
    const navigate = useNavigate();

    const checkIfUserIsRegistered = async () => {
        if (isAuthenticated) {
            axios.get("api/user/isRegistered", {
                headers: {
                    'Authorization': `Bearer ${await getAccessTokenSilently()}`
                }
            }).then((res) => {
                setUserRegistered(res.data.isRegistered)
            }).catch((err) => {
                console.error(err);
            });
        }
    };

    useEffect(() => {
        checkIfUserIsRegistered();
    }, [isAuthenticated, getAccessTokenSilently, user]);

    useEffect(() => {
        if (isAuthenticated == null)
            return;
        if (!isAuthenticated && !isLoading) {
            navigate("/");
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading || userRegistered === null) return null;

    if (!userRegistered) {
        return <HomeRouteProvider checkIfUserIsRegistered={checkIfUserIsRegistered}>
            <div className="page-container" style={{marginLeft: "-300px"}}><Settings/></div>
        </HomeRouteProvider>
    }

    return (<HomeRouteProvider checkIfUserIsRegistered={checkIfUserIsRegistered}>
        <Sidebar/>
        {children}
    </HomeRouteProvider>)
}

export default HomeRoute;