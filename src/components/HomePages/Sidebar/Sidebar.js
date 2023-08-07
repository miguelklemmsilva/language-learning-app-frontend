import React from 'react';
import './Sidebar.css';
import {Link, useLocation} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";

const Sidebar = () => {
    const location = useLocation();
    const {user, isAuthenticated, isLoading, logout} = useAuth0();

    const isActive = (path) => {
        return location.pathname === path;
    }

    return (
        isAuthenticated ? (
            <div className="sidebar">
                <div className={"welcome-message"}>Welcome<br/>
                    {user.name}
                </div>
                <Link className={"sidebar-links"} to={"/home"}>
                    <button className={`button sidebar-buttons ${isActive('/home') ? 'active' : ''}`}>HOME</button>
                </Link>
                <Link className={"sidebar-links"} to={"/vocabularytable"}>
                    <button
                        className={`button sidebar-buttons ${isActive('/vocabularytable') ? 'active' : ''}`}>VOCABULARY
                        TABLE
                    </button>
                </Link>
                <Link className={"sidebar-links"} to={"/settings"}>
                    <button className={`button sidebar-buttons ${isActive('/settings') ? 'active' : ''}`}>SETTINGS
                    </button>
                </Link>
                <button className={"button logout-button"}
                        onClick={() => logout({logoutParams: {returnTo: window.location.origin}})}>
                    Log Out
                </button>
            </div>
        ) : null
    );
};

export default React.memo(Sidebar);
