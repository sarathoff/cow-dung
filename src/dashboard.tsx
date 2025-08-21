import React, { useState, useEffect } from "react";

// This CSS is now included directly in the component to avoid import errors.
const styles = `
.dashboard-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  border: 1px solid #e5e7eb;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
}

.batch-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.batch-table th, .batch-table td {
  border: 1px solid #e5e7eb;
  padding: 12px;
  text-align: left;
}

.batch-table th {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #374151;
}

.loading-text, .error-text {
  text-align: center;
  font-size: 1.1rem;
  color: #6b7280;
  padding: 2rem;
}
`;

// Define the TypeScript types for our data to ensure type safety
interface Property {
    trait_type: string;
    value: string;
}

interface Batch {
    id: string;
    name: string;
    properties: Property[];
}

export default function Dashboard() {
  // State to store the list of batches
  const [batches, setBatches] = useState<Batch[]>([]);
  // State to handle the loading screen
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to handle any errors during fetching
  const [error, setError] = useState<string | null>(null);

  // This `useEffect` hook runs once when the component is first loaded.
  // Its job is to fetch the data from our backend server.
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        // Call the /get-batches endpoint on our server
        const response = await fetch('https://cow-dung.onrender.com/get-batches');
        if (!response.ok) {
          throw new Error('Failed to fetch data from the server.');
        }
        const data = await response.json();
        setBatches(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []); // The empty array [] means this effect runs only once on mount

  // Show a loading message while data is being fetched
  if (isLoading) {
    return <div className="dashboard-container"><p className="loading-text">Loading batch records from the blockchain...</p></div>;
  }

  // Show an error message if something went wrong
  if (error) {
    return <div className="dashboard-container"><p className="error-text">Error: {error}</p></div>;
  }

  return (
    <div>
        <style>{styles}</style>
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Owner's Dashboard</h1>
            </div>
            
            <table className="batch-table">
                <thead>
                    <tr>
                        <th>Token ID</th>
                        <th>Farmer Name</th>
                        <th>Weight (KG)</th>
                        <th>Origin</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.length > 0 ? (
                        batches.map((batch) => (
                            <tr key={batch.id}>
                                <td>{batch.id.slice(0, 8)}...</td>
                                <td>{batch.name.replace('Batch from ', '')}</td>
                                {/* Find the 'Weight' property in the properties array */}
                                <td>{batch.properties.find(p => p.trait_type === "Weight (KG)")?.value || 'N/A'}</td>
                                {/* Find the 'Origin' property in the properties array */}
                                <td>{batch.properties.find(p => p.trait_type === "Origin")?.value || 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center' }}>No batches have been created yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
