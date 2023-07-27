import { useEffect, useState } from "react";
import axios from "axios";

const useFetchSentences = (url) => {
    const [sentences, setSentences] = useState();

    useEffect(() => {
        axios
            .get(url)
            .then((res) => {
                const response = res.data.sentences;
                setSentences(response);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [url]);

    return [sentences, setSentences];
};

export default useFetchSentences;
