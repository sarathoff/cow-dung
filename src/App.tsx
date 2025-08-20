import React, { useState } from "react";

// This CSS is now included directly in the component.
const styles = `
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  border: 1px solid #e5e7eb;
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #111827;
}

.description {
  color: #4b5563;
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.mint-form {
  margin-top: 2rem;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.mint-form h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
}

.input-field {
  width: calc(100% - 24px);
  padding: 12px;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.submit-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.submit-button:hover {
  background-color: #1d4ed8;
}

.status-message {
    margin-top: 1.5rem;
    font-weight: 500;
}
`;

export default function App() {
  const [farmerName, setFarmerName] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!farmerName || !weight) {
      setStatus("Please fill out all fields.");
      return;
    }
    setIsLoading(true);
    setStatus("Submitting to the blockchain...");

    try {
      // This sends the data to our new backend server
      const response = await fetch('http://localhost:3001/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerName, weight })
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`✅ Success! View Transaction: <a href="${result.url}" target="_blank">Click Here</a>`);
        setFarmerName("");
        setWeight("");
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <style>{styles}</style>
      <div className="container">
        <div className="header">
          <h1 className="title">🐮 DungTrace</h1>
          <p className="description">
            A transparent supply chain for agricultural exports.
          </p>
        </div>

        <div className="mint-form">
          <h2>Register a New Batch</h2>
          <input
            type="text"
            placeholder="Farmer's Name"
            value={farmerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFarmerName(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Weight (KG)"
            value={weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
            className="input-field"
          />
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? "Submitting..." : "Create Batch Record"}
          </button>

          {status && (
            <p className="status-message" dangerouslySetInnerHTML={{ __html: status }}></p>
          )}
        </div>
      </div>
    </div>
  );
}
