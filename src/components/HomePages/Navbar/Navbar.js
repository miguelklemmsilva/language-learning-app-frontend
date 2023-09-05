import React, {memo} from 'react';
import './Navbar.scss';
import {Link, useLocation} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import HomeIcon from '@mui/icons-material/Home';
import TableChartIcon from '@mui/icons-material/TableChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
    const location = useLocation();
    const { isAuthenticated, logout} = useAuth0();

    const isActive = (path) => {
        return location.pathname === path;
    }

    if (!isAuthenticated)
        return null;

    return (
        <>
            <nav role="navigation" className="navbar">
                <div className="sections desktop">
                    <div className="section top">
                        <Link to="/" className="nav-link-container">
                            <div className="nav-link-wrapper">
                                <div className="nav-title">
                                    PolyBara
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="section center">
                        <div>
                            <Link to="/home" className={`nav-link-container ${isActive("/home") ? "active" : ""}`}>
                                <div className="img-wrapper">
                                    <HomeIcon fontSize="inherit"/>
                                </div>
                                <div className="nav-link-wrapper">
                                    <div className="nav-title">Home</div>
                                </div>
                            </Link>
                            <Link to="/vocabularytable"
                                  className={`nav-link-container ${isActive("/vocabularytable") ? "active" : ""}`}>
                                <div className="img-wrapper">
                                    <TableChartIcon fontSize="inherit"/>
                                </div>
                                <div className="nav-link-wrapper">
                                    <div className="nav-title">Vocabulary Table</div>
                                </div>
                            </Link>
                            <Link to="/settings"
                                  className={`nav-link-container ${isActive("/settings") ? "active" : ""}`}>
                                <div className="img-wrapper">
                                    <SettingsIcon fontSize="inherit"/>
                                </div>
                                <div className="nav-link-wrapper">
                                    <div className="nav-title">Language Settings</div>
                                </div>
                            </Link>
                            <div className="nav-link-container logout"
                                 onClick={() => logout({logoutParams: {returnTo: window.location.origin}})}>
                                <div className="img-wrapper">
                                    <LogoutIcon fontSize="inherit"/>
                                </div>
                                <div className="nav-link-wrapper">
                                    <div className="nav-title">Log out</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="section bottom">

                    </div>
                </div>
            </nav>
            <div className="sections mobile">
                <Link to="/home" className={`nav-link-container ${isActive("/home") ? "active" : ""}`}>
                    <div className="icon-wrapper">
                        <HomeIcon fontSize="inherit"/>
                    </div>
                </Link>
                <Link to="/vocabularytable"
                      className={`nav-link-container ${isActive("/vocabularytable") ? "active" : ""}`}>
                    <div className="icon-wrapper">
                        <TableChartIcon fontSize="inherit"/>
                    </div>
                </Link>
                <Link to="/settings"
                      className={`nav-link-container ${isActive("/settings") ? "active" : ""}`}>
                    <div className="icon-wrapper">
                        <SettingsIcon fontSize="inherit"/>
                    </div>
                </Link>
                <div className="nav-link-container logout"
                     onClick={() => logout({logoutParams: {returnTo: window.location.origin}})}>
                    <div className="icon-wrapper">
                        <LogoutIcon fontSize="inherit"/>
                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(Navbar);
