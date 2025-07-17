const express = require("express");
const cors = require("cors");
const env = require("dotenv");
env.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/app", (req, res) => {
  res.json({ message: "AI Research Engine API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
