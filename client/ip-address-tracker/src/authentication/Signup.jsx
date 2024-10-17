import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Signup.css'
import { FaSpinner } from "react-icons/fa";
import BounceBall from "./BounceBall";
import { FaEye, FaEyeSlash } from "react-icons/fa"
const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [load,setLoad] =useState(false)
  const [error,setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      const res = await axios.post("http://localhost:3001/users/register", {
        name,
        email,
        password,
      });
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
         ( load && !error) ? <FaSpinner className="spin"/>
      :
      <>
      <BounceBall/>
     <div className="signup-container">
    <div className="signup-form">
      <h1>Register Form</h1>
      <form onSubmit={handleSubmit}>
        <input className="name"
          type="text"
          placeholder="Enter your name..."
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />{" "}
        <br />
        <input className="email"
          type="email"
          placeholder="Enter your email..."
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />{" "}
        <br />
        <input className="password"
          type={showPassword? "text":"password"}
          placeholder="Enter your password..."
          value={password}
          size={7}
          required
          onChange={(e) => setPassword(e.target.value)}
        />{" "}
        <span className="eye-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash style={{fontSize:"15px"}}/> : <FaEye />} {/* Icon toggles */}
          </span>
        <br />
        <button type="submit" className="btn">Submit</button>
      </form>
      {error && <p style={{ color: "red", fontSize: "18px" }}>{error}</p>}
      <div style={{height:"45px",width:"100%",display:"flex",flexDirection:"row"}}>
      <p style={{color:"black",fontSize:"14px",}}>Already have an accout!</p>
     <a href="./signin" style={{bottom:"-35px",fontSize:"17px"}}>Signin</a>
    </div>
    </div>
    </div>
    </>
}
    </div>
  );
};

export  default Signup;