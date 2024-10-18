const express = require("express");
const router = express.Router();
const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
router.post("/register", async (req, res) => {
  console.log(req.body); 
  try {
    const { name, email, password } = req.body;

    
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ status: "error", message: "Email already in use" });
    }
     
    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });


    const token = jwt.sign(
      {
        userId: newUser._id,
      },
      "123abc",
      { expiresIn: "1d" }
    );
    
    return res.status(201).json({ status: "success", user: newUser, token });
    
  } catch (err) {
    console.error("Registration Error:", err); 
    return res.status(500).json({ status: "error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log('invalid email')
      return res.status(400).json({ message: "User not found please check your password or email!" });
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign(
          {
            userId: user._id
          },
          "123abc",
          { expiresIn: "1hr" }
        );
       
        return res.status(200).json({ status: "success", token });
        
      } else {
        console.log('invalid pass')
        return res.status(400).json({ message: "Incorrect password" });
      }
    }
  } catch (error) {
    res.status(500).json({ message:'Server error' });
  }
});

router.post("/logout", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await userModel.deleteOne({ email });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
