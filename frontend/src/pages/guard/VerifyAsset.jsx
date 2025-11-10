import { useState } from 'react';
import { Link } from 'react-router-dom';
import { guardAPI } from '../../services/api';

function VerifyAsset() {
  const [assetId, setAssetId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!assetId) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await guardAPI.verifyAsset(assetId);
      setResult({ success: true, data: response.data });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Asset not found',
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAssetId('');
    setResult(null);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Verify Asset</h1>
        <div className="nav">
          <Link to="/guard">Back</Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {!result ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '80px', marginBottom: '16px' }}>📷</div>
              <h2 style={{ marginBottom: '8px' }}>Scan Asset QR Code</h2>
              <p style={{ color: 'var(--muted)' }}>
                Enter the asset ID from the QR code to verify
              </p>
            </div>

            <form onSubmit={handleVerify}>
              <input
                className="input"
                type="text"
                placeholder="Enter Asset ID"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                autoFocus
              />
              
              <button
                className="button"
                type="submit"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Asset'}
              </button>
            </form>

            <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--muted)', textAlign: 'center' }}>
              💡 In production, this would use camera QR scanning
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {result.success ? (
              <>
                <div style={{ fontSize: '80px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ color: 'var(--success)', marginBottom: '24px' }}>MATCH - Asset Verified</h2>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '8px', textAlign: 'left', marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '16px' }}>Asset Details</h3>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>Type:</strong> {result.data.asset.asset_type}
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>Serial:</strong> {result.data.asset.serial_number}
                  </p>
                  <p style={{ marginBottom: '16px' }}>
                    <strong>Model:</strong> {result.data.asset.model_name || 'N/A'}
                  </p>
                  
                  <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Owner Information</h3>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>Name:</strong> {result.data.owner.full_name}
                  </p>
                  <p>
                    <strong>Student ID:</strong> {result.data.owner.student_id_number}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '80px', marginBottom: '16px' }}>❌</div>
                <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Asset Not Found</h2>
                <p style={{ color: 'var(--muted)' }}>{result.message}</p>
              </>
            )}
            
            <button
              className="button"
              onClick={reset}
              style={{ width: '100%', marginTop: '24px' }}
            >
              Scan Another Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyAsset;
