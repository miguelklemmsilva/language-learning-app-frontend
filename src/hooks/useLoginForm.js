import { useState } from "react";
import axios from "axios";

function useLoginForm(onSuccess) {
    const [values, setValues] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post("api/auth/login", values)
            .then((res) => {
                if (res.status === 200)
                    onSuccess();
            })
            .catch((err) => console.log(err));
    };

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    return { values, handleChange, handleSubmit };
}

export default useLoginForm;
