import React from 'react';
import './Sidebar.css';
import {Link, useLocation} from "react-router-dom";
import {useAuthContext} from "../../../contexts/AuthProvider";

const Sidebar = () => {
    const location = useLocation();
    const {auth, name, handleDelete} = useAuthContext();

    const isActive = (path) => {
        return location.pathname === path;
    }

    return (
        auth ? (
            <div className="sidebar">
                <div className={"welcome-message"}>Welcome<br/>{name}</div>
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
                <button className={"button logout-button"} onClick={handleDelete}>Logout</button>
            </div>
        ) : null
    );
};

export default React.memo(Sidebar);
