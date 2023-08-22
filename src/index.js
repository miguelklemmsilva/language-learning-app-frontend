import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import {Auth0Provider} from "@auth0/auth0-react";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Auth0Provider
        domain="dev-k3jnyjgiqp886i26.uk.auth0.com"
        clientId="6VhazxtL7ehVyhWhXW3DdqDJsuQiztsR"
        authorizationParams={{
            audience: "https://dev-k3jnyjgiqp886i26.uk.auth0.com/api/v2/",
            scope: "read:current_user update:current_user_metadata openid profile email",
            redirect_uri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
            domain: "dev-k3jnyjgiqp886i26.uk.auth0.com",
            client_id: "6VhazxtL7ehVyhWhXW3DdqDJsuQiztsR",
        }}
    >
        <App/>
    </Auth0Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
