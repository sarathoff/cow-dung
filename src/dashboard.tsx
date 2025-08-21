import React, { useState, useEffect } from "react";


// --- STYLES --- (Included for simplicity)
const styles = `
.dashboard-container { max-width: 100%; padding: 2rem; background-color: #ffffff; border-radius: 8px; font-family: 'Inter', sans-serif; }
.dashboard-header { text-align: center; margin-bottom: 2rem; }
.dashboard-title { font-size: 1.5rem; font-weight: 600; color: #111827; }
.batch-table-wrapper { overflow-x: auto; }
.batch-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.9rem; }
.batch-table th, .batch-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; white-space: nowrap; }
.batch-table th { background-color: #f3f4f6; font-weight: 600; color: #374151; }
.loading-text, .error-text { text-align: center; font-size: 1.1rem; color: #6b7280; padding: 2rem; }
.location-link { color: #2563eb; text-decoration: underline; font-weight: 500; }
`;

// --- TYPESCRIPT INTERFACES ---
// Defines the structure of the data we expect from the server
interface Property {
    trait_type: string;
    value: string;
}

interface Batch {
    id: string;
    name: string;
    properties: Property[];
}

// --- DASHBOARD COMPONENT ---
export default function Dashboard() {
  // State to store the list of batches fetched from the server
  const [batches, setBatches] = useState<Batch[]>([]);
  // State to manage the loading indicator
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to store any potential errors
  const [error, setError] = useState<string | null>(null);

  // This `useEffect` hook runs automatically once when the component is first loaded
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        // Fetch the data from the backend server
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
  }, []); // The empty array [] ensures this effect runs only once

  // Helper function to safely get a property value from the NFT metadata
  const getPropertyValue = (properties: Property[], traitType: string) => {
    const property = properties.find(p => p.trait_type === traitType);
    return property ? property.value : 'N/A';
  };

  // Display a loading message while fetching data
  if (isLoading) {
    return <div className="dashboard-container"><p className="loading-text">Loading batch records...</p></div>;
  }

  // Display an error message if the fetch fails
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
            
            <div className="batch-table-wrapper">
                <table className="batch-table">
                    <thead>
                        <tr>
                            <th>Token ID</th>
                            <th>Status</th>
                            <th>Farmer Name</th>
                            <th>Village</th>
                            <th>Location</th>
                            <th>Weight (KG)</th>
                            <th>Cow Breed</th>
                            <th>Feed Type</th>
                            <th>Collector</th>
                            <th>Quality Score</th>
                            <th>Registration Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.length > 0 ? (
                            batches.map((batch) => {
                                const lat = getPropertyValue(batch.properties, 'Latitude');
                                const lon = getPropertyValue(batch.properties, 'Longitude');
                                return (
                                <tr key={batch.id}>
                                    <td>{batch.id.slice(0, 8)}...</td>
                                    <td>{getPropertyValue(batch.properties, 'Status')}</td>
                                    <td>{getPropertyValue(batch.properties, 'Farmer Name')}</td>
                                    <td>{getPropertyValue(batch.properties, 'Village')}</td>
                                    <td>
                                        {lat !== 'N/A' ? (
                                            <a href={`https://www.google.com/maps?q=${lat},${lon}`} target="_blank" rel="noopener noreferrer" className="location-link">
                                                View Map
                                            </a>
                                        ) : 'N/A'}
                                    </td>
                                    <td>{getPropertyValue(batch.properties, 'Weight (KG)')}</td>
                                    <td>{getPropertyValue(batch.properties, 'Cow Breed')}</td>
                                    <td>{getPropertyValue(batch.properties, 'Feed Type')}</td>
                                    <td>{getPropertyValue(batch.properties, 'Collector Name')}</td>
                                    <td>{getPropertyValue(batch.properties, 'Quality Score (1-10)')}</td>
                                    <td>{getPropertyValue(batch.properties, 'Registration Timestamp')}</td>
                                </tr>
                            )})
                        ) : (
                            <tr>
                                <td colSpan={11} style={{ textAlign: 'center' }}>No batches have been created yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
