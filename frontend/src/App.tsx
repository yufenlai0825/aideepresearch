import React, { useState } from "react";
import "./App.css";
import ResearchForm from "./research";

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
      // TODO: Add API call to backend here
      console.log("Research request:", { query, depth, breadth });

      // placeholder
      setTimeout(() => {
        setResults({ message: "Research functionality coming next!" });
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Research failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Research Agent</h1>
        <p>Deep Research & Prediction Tool</p>
      </header>

      <main>
        <ResearchForm onSubmit={handleResearch} isLoading={isLoading} />

        {results && (
          <div
            style={{
              margin: "20px",
              padding: "20px",
              border: "1px solid #ccc",
            }}
          >
            <h3>Results:</h3>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
