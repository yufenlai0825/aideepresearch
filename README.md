# DeepResearch – AI-Powered Research & Prediction Tool

- research + filters relevant online content using LLaMA-3
- summarizes key insights, and builds a prediction tree based on web results
- a frontend will be added soon to make this a full-stack application
- Exa API tokens are required locally

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## Features

- Generates multiple search queries using LLaMA-3 (via Groq)
- Web search using Exa API
- Filters and evaluates relevant sources automatically
- Learning, recursively deep research based on follow-up questions
- Builds a final prediction tree based on deep research result

---

## Example Output

```json
{
  "root": "Predict the ending of Stranger Things final season based on fan theories and cast hints.",
  "percentage": "75%",
  "sourceCount": 6,
  "theories": 4,
  "predictions": [
    {
      "theory": "Vecna will return as the final antagonist in a climactic battle.",
      "followupQuestions": [
        "Will Eleven sacrifice herself?",
        "Will Hawkins be destroyed?"
      ],
      "prediction": "high"
    },
    {
      "theory": "The Upside Down will merge permanently with Hawkins.",
      "followupQuestions": [
        "Is the Upside Down a creation of Eleven?",
        "Will the portal remain open?"
      ],
      "prediction": "medium"
    }
  ],
  "sources": [
    {
      "title": "Fan Theory Thread on Reddit",
      "url": "https://reddit.com/..."
    },
    {
      "title": "Interview with Stranger Things Cast",
      "url": "https://example.com/interview"
    }
  ],
  "topPrediction": "Vecna will return as the final antagonist in a climactic battle.",
  "analysisDate": "2025-07-17T22:33:11.222Z"
}
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following key:

```env
GROQ_API_KEY=your_groq_api_key
EXA_API_KEY=your_exa_api_key
```
