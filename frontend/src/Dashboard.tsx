import React from "react";
import "./Dashboard.css";

interface DashboardProps {
  results: any;
  isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <h3>🔍 Deep Research in Progress...</h3>
        <p>Analyzing sources and generating predictions</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="dashboard-placeholder">
        <h3> 🤖 Enter a topic above to begin! </h3>
        <p>Our AI will analyze multiple sources and generate predictions</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="confidence-section">
        <h2>📊 Analysis Confidence</h2>
        <div className="confidence-meter">
          <div className="confidence-circle">
            <span className="confidence-text">{results.percentage}</span>
          </div>
          <p>Based on {results.sourceCount} sources analyzed</p>
        </div>
      </div>

      <div className="predictions-section">
        <h2>🔮 Analysis & Predictions</h2>
        <div className="predictions-grid">
          {results.predictions?.map((pred: any, index: number) => (
            <div
              key={index}
              className={`prediction-card ${pred.prediction}-confidence`}
            >
              <div className="prediction-header">
                <span className="confidence-badge">{pred.prediction}</span>
              </div>
              <p className="prediction-text">{pred.theory}</p>
              <div className="follow-up">
                <strong>💡 Follow-up Questions:</strong>
                <ul>
                  {pred.followupQuestions?.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sources-section">
        <h2>📚 Sources </h2>
        <div className="sources-grid">
          {results.sources?.map((source: any, index: number) => (
            <div key={index} className="source-card">
              <h4>{source.title}</h4>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                View Source →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
