# AI Deep Research & Forecasting Engine – Full-Stack Application

**AI Deep Research & Forecasting Engine** is a full-stack tool built with TypeScript that performs web searches, analyzes content using LLM, and generates analysis/predictions with confidence scoring.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 📌 Features

- **AI Research Engine**

  - Multi-level recursive web search with configurable depth & breadth
  - Smart duplicate source detection and relevance evaluation
  - Follow-up queries + questions generation

- **Analysis & Prediction**

  - Using domain to score for source credibility
  - Content quality analysis with confidence calculation algorithms
  - Confidence rating + prediction reliability

---

## 🎥 Live Demos

**Research**

![Application Demo](./assets/search.gif)

**Results Dashboard**

- Color-coded analysis/prediction confidence levels
- With sources provided to be verified

![Application Demo](./assets/result.gif)

## 🛠️ Tech Stack

| Category            | Tech Used                       |
| ------------------- | ------------------------------- |
| **Backend**         | Node.js, Express.js, TypeScript |
| **Frontend**        | React, CSS                      |
| **AI/ML**           | Groq API (LLaMA 3.3 70B)        |
| **Web Search**      | Exa API                         |
| **Version Control** | Git & GitHub                    |

---

## 💻 Installation & Setup

### Installation

```bash
git clone https://github.com/yourusername/aideepresearch.git
cd ai-deep-research-engine

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### Environment Variables

Create a .env file in the backend directory with the following keys:

```bash
GROQ_API_KEY=               # Your Groq API Key
EXA_API_KEY=                # Your Exa API Key
```

### Running the Application

```bash
# Terminal 1 - Start Backend API
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm start
```

---

## 🤖 Response Format

```json
{
  "root": "Predict the outcome of renewable energy adoption in 2025",
  "percentage": "78%",
  "sourceCount": 4,
  "theories": 4,
  "predictions": [
    {
      "theory": "Solar energy adoption will accelerate due to decreasing costs and government incentives",
      "followupQuestions": [
        "What impact will battery storage have?",
        "How will grid infrastructure adapt?"
      ],
      "prediction": "high"
    }
  ],
  "sources": [
    {
      "title": "Renewable Energy Outlook 2025",
      "url": "https://example.com/report"
    }
  ],
  "topPrediction": "Solar energy adoption will accelerate due to decreasing costs",
  "analysisDate": "2025-07-18T10:30:00.000Z"
}
```
