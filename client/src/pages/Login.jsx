import { FaGoogle } from "react-icons/fa";
import "../styling/Login.css";

export default function GoogleLogin() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="google-login-container">
      <div className="login-box">
        <div className="brand-header">
          <h1>Football Legends</h1>
          <p>Sign in to access your favorite players</p>
        </div>

        <div className="form-wrapper">
          <button onClick={handleGoogleLogin} className="google-btn">
            <FaGoogle className="google-icon" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
