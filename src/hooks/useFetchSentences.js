import {useEffect, useState} from "react";
import axios from "axios";
import {useAuth0} from "@auth0/auth0-react";

const useFetchSentences = (url) => {
    const [sentences, setSentences] = useState();
    const {getAccessTokenSilently} = useAuth0();

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
                    console.log(err);
                });
        }

        getSentences();
    }, [url]);

    return [sentences, setSentences];
};

export default useFetchSentences;
