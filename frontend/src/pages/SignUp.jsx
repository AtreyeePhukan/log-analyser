import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../signin.css"; 

const SignUp = () => {
  const { register, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Registration failed");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Google sign-up failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="form-container">
        <p className="title">Sign Up</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="sign">
            Sign up
          </button>
        </form>
        <div className="social-message">
          <div className="line"></div>
          <p className="message">Sign up with social accounts</p>
          <div className="line"></div>
        </div>
        <div className="social-icons">
          <button
            type="button"
            aria-label="Sign Up with Google"
            className="icon"
            onClick={handleGoogleSignUp}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-current">
              <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
            </svg>
          </button>
          {/* Add other social icons similarly if you implement OAuth */}
        </div>
        <p className="signup">
          Already have an account?{" "}
          <Link to="/sign-in" className="">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
