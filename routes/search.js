


const express= require("express");


const router = express.Router();
const Post = require("../models/postModel");



router.get("/search", async (req, res) => {
    try {
      const searchQuery = req.query.search || ""; // Get search input from URL
  
      let filter = {}; // Default: show all posts
      if (searchQuery) {
        filter = {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } }, // Search in title
            { content: { $regex: searchQuery, $options: "i" } }, // Search in content
          ],
        };
      }
  
      const posts = await Post.find(filter).sort({ createdAt: -1 });
  
      res.render("search", { posts, searchQuery }); // Send results to EJS
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).send("Error fetching blog posts.");
    }
  });
  
module.exports = router;
