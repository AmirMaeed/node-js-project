const express= require("express");
const Contact = require("../models/Contact.js");
const nodemailer = require("nodemailer") ;
const user = require("../models/userModel.js");

const router = express.Router();

// GET - Contact Us Page
router.get("/contact",(req, res) => {
     
    res.render("contact", { user: res.locals.user });
  });
  

router.post("/contact", async (req, res) => {
    const { name, email, message,subject } = req.body;
    const newMessage = new Contact({ name, email, message,subject});
    await newMessage.save();

    if (!email || !subject || !message) {
        return res.status(400).send("❌ All fields are required.");
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject, // Make sure 'subject' is correctly retrieved
            text: message,
            replyTo:process.env.EMAIL_USER,
        };

        await transporter.sendMail(mailOptions);
        res.send("✅ Email sent successfully!");
    } catch (error) {
        console.error("Email error:", error);
        res.send("❌ Failed to send email.");
    }
});


// Handle Email Sending
router.post("/send-email", async (req, res) => {
    const { emails, subject, message } = req.body;

    // Ensure emails is an array (single selection returns a string)
    const recipients = Array.isArray(emails) ? emails : [emails];

    if (!recipients.length) {
        return res.status(400).send("❌ Please select at least one recipient.");
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Use App Password if using Gmail
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipients.join(","), // Convert array to comma-separated string
            subject: subject,
            text: message,
        };

        await transporter.sendMail(mailOptions);
        res.send(`✅ Email sent successfully to: ${recipients.join(", ")}`);
    } catch (error) {
        console.error("Email error:", error);
        res.send("❌ Failed to send email.");
    }
});

router.post("/footerEmail", async (req, res) => {
    const { name, email, message,subject } = req.body;

  
    if (!name || !email || !message || !subject) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMessage = new Contact({ name, email, message,subject});
    await newMessage.save();

  


    try {
        // Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        // Email Options
        const mailOptions = {
            from: `"${name}" <${email}>`,  // Sender's email
            to: process.env.EMAIL_USER, // Change to the recipient's email
            subject: subject,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            replyTo: email,
        };
             
        // Send Email
        await transporter.sendMail(mailOptions);
        res.redirect('contact');
    } catch (error) {
        console.error("Email error:", error);
        res.send("Failed to send message ❌");
    }})

module.exports = router;

