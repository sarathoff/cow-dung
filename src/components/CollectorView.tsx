
import React, { useState, useEffect, useCallback } from 'react';
import QrReader from 'react-qr-reader';

const CollectorView = ({ t }: { t: any }) => {
  const [pendingBatches, setPendingBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedTokenId, setScannedTokenId] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState('');
  const [collectorName, setCollectorName] = useState('');

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setStatus('Fetching pending batches...');
    try {
      const response = await fetch(
        'https://cow-dung.onrender.com/get-pending-batches'
      );
      if (!response.ok)
        throw new Error('Server connection failed. Please wait a moment and refresh.');
      const data = await response.json();
      setPendingBatches(data);
      setStatus(data.length === 0 ? 'No pending collections.' : '');
    } catch (e: any) {
      setStatus(`❌ Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleScan = (result: any) => {
    if (result) {
      const tokenId = result.text;
      if (pendingBatches.some((batch) => batch.id === tokenId)) {
        setScannedTokenId(tokenId);
        setIsScanning(false);
        setStatus(`Batch ${tokenId.slice(0, 6)}... ready for verification.`);
      } else {
        setStatus(
          'Scanned batch is not in the pending list or is invalid. Please refresh the list.'
        );
        setIsScanning(false);
      }
    }
  };

  const handleUpdate = async () => {
    if (!scannedTokenId || !qualityScore || !collectorName) {
      setStatus('Please fill all fields.');
      return;
    }
    setIsLoading(true);
    setStatus(t.updating);
    try {
      const response = await fetch('https://cow-dung.onrender.com/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: scannedTokenId, qualityScore, collectorName }),
      });
      const result = await response.json();
      if (response.ok) {
        setStatus(`✅ ${t.updateSuccess}`);
        setScannedTokenId(null);
        setQualityScore('');
        setCollectorName('');
        fetchPending();
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>{t.pendingCollections}</h2>
        <button
          onClick={fetchPending}
          disabled={isLoading}
          className="submit-button refresh-button"
          style={{ width: 'auto' }}
        >
          {t.refresh}
        </button>
      </div>
      {isLoading && !pendingBatches.length ? (
        <p>Loading...</p>
      ) : (
        <ul className="pending-list">
          {pendingBatches.length > 0 ? (
            pendingBatches.map((batch: any) => (
              <li key={batch.id} className="pending-item">
                <div>
                  <strong>{batch.name}</strong>
                  <br />
                  <span>Token ID: {batch.id.slice(0, 10)}...</span>
                </div>
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>PENDING</span>
              </li>
            ))
          ) : (
            <p>No pending collections found.</p>
          )}
        </ul>
      )}
      <hr style={{ margin: '2rem 0' }} />
      {!scannedTokenId ? (
        <button
          onClick={() => {
            setStatus('');
            setIsScanning(true);
          }}
          className="submit-button"
        >
          {t.scanToVerify}
        </button>
      ) : (
        <div>
          <h3>Verifying Batch: {scannedTokenId.slice(0, 10)}...</h3>
          <input
            type="number"
            placeholder={t.qualityScore}
            value={qualityScore}
            onChange={(e) => setQualityScore(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder={t.collectorName}
            value={collectorName}
            onChange={(e) => setCollectorName(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? t.updating : t.updateRecord}
          </button>
        </div>
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
      {
        status && (
          <p
            className={`status-message ${
              status.startsWith('Error') ||
              status.startsWith('Could') ||
              status.startsWith('Scanned')
                ? 'status-error'
                : 'status-success'
            }`}
          >
            {status}
          </p>
        )
      }
    </div>
  );
};

export default CollectorView;
