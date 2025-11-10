import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';

function MyAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asset_type: 'LAPTOP',
    serial_number: '',
    model_name: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const response = await studentAPI.getAssets();
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.createAsset(formData);
      setMessage('Asset registered successfully!');
      setShowForm(false);
      setFormData({ asset_type: 'LAPTOP', serial_number: '', model_name: '' });
      loadAssets();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to register asset');
    }
  };

  const viewQR = async (assetId) => {
    try {
      const response = await studentAPI.getAssetQR(assetId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `asset_${assetId}_qr.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download QR code');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>My Assets</h1>
        <div className="nav">
          <Link to="/student">Dashboard</Link>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Registered Assets ({assets.length})</h2>
          <button className="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Asset'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <select
              className="input"
              value={formData.asset_type}
              onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
            >
              <option value="LAPTOP">Laptop</option>
              <option value="TABLET">Tablet</option>
              <option value="PHONE">Mobile Phone</option>
              <option value="OTHER">Other</option>
            </select>

            <input
              className="input"
              type="text"
              placeholder="Serial Number"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              required
            />

            <input
              className="input"
              type="text"
              placeholder="Model Name (Optional)"
              value={formData.model_name}
              onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
            />

            <button className="button" type="submit">Register Asset</button>
          </form>
        )}

        <div className="grid">
          {assets.map((asset) => (
            <div key={asset.id} className="card">
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                {asset.asset_type === 'LAPTOP' ? '💻' : asset.asset_type === 'TABLET' ? '📱' : '📦'}
              </div>
              <h3>{asset.asset_type}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}>
                <strong>Serial:</strong> {asset.serial_number}
              </p>
              {asset.model_name && (
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
                  <strong>Model:</strong> {asset.model_name}
                </p>
              )}
              <button
                className="button button-secondary"
                style={{ width: '100%' }}
                onClick={() => viewQR(asset.id)}
              >
                Download QR Code
              </button>
            </div>
          ))}
        </div>

        {assets.length === 0 && !showForm && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
            No assets registered yet. Click "Add Asset" to register your first asset.
          </p>
        )}
      </div>
    </div>
  );
}

export default MyAssets;
