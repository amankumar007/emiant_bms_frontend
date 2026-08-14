import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginApi } from "../services/authService";
import { registerApi } from "../services/authService";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const { login } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<"admin" | "engineer" | "technician">("technician");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Common states
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength rules
  const rules = {
    length: regPassword.length >= 8,
    upper: /[A-Z]/.test(regPassword),
    lower: /[a-z]/.test(regPassword),
    number: /\d/.test(regPassword),
    symbol: /[^A-Za-z0-9]/.test(regPassword),
  };

  const strength = Object.values(rules).filter(Boolean).length * 20;
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await loginApi(loginEmail, loginPassword);
      login(
        {
          id: response.user.id,
          email: loginEmail,
          role: response.user.role,
          token: response.token,
        },
        rememberMe
      );
      navigate("/dashboard");
    } catch (err: unknown) {
      let message = "Login failed";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.msg || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Username, email, and password are required");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await registerApi(
        regUsername,
        regEmail,
        regPassword,
        regRole
      );
      if (response?.id) {
        setIsLogin(true);
        setInfo("Account created. Please log in.");
        setLoginEmail(regEmail);
        setLoginPassword("");
        setRegPassword("");
      }
    } catch (err: unknown) {
      let message = "Registration failed";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.msg || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (mode: boolean) => {
    setIsLogin(mode);
    setError("");
    setInfo("");
    // Clear fields when switching
    setLoginEmail("");
    setLoginPassword("");
    setRegUsername("");
    setRegEmail("");
    setRegRole("technician");
    setRegPassword("");
  };

  const handleForgotPassword = () => {
    setError("");
    setInfo("Password resets aren't self-service yet — contact your administrator to reset your password.");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-brand-lockup">
          <img
            src="/emiant-logo.png"
            alt="Emiant Innovations"
            className="auth-brand-mark"
          />
          <div className="auth-brand-text">
            <span className="auth-brand-word">
              Emiant<sup className="auth-brand-tm">TM</sup>
            </span>
            <span className="auth-brand-sub">INNOVATIONS</span>
          </div>
        </div>
        <p className="auth-tagline">Maximizing Battery Safety and Performance</p>
      </div>

      <div className="auth-right">
        <div className="auth-container">
          <div className="auth-header">
            <h1>CELL DOC</h1>
            <p>{isLogin ? "Login to your account" : "Create your account"}</p>

            <div className="auth-tabs">
              <button
                className={`tab ${isLogin ? "active" : ""}`}
                onClick={() => toggleMode(true)}
              >
                Login
              </button>
              <button
                className={`tab ${!isLogin ? "active" : ""}`}
                onClick={() => toggleMode(false)}
              >
                Register
              </button>
            </div>
          </div>

        <div className="auth-content">
          {isLogin ? (
            // LOGIN FORM
            <div className="form-section">
              <div className="input-group">
                <label>Email</label>
                <div className="icon-field">
                  <span className="field-icon">✉</span>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="icon-field password-field">
                  <span className="field-icon">🔒</span>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="auth-row">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <span className="link" onClick={handleForgotPassword}>
                  Forgot Password?
                </span>
              </div>

              <button
                className="auth-btn primary"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Log in →"}
              </button>

              {error && <p className="error-message">{error}</p>}
              {info && <p className="success-message">{info}</p>}

              <p className="toggle-text">
                New User?{" "}
                <span onClick={() => toggleMode(false)} className="link">
                  Register
                </span>
              </p>
            </div>
          ) : (
            // REGISTER FORM
            <div className="form-section">
              <div className="input-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="your_username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Role</label>
                <select
                  className="opt"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as "admin" | "engineer" | "technician")}
                >
                  <option value="technician">Technician</option>
                  <option value="engineer">Engineer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="password-field">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: `${strength}%` }}
                  ></div>
                </div>
                <p className="strength-text">Password strength: {strength}%</p>
              </div>

              <ul className="password-rules">
                <li className={rules.length ? "ok" : ""}>
                  At least 8 characters
                </li>
                <li className={rules.upper ? "ok" : ""}>
                  At least one uppercase letter
                </li>
                <li className={rules.lower ? "ok" : ""}>
                  At least one lowercase letter
                </li>
                <li className={rules.number ? "ok" : ""}>
                  At least one number
                </li>
                <li className={rules.symbol ? "ok" : ""}>
                  At least one symbol
                </li>
              </ul>

              <button
                className="auth-btn primary"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account →"}
              </button>

              {error && <p className="error-message">{error}</p>}
              {info && <p className="success-message">{info}</p>}

              <p className="toggle-text">
                Already have an account?{" "}
                <span onClick={() => toggleMode(true)} className="link">
                  Login
                </span>
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
