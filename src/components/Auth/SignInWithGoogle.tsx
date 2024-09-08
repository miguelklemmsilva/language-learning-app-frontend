import React, { useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

const SignInWithGoogle = () => {
  useEffect(() => {
    // Check for an existing Google client initialization
    if (!window.google?.accounts) createScript();
  }, []);

  // Load the Google client
  const createScript = () => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGsi;
    document.body.appendChild(script);
  };

  // Initialize Google client and render Google button
  const initGsi = async () => {
    if (window.google?.accounts) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          customCredentialsProvider.loadFederatedLogin({
            domain: "accounts.google.com",
            token: response.credential,
          });
          const fetchSessionResult = await fetchAuthSession(); // will return the credentials
          console.log("fetchSessionResult: ", fetchSessionResult);
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large" }
      );
    }
  };

  
  return (
    <div>
      <button id="googleSignInButton" />
    </div>
  );
};

export default SignInWithGoogle;
