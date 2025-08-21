
import React, { useState, useEffect } from 'react';
import QrReader from 'react-qr-reader';
import QRCode from 'react-qr-code';

// --- MOCK FARMER DATABASE ---
const farmersDB: { [key: string]: { name: string; village: string } } = {
  FARMER_001: { name: 'Sarath', village: 'Tindivanam' },
  FARMER_002: { name: 'Priya', village: 'Chembarambakkam' },
};

const FarmerView = ({ t }: { t: any }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<{
    id: string;
    name: string;
    village: string;
  } | null>(null);
  const [weight, setWeight] = useState('');
  const [cowBreed, setCowBreed] = useState('Gir');
  const [feedType, setFeedType] = useState('Grass-Fed');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [mintResult, setMintResult] = useState<{
    url: string;
    tokenId: string;
  } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setStatus('Please enable location.')
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
        setStatus('Invalid Farmer QR Code.');
        setIsScanning(false);
      }
    }
  };

  const handleMint = async () => {
    if (!scannedData || !weight || !location) {
      setStatus('Please scan your ID and enter weight.');
      return;
    }
    setIsLoading(true);
    setStatus(t.submitting);
    setMintResult(null);
    try {
      const response = await fetch('https://cow-dung.onrender.com/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: scannedData.id,
          weight,
          cowBreed,
          feedType,
          latitude: location.lat,
          longitude: location.lon,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setStatus(`✅ ${t.success}`);
        setMintResult({ url: result.url, tokenId: result.tokenId });
        setScannedData(null);
        setWeight('');
      } else {
        throw new Error(result.error);
      }
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
        <button
          onClick={() => {
            setStatus('');
            setIsScanning(true);
          }}
          className="submit-button"
        >
          {t.scanFarmerQR}
        </button>
      )}
      {isScanning && (
        <div className="qr-section">
          <QrReader
            onScan={handleScan}
            onError={(err) => console.error(err)}

          />
          <button onClick={() => setIsScanning(false)} style={{ marginTop: '1rem' }}>
            Cancel
          </button>
        </div>
      )}
      {scannedData && (
        <div>
          <p>
            <strong>Farmer:</strong> {scannedData.name}, {scannedData.village}
          </p>
          <input
            type="number"
            placeholder={t.weight}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input-field"
          />
          <select
            className="select-field"
            value={cowBreed}
            onChange={(e) => setCowBreed(e.target.value)}
          >
            <option value="Gir">Gir</option>
            <option value="Sahiwal">Sahiwal</option>
          </select>
          <select
            className="select-field"
            value={feedType}
            onChange={(e) => setFeedType(e.target.value)}
          >
            <option value="Grass-Fed">Grass-Fed</option>
            <option value="Organic">Organic Feed</option>
          </select>
          <button
            onClick={handleMint}
            disabled={isLoading || !location}
            className="submit-button"
          >
            {isLoading ? t.submitting : t.createRecord}
          </button>
        </div>
      )}
      {
        status && (
          <p
            className={`status-message ${
              status.startsWith('Error') || status.startsWith('Please')
                ? 'status-error'
                : 'status-success'
            }`}
            dangerouslySetInnerHTML={{
              __html: status.replace(/Token ID: \w+/, ''),
            }}
          ></p>
        )
      }
      {mintResult && (
        <div className="qr-section">
          <h3>QR Code for this Batch:</h3>
          <QRCode value={mintResult.tokenId} />
          <p style={{ marginTop: '1rem' }}>
            Token ID: {mintResult.tokenId} <br />
            <a href={mintResult.url} target="_blank" rel="noopener noreferrer">
              View Transaction
            </a>
          </p>
          <button
            onClick={() => setMintResult(null)}
            style={{ marginTop: '1rem' }}
          >
            Register Another Batch
          </button>
        </div>
      )}
    </div>
  );
};

export default FarmerView;
