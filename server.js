require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

// Database & Middleware
const db = require("./config/db");
const verifyToken = require("./middleware/jwtMiddleware");
db(); // Connect to MongoDB

// Models
const Post = require("./models/postModel");
const User = require("./models/userModel");

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Set res.locals.user globally from token (for views)
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = decoded;
    } catch (err) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

// Routes
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const postRoutes = require('./routes/postRoutes');
const contactRoutes = require('./routes/contact');
const searchRoutes = require('./routes/search');

app.use("/", userRoutes);
app.use("/", teamRoutes);
app.use("/", postRoutes);
app.use("/", contactRoutes);
app.use("/", searchRoutes);

// Pages
app.get("/", async (req, res) => {
  res.render("index", { user: res.locals.user });
});

app.get("/about", (req, res) => {
  res.render("about", { user: res.locals.user });
});

app.get("/team", (req, res) => {
  res.render("team", { user: res.locals.user });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logo", (req, res) => {
  res.render("logo");
});

// Users List Page
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.render("user", { users });
});

// 404 Page
app.use((req, res) => {
  res.status(404).render("404");
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
