import { Link, useNavigate } from "react-router-dom";
import useLoginForm from "../hooks/useLoginForm";
import Field from "./Field";
import {useAuthContext} from "../contexts/AuthProvider";

function Login() {
    const navigate = useNavigate();
    const { values, handleChange, handleSubmit } = useLoginForm(() => {
        navigate("/home")
        checkAuth()
    });

    const {checkAuth} = useAuthContext();

    return (
        <div className={"account-wrapper"}>
            <div className={"account-container"}>
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <Field
                        label="Email"
                        type="email"
                        placeholder="Enter Email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        required
                    />
                    <Field
                        label="Password"
                        type="password"
                        placeholder="Enter Password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        required
                    />
                    <button className={"login-btn"} type={"submit"}>
                        Login
                    </button>
                    <Link to={"/register"}>
                        <button className={"signup-btn"}>Sign-up</button>
                    </Link>
                </form>
            </div>
        </div>
    );
}

export default Login;
