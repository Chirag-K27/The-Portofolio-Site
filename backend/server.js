require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect((err) => {
  if (err) {
    console.log("Database Connection Failed: " + err.stack);
    return;
  }

  console.log("Database Connected Successfully: " + connection.threadId);
});

app.post("/contact", async (req, res) => {
  try {
    const { name, email, mobile, message } = req.body;

    if (!name || !email || !mobile || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ message: "Your message has been sent successfully" });

    const sql =
      "INSERT INTO contacts (username, email, mobile, message) VALUES (?, ?, ?, ?)";
    connection.query(sql, [name, email, mobile, message], (err) => {
      if (err) console.error("DB Error Storing Contact Form Details: " + err);
    });
  } catch (error) {
    console.error("Error Sending Email: ", error);
    res.status(500).json({
      error: "Something went wrong / Error while Sending the Message",
    });
  }
});

// app.post("/track-visitor", (req, res) => {
//   const ip =
//     req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

//   const userAgent = req.headers["user-agent"] || "unknown";

//   const referrer =
//     req.headers["referer"] || req.headers["referrer"] || "Direct Visit";

//   const sql =
//     "INSERT INTO visitors (ip_address, user_agent, referrer) VALUES (?, ?, ?)";
//   connection.query(sql, [ip, userAgent, referrer], (err) => {
//     if (err) console.error("DB Error Storing Visitor Details: " + err);
//   });

//   res.status(200).end;
// });
