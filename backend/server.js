require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitizeHtml = require("sanitize-html");
const xss = require("xss-clean");

const app = express();
const PORT = process.env.PORT || 3001;

// Basic Security Headers
app.use(helmet());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 5 minutes",
});
app.use("/contact", limiter);

// CORS configuration - restrict to your Vercel frontend domain
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://127.0.0.1:5501",
      process.env.FRONTEND_URL,
    ], // Add this to your .env file
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Body parser with size limit
app.use(express.json({ limit: "50kb" }));

// MySQL connection with connection pool
const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 10,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      "Database Connected Successfully! Connection ID:",
      connection.threadId
    );
    connection.release();
  } catch (err) {
    console.log("Database Connection Failed:", err.stack);
    process.exit(1); // Exit if we can't connect to the database
  }
})();

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    });
  }
  next();
};

app.post(
  "/contact",
  sanitizeInput,
  [
    body("name")
      .trim()
      .notEmpty()
      .escape()
      .isLength({ max: 100 })
      .withMessage("Name is required and must be less than 100 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email format"),
    body("mobile").isMobilePhone().withMessage("Invalid mobile number"),
    body("message")
      .trim()
      .notEmpty()
      .escape()
      .isLength({ max: 1000 })
      .withMessage("Message is required and must be less than 1000 characters"),
  ],
  async (req, res) => {
    try {
      // Validation check
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, mobile, message } = req.body;

      // Email configuration with secure settings
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      let mailOptions = {
        from: `"Contact Form" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `New Contact Form Submission`,
        text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nMessage: ${message}`,
      };

      // Database operation with prepared statement
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
          "INSERT INTO contacts (username, email, mobile, message) VALUES (?, ?, ?, ?)",
          [name, email, mobile, message]
        );

        await transporter.sendMail(mailOptions);

        await connection.commit();
        res.status(200).json({
          // success: true,
          message: "Your message has been sent successfully",
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({
        success: false,
        error: "An error occurred while processing your request",
      });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  pool.end(() => {
    console.log("Database pool closed.");
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
