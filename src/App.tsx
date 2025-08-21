import React, { useState } from "react";
import Dashboard from "./dashboard"; // Import the new Dashboard component
import { QrReader } from 'react-qr-reader'; // Import QR Reader

// This CSS is now included directly in the component.
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Inter', sans-serif; /* Applied Inter font here */
  border: 1px solid #e5e7eb;
}

.header {
  text-align: center;
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

.nav-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 1.5rem;
}

.nav-button {
    background-color: #ffffff;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.nav-button:hover:not(.active) {
    background-color: #f3f4f6;
}

.nav-button.active {
    background-color: #2563eb;
    color: white;
    border-color: #2563eb;
}

.mint-form {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
}

.mint-form h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
  text-align: center;
}

.input-field {
  width: calc(100% - 24px);
  padding: 12px;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 16px;
  box-sizing: border-box; /* Ensures padding doesn't increase width */
}

.submit-button, .qr-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.qr-button {
    background-color: #10b981; /* A different color for QR button */
    margin-bottom: 1rem;
}

.qr-button:hover:not(:disabled) {
    background-color: #059669;
}

.submit-button:hover:not(:disabled), .cancel-qr-button:hover {
    background-color: #1d4ed8;
}

.submit-button:disabled, .qr-button:disabled, .cancel-qr-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-qr-button {
    background-color: #ef4444; /* Red color for cancel */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    margin-top: 1rem;
}

.status-message {
    margin-top: 1.5rem;
    font-weight: 500;
    text-align: center;
    color: #374151;
}

.qr-scanner-container {
    margin-top: 1.5rem;
    padding: 1rem;
    border: 1px dashed #d1d5db;
    border-radius: 8px;
    text-align: center;
}

.qr-scanner-info {
    color: #4b5563;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}
`;

export default function App() {
  const [view, setView] = useState<'mint' | 'dashboard'>('mint');
  const [farmerName, setFarmerName] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false); // New state for QR scanner

  const handleSubmit = async () => {
    if (!farmerName || !weight) {
      setStatus("Please fill out all fields.");
      return;
    }
    setIsLoading(true);
    setStatus("Submitting to the blockchain...");

    try {
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

  const handleScan = (result: any, error: any) => {
    if (!!result) {
      setFarmerName(result?.text); // Populate farmerName with QR content
      setStatus("QR Code Scanned Successfully!");
      setIsScanning(false); // Hide scanner after successful scan
    }

    if (!!error) {
      // console.info(error); // Log errors for debugging if needed
      // To avoid spamming status with constant errors, only show if serious or for development.
      // setStatus(`QR Scanner Error: ${error.message || 'Check camera permissions.'}`);
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

        {/* --- NAVIGATION BUTTONS --- */}
        <div className="nav-buttons">
            <button
                onClick={() => setView('mint')}
                className={`nav-button ${view === 'mint' ? 'active' : ''}`}
            >
                Register Batch
            </button>
            <button
                onClick={() => setView('dashboard')}
                className={`nav-button ${view === 'dashboard' ? 'active' : ''}`}
            >
                Owner's Dashboard
            </button>
        </div>

        {/* --- CONDITIONAL RENDERING --- */}
        {view === 'mint' ? (
            <div className="mint-form">
                <h2>Register a New Batch</h2>

                {!isScanning ? (
                    <>
                        {/* Farmer's Name Input Field */}
                        <input
                            type="text"
                            placeholder="Farmer's Name or Batch ID (can be scanned)"
                            value={farmerName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFarmerName(e.target.value)}
                            className="input-field"
                        />
                        {/* QR Scan Button */}
                        <button
                            onClick={() => setIsScanning(true)}
                            className="qr-button"
                            disabled={isLoading}
                        >
                            Scan QR Code
                        </button>

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
                    </>
                ) : (
                    <div className="qr-scanner-container">
                        <p className="qr-scanner-info">Position QR code within the frame to scan.</p>
                        <QrReader
                            onResult={handleScan}
                            scanDelay={300} // milliseconds
                            constraints={{ facingMode: 'environment' }} // Prefer rear camera
                            style={{ width: '100%' }}
                            // You can add styles or a wrapper div if needed
                        />
                        <button
                            onClick={() => setIsScanning(false)}
                            className="cancel-qr-button"
                        >
                            Cancel Scan
                        </button>
                    </div>
                )}

                {status && (
                    <p className="status-message" dangerouslySetInnerHTML={{ __html: status }}></p>
                )}
            </div>
        ) : (
            <Dashboard />
        )}
      </div>
    </div>
  );
}