import {useEffect, useState} from "react";
import axios from "axios";
import {useAuth0} from "@auth0/auth0-react";

const useFetchSentences = (url) => {
    const [sentences, setSentences] = useState();
    const {getAccessTokenSilently, logout} = useAuth0();
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getSentences() {
            axios
                .get(url, {
                    headers: {
                        'Authorization': `Bearer ${await getAccessTokenSilently()}`
                    }
                })
                .then((res) => {
                    const response = res.data.sentences;
                    setSentences(response);
                })
                .catch((err) => {
                    console.error(err);
                    if (err.response && err.response.status === 400)
                        setError(err.response.data);
                    else
                        logout();
                });
        }
        getSentences();
    }, [url, getAccessTokenSilently]);

    return [sentences, setSentences, error];
};

export default useFetchSentences;
