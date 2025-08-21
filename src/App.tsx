import React, { useState, useEffect, useCallback } from "react";
import { QrReader } from 'react-qr-reader';
import QRCode from "react-qr-code";
import Dashboard from "./dashboard";

// --- STYLES (Mobile-First & Responsive) ---
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body { 
    font-family: 'Inter', sans-serif; 
    background-color: #f3f4f6; 
    margin: 0;
    padding: 1rem;
}

.container { 
    max-width: 900px; 
    margin: 0 auto; 
    padding: 1.5rem; 
    background-color: #ffffff; 
    border-radius: 16px; 
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); 
}

.header { text-align: center; margin-bottom: 2rem; }
.title { font-size: 2.2rem; font-weight: 700; color: #111827; }
.description { color: #4b5563; margin-top: 0.5rem; font-size: 1rem; }

.top-bar { 
    display: flex; 
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem; 
    border-bottom: 1px solid #e5e7eb; 
    padding-bottom: 1.5rem; 
}

.role-selector, .nav-buttons { 
    display: flex; 
    justify-content: center; 
    gap: 0.5rem; 
    flex-wrap: wrap;
}

.role-button, .nav-button { 
    background-color: #e5e7eb; 
    color: #374151; 
    border: none; 
    padding: 12px 20px; 
    border-radius: 8px; 
    font-size: 1rem; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.2s; 
}

.role-button:hover, .nav-button:hover:not(.active) { 
    background-color: #d1d5db; 
}

.nav-button.active {
    background-color: #2563eb;
    color: white;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

.lang-select { 
    padding: 10px; 
    border-radius: 8px; 
    border: 1px solid #d1d5db; 
    font-family: 'Inter', sans-serif; 
    font-weight: 500; 
    align-self: center;
}

.form-container { padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; }
.form-container h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #111827; text-align: center; }
.input-field, .select-field { width: 100%; padding: 12px; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #d1d5db; font-size: 16px; box-sizing: border-box; }
.submit-button { background-color: #2563eb; color: white; border: none; padding: 14px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; }
.submit-button:disabled { opacity: 0.5; cursor: not-allowed; }
.status-message { margin-top: 1.5rem; font-weight: 500; text-align: center; padding: 1rem; border-radius: 8px; word-break: break-word; }
.status-success { background-color: #d1fae5; color: #065f46; }
.status-error { background-color: #fee2e2; color: #991b1b; }
.qr-section { margin-top: 2rem; padding: 1.5rem; border: 2px dashed #d1d5db; border-radius: 8px; text-align: center; }
.pending-list { list-style: none; padding: 0; }
.pending-item { background-color: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; border: 1px solid #e5e7eb; cursor: pointer; transition: background-color 0.2s; }
.pending-item:hover { background-color: #eff6ff; }
.pending-item span { font-size: 0.8rem; color: #6b7280; }
.refresh-button { background-color: #6b7280; margin-left: 1rem; }
.quality-score-display { text-align: center; font-size: 1.2rem; font-weight: 600; margin: 1.5rem 0; padding: 1rem; background-color: #eff6ff; border-radius: 8px; color: #1e40af; }

@media (min-width: 640px) {
    .top-bar {
        flex-direction: row;
    }
    .lang-select {
        align-self: auto;
    }
}
`;

// --- TRANSLATIONS ---
const translations = {
    en: { title: "DungTrace", farmer: "Farmer", collector: "Collector", owner: "Owner", addLoad: "Add New Load", scanFarmerQR: "Scan Farmer ID QR", weight: "Weight (KG)", createRecord: "Create Record", submitting: "Submitting...", pendingCollections: "Pending Collections", verifyBatch: "Verify Batch", qualityScore: "Calculated Quality Score", updateRecord: "Update Record", password: "Password", enter: "Enter", collectorName: "Collector's Name", refresh: "Refresh List", village: "Village", cowBreed: "Cow Breed", feedType: "Feed Type", moisture: "Moisture Level (%)", purity: "Purity Score (1-10)" },
    ta: { title: "சாணம்தடம்", farmer: "விவசாயி", collector: "சேகரிப்பாளர்", owner: "உரிமையாளர்", addLoad: "புதிய சுமையைச் சேர்க்கவும்", scanFarmerQR: "விவசாயி QR ஐ ஸ்கேன் செய்யவும்", weight: "எடை (கிலோ)", createRecord: "பதிவை உருவாக்கவும்", submitting: "சமர்ப்பிக்கப்படுகிறது...", pendingCollections: "நிலுவையில் உள்ள சேகரிப்புகள்", verifyBatch: "தொகுப்பைச் சரிபார்க்கவும்", qualityScore: "கணக்கிடப்பட்ட தர மதிப்பெண்", updateRecord: "பதிவைப் புதுப்பிக்கவும்", password: "கடவுச்சொல்", enter: "உள்ளிடவும்", collectorName: "சேகரிப்பாளர் பெயர்", refresh: "பட்டியலைப் புதுப்பிக்கவும்", village: "கிராமம்", cowBreed: "மாட்டின் இனம்", feedType: "தீவன வகை", moisture: "ஈரப்பதம் (%)", purity: "தூய்மை மதிப்பெண் (1-10)" },
    // Other languages can be added here
};

// --- MOCK FARMER DATABASE ---
const farmersDB: { [key: string]: { name: string, village: string } } = {
    "FARMER_001": { name: "Sarath", village: "Tindivanam" },
    "FARMER_002": { name: "Priya", village: "Chembarambakkam" },
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const t = translations[lang];

  const handleAuth = () => {
      if ((role === 'collector' && password === 'collector123') || (role === 'owner' && password === 'owner123')) {
          setIsAuthenticated(true);
      } else {
          alert("Incorrect Password");
      }
  };

  if (!role) {
      return (
          <div>
              <style>{styles}</style>
              <div className="container">
                  <div className="header">
                      <h1 className="title">🐮 {t.title}</h1>
                  </div>
                  <div className="role-selector">
                      <button className="role-button" onClick={() => setRole('farmer')}>{t.farmer}</button>
                      <button className="role-button" onClick={() => setRole('collector')}>{t.collector}</button>
                      <button className="role-button" onClick={() => setRole('owner')}>{t.owner}</button>
                  </div>
              </div>
          </div>
      );
  }

  if ((role === 'collector' || role === 'owner') && !isAuthenticated) {
      return (
          <div>
              <style>{styles}</style>
              <div className="container">
                  <h2>Enter {role} Password</h2>
                  <input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
                  <button onClick={handleAuth} className="submit-button">{t.enter}</button>
              </div>
          </div>
      );
  }

  return (
    <div>
      <style>{styles}</style>
      <div className="container">
        <div className="header">
            <h1 className="title">🐮 {t.title}</h1>
        </div>
        <div className="top-bar">
            <div className="nav-buttons">
                <button onClick={() => setRole('farmer')} className={`nav-button ${role === 'farmer' ? 'active' : ''}`}>{t.farmer}</button>
                <button onClick={() => setRole('collector')} className={`nav-button ${role === 'collector' ? 'active' : ''}`}>{t.collector}</button>
                <button onClick={() => setRole('owner')} className={`nav-button ${role === 'owner' ? 'active' : ''}`}>{t.owner}</button>
            </div>
            <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value as any)}>
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
        </div>
        {role === 'farmer' && <FarmerView t={t} />}
        {role === 'collector' && <CollectorView t={t} />}
        {role === 'owner' && <Dashboard />}
      </div>
    </div>
  );
}

// --- FARMER COMPONENT ---
const FarmerView = ({ t }: { t: any }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState<{ id: string, name: string, village: string } | null>(null);
    const [weight, setWeight] = useState("");
    const [cowBreed, setCowBreed] = useState("Gir");
    const [feedType, setFeedType] = useState("Grass-Fed");
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
    const [mintResult, setMintResult] = useState<{url: string, tokenId: string} | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => setStatus("Please enable location.")
        );
    }, []);

    const handleScan = (result: any) => {
        if (result) {
            const farmerId = result.text;
            const farmerInfo = farmersDB[farmerId];
            if (farmerInfo) {
                setScannedData({ id: farmerId, ...farmerInfo });
                setIsScanning(false);
            } else {
                setStatus("Invalid Farmer QR Code.");
                setIsScanning(false);
            }
        }
    };

    const handleMint = async () => {
        if (!scannedData || !weight || !location) {
            setStatus("Please scan your ID and enter weight.");
            return;
        }
        setIsLoading(true);
        setStatus(t.submitting);
        setMintResult(null);
        try {
            const response = await fetch('https://cow-dung.onrender.com/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmerId: scannedData.id, weight, cowBreed, feedType, latitude: location.lat, longitude: location.lon })
            });
            const result = await response.json();
            if (response.ok) {
                setStatus(`✅ ${t.success}`);
                setMintResult({url: result.url, tokenId: result.tokenId});
                setScannedData(null); setWeight("");
            } else { throw new Error(result.error); }
        } catch (error: any) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>{t.addLoad}</h2>
            {!scannedData && !mintResult && (
                <button onClick={() => { setStatus(''); setIsScanning(true); }} className="submit-button">{t.scanFarmerQR}</button>
            )}
            {isScanning && (
                <div className="qr-section">
                    <div style={{ width: '100%' }}>
                        <QrReader
                            constraints={{ facingMode: 'environment' }}
                            onResult={(result, error) => {
                                if (result) handleScan(result);
                            }}
                        />
                    </div>
                    <button onClick={() => setIsScanning(false)} style={{ marginTop: '1rem' }}>Cancel</button>
                </div>
            )}
            {scannedData && (
                <div>
                    <p><strong>Farmer:</strong> {scannedData.name}, {scannedData.village}</p>
                    <input type="number" placeholder={t.weight} value={weight} onChange={(e) => setWeight(e.target.value)} className="input-field" />
                    <select className="select-field" value={cowBreed} onChange={(e) => setCowBreed(e.target.value)}>
                        <option value="Gir">Gir</option>
                        <option value="Sahiwal">Sahiwal</option>
                    </select>
                    <select className="select-field" value={feedType} onChange={(e) => setFeedType(e.target.value)}>
                        <option value="Grass-Fed">Grass-Fed</option>
                        <option value="Organic">Organic Feed</option>
                    </select>
                    <button onClick={handleMint} disabled={isLoading || !location} className="submit-button">{isLoading ? t.submitting : t.createRecord}</button>
                </div>
            )}
            {status && <p className={`status-message ${status.startsWith('Error') || status.startsWith('Please') ? 'status-error' : 'status-success'}`} dangerouslySetInnerHTML={{__html: status.replace(/Token ID: \w+/, '')}}></p>}
            {mintResult && (
                <div className="qr-section">
                    <h3>QR Code for this Batch:</h3>
                    <QRCode value={mintResult.tokenId} />
                    <p style={{marginTop: '1rem'}}>
                        Token ID: {mintResult.tokenId} <br/>
                        <a href={mintResult.url} target="_blank" rel="noopener noreferrer">View Transaction</a>
                    </p>
                    <button onClick={() => setMintResult(null)} style={{marginTop: '1rem'}}>Register Another Batch</button>
                </div>
            )}
        </div>
    );
};

// --- COLLECTOR COMPONENT ---
const CollectorView = ({ t }: { t: any }) => {
    const [pendingBatches, setPendingBatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
    const [moisture, setMoisture] = useState("");
    const [purity, setPurity] = useState("");
    const [collectorName, setCollectorName] = useState("");

    const fetchPending = useCallback(async () => {
        setIsLoading(true);
        setStatus("Fetching pending batches...");
        try {
            const response = await fetch('https://cow-dung.onrender.com/get-pending-batches');
            if (!response.ok) throw new Error("Server connection failed.");
            const data = await response.json();
            setPendingBatches(data);
            setStatus(data.length === 0 ? "No pending collections." : "");
        } catch (e: any) {
            setStatus(`❌ Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const calculateQualityScore = () => {
        const moistureNum = parseFloat(moisture);
        const purityNum = parseFloat(purity);
        if (isNaN(moistureNum) || isNaN(purityNum) || moistureNum < 0 || moistureNum > 100 || purityNum < 1 || purityNum > 10) {
            return "Invalid Input";
        }
        // Simple weighted average: Purity is more important.
        const score = (purityNum * 0.7) + ((10 - (moistureNum / 10)) * 0.3);
        return score.toFixed(1);
    };

    const handleUpdate = async () => {
        const qualityScore = calculateQualityScore();
        if (!selectedBatch || qualityScore === "Invalid Input" || !collectorName) {
            setStatus("Please provide valid inputs for all fields.");
            return;
        }
        setIsLoading(true);
        setStatus(t.updating);
        try {
            const response = await fetch('https://cow-dung.onrender.com/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenId: selectedBatch.id, qualityScore, collectorName })
            });
            const result = await response.json();
            if (response.ok) {
                setStatus(`✅ Batch updated successfully!`);
                setSelectedBatch(null); setMoisture(""); setPurity(""); setCollectorName("");
                fetchPending();
            } else { throw new Error(result.error); }
        } catch (error: any) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (selectedBatch) {
        return (
            <div className="form-container">
                <h2>{t.verifyBatch}: {selectedBatch.name}</h2>
                <input type="number" placeholder={t.moisture} value={moisture} onChange={(e) => setMoisture(e.target.value)} className="input-field" />
                <input type="number" placeholder={t.purity} value={purity} onChange={(e) => setPurity(e.target.value)} className="input-field" />
                <input type="text" placeholder={t.collectorName} value={collectorName} onChange={(e) => setCollectorName(e.target.value)} className="input-field" />
                <div className="quality-score-display">
                    {t.qualityScore}: {calculateQualityScore()} / 10
                </div>
                <button onClick={handleUpdate} disabled={isLoading} className="submit-button">{isLoading ? t.updating : t.updateRecord}</button>
                <button onClick={() => setSelectedBatch(null)} style={{marginTop: '1rem', backgroundColor: '#6b7280'}} className="submit-button">Back to List</button>
                {status && <p className={`status-message ${status.startsWith('Error') || status.startsWith('Please') ? 'status-error' : 'status-success'}`}>{status}</p>}
            </div>
        );
    }

    return (
        <div className="form-container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>{t.pendingCollections}</h2>
                <button onClick={fetchPending} disabled={isLoading} className="submit-button refresh-button" style={{width: 'auto'}}>{t.refresh}</button>
            </div>
            {isLoading && !pendingBatches.length ? <p>Loading...</p> : (
                <ul className="pending-list">
                    {pendingBatches.length > 0 ? pendingBatches.map((batch: any) => (
                        <li key={batch.id} className="pending-item" onClick={() => setSelectedBatch(batch)}>
                            <div>
                                <strong>{batch.name}</strong><br/>
                                <span>Token ID: {batch.id.slice(0, 10)}...</span>
                            </div>
                            <span style={{fontWeight: 600, color: '#f59e0b'}}>PENDING</span>
                        </li>
                    )) : <p>No pending collections found.</p>}
                </ul>
            )}
            {status && <p className={`status-message ${status.startsWith('Error') || status.startsWith('Could') ? 'status-error' : 'status-success'}`}>{status}</p>}
        </div>
    );
};
