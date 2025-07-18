import express from "express";
import cors from "cors";
import { deepResearch, generatePredictionTree } from "./research";
import env from "dotenv";
env.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/app", (req, res) => {
  res.json({ message: "AI Research Engine API is running!" });
});

// research form endpoint
app.post("/api/research", async (req, res) => {
  try {
    const { query, depth = 2, breadth = 2 } = req.body;

    console.log(
      `Starting research: "${query}" (depth: ${depth}, breadth: ${breadth})`
    );

    // use existing functions
    const research = await deepResearch(query, depth, breadth);
    const predictionTree = generatePredictionTree(research);

    res.json(predictionTree);
  } catch (error) {
    console.error("Research failed:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
