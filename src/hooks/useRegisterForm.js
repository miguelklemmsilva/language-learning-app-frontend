import { useState } from "react";
import axios from "axios";

function useRegisterForm(onSuccess) {
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post("api/auth/register", values)
            .then((res) => {
                if (res.status === 201) {
                    onSuccess();
                }
            })
            .catch((err) => console.error(err));
    };

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    return { values, handleChange, handleSubmit };
}

export default useRegisterForm;
