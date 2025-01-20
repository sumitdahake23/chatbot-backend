const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Could not connect to the database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Handle user messages
app.post("/send-message", (req, res) => {
  const userMessage = req.body.userMessage.trim().toLowerCase(); 

  const query = "SELECT * FROM messages WHERE LOWER(user_message) = ?";

  db.query(query, [userMessage], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching predefined message." });
    }

    if (result.length > 0) {
      const botResponse = result[0].bot_response;

      const insertQuery = "INSERT INTO messages (user_message, bot_response) VALUES (?, ?)";
      db.query(insertQuery, [userMessage, botResponse]);

      return res.json({ botResponse });
    } else {
      const botResponse = "Sorry, I didn't understand that.";

      const insertQuery = "INSERT INTO messages (user_message, bot_response) VALUES (?, ?)";
      db.query(insertQuery, [userMessage, botResponse]);

      return res.json({ botResponse });
    }
  });
});

app.get("/messages", (req, res) => {
  const query = "SELECT * FROM messages";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ error: "Failed to retrieve messages." });
      return;
    }
    res.status(200).json(results);
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
