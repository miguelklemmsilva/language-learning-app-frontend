import { Link, useNavigate } from "react-router-dom";
import useRegisterForm from "../hooks/useRegisterForm";
import Field from "./Field";

function Register() {
    const navigate = useNavigate();
    const { values, handleChange, handleSubmit } = useRegisterForm(() => navigate("/login"));

    return (
        <div className="account-wrapper">
            <div className={"account-container"}>
                <h2>Sign-up</h2>
                <form onSubmit={handleSubmit}>
                    <Field
                        label="Name"
                        type="text"
                        placeholder="Enter Name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                    />
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
                    <button className={"signup-btn"} type={"submit"}>
                        Sign-up
                    </button>
                    <Link to={"/login"}>
                        <button className={"login-btn"}>Log in</button>
                    </Link>
                </form>
            </div>
        </div>
    );
}

export default Register;
