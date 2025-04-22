const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('Enail already exists');
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
      });
  
      await newUser.save();
  
      res.redirect('/login');
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).send('Something went wrong during registration');
    }
  });

// User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.send("Invalid email!");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send("Invalid password!");

        const token = jwt.sign(
            { id: user._id, username: user.username,email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
        res.cookie("token", token, { httpOnly: true, secure: true });      
       
            res.redirect("/"); // Redirect to user dashboard if user is not admin
     
    } catch (err) {
        res.status(500).send("Error in login");
    }
});

// User Logout
router.get("/logout", (req, res) => {
     res.clearCookie("token");
    res.redirect("/login");
});

module.exports = router;
