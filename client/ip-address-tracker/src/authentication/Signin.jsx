import axios from "axios";
import React, { useState, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import './Signin.css'
import BounceBalls from "./BounceBall";
import { FaEye, FaEyeSlash } from "react-icons/fa"
const Signin = ({ setUserEmail }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const message = location.state?.message;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:3001/users/login", {
        email,
        password,
      });
      setUserEmail(email);
     localStorage.setItem("token", res.data.token);
      setTimeout(() => {
        setLoad(false);
        navigate("/map-routing");
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Unexpected error occured please try again later!");
      }
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
  <div> 
    {
        (load && !error )? <FaSpinner className="spinner"/>
        :
        <>
        <BounceBalls/>
    <div className="login">  
    {message && (
        <div className="notification-bar">
          <div className="message">{message}</div>
          <div className="progress-bar"></div>
        </div>)}
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="email"
          type="email"
          placeholder="Enter your email..."
          required
          spellCheck="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />{" "}
        <br />
        <input
          className="password"
          type={showPassword? "text":"password"}
          placeholder="Enter your password..."
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />{" "}
        <span className="eye-icon-password" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Icon toggles */}
          </span>
        <br />
        <button type="submit" className="btn" >
          Login
        </button>
      </form>
      {error && <p style={{ color: "red", fontSize: "18px" }}>{error}</p>}
        
    </div>
    </>
}
    </div>
  );
};

export default Signin;
