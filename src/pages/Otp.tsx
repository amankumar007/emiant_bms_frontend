import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/otp.css";
import { useAuth } from "../context/AuthContext";

const Otp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  return (
    <div className="otp-wrapper">
      <div className="otp-card">
        <h2>OTP Not Enabled</h2>
        <p>This backend does not expose an OTP verification endpoint.</p>

        <button className="otp-btn" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Otp;
