import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as PropTypes from "prop-types";

const AuthContext = createContext();

export function useAuthContext() {
    return useContext(AuthContext);
}

function Provider(props) {
    return null;
}

Provider.propTypes = {
    value: PropTypes.shape({
        auth: PropTypes.bool,
        name: PropTypes.string,
        checkAuth: PropTypes.func,
        handleDelete: PropTypes.func
    }),
    children: PropTypes.node
};

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(false);
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const checkAuth = useCallback(() => { // Wrap checkAuth with useCallback
        axios.defaults.withCredentials = true;
        axios
            .get('/')
            .then(res => {
                if (res.status === 200) {
                    setAuth(true);
                    setName(res.data.name);
                }
            })
            .catch(err => {
                if (err.response.status === 401) navigate('/login');
                else console.log(err);
            });
    }, [navigate]); // Make sure to include 'navigate' in the dependency array

    useEffect(() => {
        checkAuth();
    }, [auth, checkAuth]);

    const handleDelete = () => {
        axios.defaults.withCredentials = true;
        setAuth(false);
        axios
            .get('/auth/logout')
            .then(res => {
                navigate('/login');
            })
            .catch(err => console.log(err));
    };

    return (
        <Provider value={{ auth, name, handleDelete, checkAuth }}>
            {children}
        </Provider>
    );
}
