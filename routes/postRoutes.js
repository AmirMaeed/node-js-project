const express = require("express");
const router = express.Router();
const Post = require("../models/postModel");
const path = require("path");
const app = express();
const verifyToken = require("../middleware/jwtMiddleware");
const upload = require("../middleware/multer");
const checkRole = require("../middleware/roleMiddleware");

const paginate = require("../middleware/paginate");
// ✅  GET: Show Form to Add a New Post
router.get("/Admin/addblog" ,checkRole("admin"),verifyToken, (req, res) => {
    res.render("Admin/addblog" ,{ user: req.user });
});

// ✅ 1️⃣ GET: Fetch All Posts (Home Page)

// router.get("/blog", async (req, res) => {
//     try {

       
//             const searchQuery = req.query.search || ""; // Get search input from URL
        
//             let filter = {}; // Default: show all posts
//             if (searchQuery) {
//               filter = {
//                 $or: [
//                   { title: { $regex: searchQuery, $options: "i" } }, // Search in title
//                   { content: { $regex: searchQuery, $options: "i" } }, // Search in content
//                 ],
//               };
//             }

//       let { page, limit } = req.query;
      
//       page = parseInt(page) || 1;   // Default to page 1
//       limit = parseInt(limit) || 2; // Default limit of 5 posts per page
  
//       const skip = (page - 1) * limit;
  
//       // Fetch paginated posts
//       const posts = await Post.find().skip(skip).limit(limit).sort({ createdAt: -1 }); ;
      
//       // Get total post count
//       const totalPosts = await Post.countDocuments();
   
//       res.render("blog", {
//         searchQuery,
//         posts,
//         currentPage: page,
//         totalPages: Math.ceil(totalPosts / limit),
//         limit
//       });
  
//     } catch (error) {
//       res.status(500).send("Server Error: " + error.message);
//     }
//   });

  router.get("/blog", async (req, res) => {
    try {
      const searchQuery = req.query.search || "";
      const sortField = req.query.sortBy || "createdAt";
      const sortOrder = req.query.order === "asc" ? 1 : -1;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 2;
  
      const filter = searchQuery
        ? {
            $or: [
              { title: { $regex: searchQuery, $options: "i" } },
              { content: { $regex: searchQuery, $options: "i" } }
            ]
          }
        : {};
  
      const { results: posts, currentPage, totalPages } = await paginate({
        model: Post,
        filter,
        page,
        limit,
        sort: { [sortField]: sortOrder },
        populate: "" // or "author" if you have a ref
      });
  
      res.render("blog", {
        searchQuery,
        posts,
        currentPage,
        totalPages,
        limit
      });
    } catch (error) {
      console.error("Pagination error:", error);
      res.status(500).send("Internal Server Error");
    }
  });





// ✅ 2️⃣ get single a Post
router.get("/blog/:id", async (req, res) => {
    try {
       const post = await Post.findById(req.params.id);
        res.render("details",{post});
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Internal Server Error");
    }
});


 // Route to render the Add Post page
 

 // ✅ POST: Create a New Post — Only for admin
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { title, content } = req.body;
        const image = req.file ? req.file.filename : null;

        const newPost = new Post({ title, image, content });
        await newPost.save();

        console.log("Post added successfully:", newPost);
        res.redirect("/blog");
    } catch (error) {
        console.error("Error adding post:", error);
        res.status(500).send("Internal Server Error");
    }
});



// ✅ 5️⃣ GET: Show Edit Post Form
router.get("/edit/:id",checkRole("admin"), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send("Post not found");
        }
        res.render("Admin/editpost", { post });
    } catch (error) {
        console.error("Error fetching post for editing:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ 6️⃣ POST: Update an Existing Post
router.post("/update/:id",checkRole("admin"), upload.single("image"), async (req, res) => {
    try {
        let updatedData = {
            title: req.body.title,
            content: req.body.content
        };

        // If a new image is uploaded, update it
        if (req.file) {
            updatedData.image = req.file.filename;
        }

        await Post.findByIdAndUpdate(req.params.id, updatedData);
        res.redirect("/");
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ 7️⃣ POST: Delete a Post
router.post("/delete/:id",checkRole("admin"), async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
