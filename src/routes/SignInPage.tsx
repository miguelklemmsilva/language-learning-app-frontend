import { Navigate } from "react-router-dom";
import CustomAuth from "../components/Auth/CustomAuth";

export default function SignInPage() {
  return (
    <div className="auth-center">
      <CustomAuth>
        <Navigate to="/home" replace />
      </CustomAuth>
    </div>
  );
}
