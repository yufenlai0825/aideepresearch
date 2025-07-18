import React, { useState } from "react";

interface ResearchFormProps {
  onSubmit: (query: string, depth: number, breadth: number) => void;
  isLoading: boolean;
}

const ResearchForm: React.FC<ResearchFormProps> = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState(2);
  const [breadth, setBreadth] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query, depth, breadth);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "20px", maxWidth: "600px" }}>
      <div style={{ marginBottom: "15px" }}>
        <label>
          Research Topic:
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Predict the ending of Stranger Things final season"
            style={{
              width: "100%",
              height: "80px",
              margin: "5px 0",
              padding: "10px",
            }}
            disabled={isLoading}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
        <label>
          Depth:
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>

        <label>
          Breadth:
          <select
            value={breadth}
            onChange={(e) => setBreadth(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={isLoading || !query.trim()}>
        {isLoading ? "Researching..." : "Start Research"}
      </button>
    </form>
  );
};

export default ResearchForm;
