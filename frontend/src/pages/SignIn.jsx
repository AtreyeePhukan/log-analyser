import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../signin.css";


const SignIn = () => {
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Check credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle();
    navigate("/");
  } catch (err) {
    console.error(err);
    setError("Google sign-in failed.");
  }
};


  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="form-container">
        <p className="title">Sign In</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <div className="forgot">
              <a href="#">Forgot Password?</a>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-xs mb-2 text-center">{error}</p>
          )}
          <button type="submit" className="sign">
            Sign in
          </button>
        </form>
        <div className="social-message">
          <div className="line"></div>
          <p className="message">Sign In with social accounts</p>
          <div className="line"></div>
        </div>
        <div className="social-icons">
          <button
              type="button"
              aria-label="Sign In with Google"
              className="icon"
              onClick={handleGoogleSignIn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-current">
              <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
            </svg>
          </button>
        </div>
        <p className="signup">
          Don't have an account?
          <a href="/sign-up"> Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
