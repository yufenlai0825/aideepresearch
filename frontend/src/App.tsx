import React, { useState } from "react";
import "./App.css";
import ResearchForm from "./research";
import Dashboard from "./Dashboard";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleResearch = async (
    query: string,
    depth: number,
    breadth: number
  ) => {
    setIsLoading(true);
    setResults(null);

    try {
      console.log("Sending research request:", { query, depth, breadth });

      const response = await fetch("http://localhost:3001/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, depth, breadth }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Research failed:", error);
      setResults({ error: "Research failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Deep Research & Forecasting Engine</h1>
        <p>Multi-Source Analysis + Prediction</p>
      </header>

      <main className="app-main">
        <div className="container">
          <section className="research-section">
            <ResearchForm onSubmit={handleResearch} isLoading={isLoading} />
          </section>

          <section className="dashboard-section">
            <Dashboard results={results} isLoading={isLoading} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
