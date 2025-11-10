import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';

function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    color: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await studentAPI.getVehicles();
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.createVehicle(formData);
      setMessage('Vehicle registered successfully!');
      setShowForm(false);
      setFormData({ plate_number: '', make: '', model: '', color: '' });
      loadVehicles();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to register vehicle');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>My Vehicles</h1>
        <div className="nav">
          <Link to="/student">Dashboard</Link>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Registered Vehicles ({vehicles.length})</h2>
          <button className="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Vehicle'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <input
              className="input"
              type="text"
              placeholder="License Plate Number"
              value={formData.plate_number}
              onChange={(e) => setFormData({ ...formData, plate_number: e.target.value.toUpperCase() })}
              required
            />

            <input
              className="input"
              type="text"
              placeholder="Make (e.g., Toyota)"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            />

            <input
              className="input"
              type="text"
              placeholder="Model (e.g., Corolla)"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />

            <input
              className="input"
              type="text"
              placeholder="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />

            <button className="button" type="submit">Register Vehicle</button>
          </form>
        )}

        <div className="grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="card">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚗</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>{vehicle.plate_number}</h3>
              {vehicle.make && vehicle.model && (
                <p style={{ color: 'var(--muted)', marginBottom: '8px' }}>
                  {vehicle.make} {vehicle.model}
                </p>
              )}
              {vehicle.color && (
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  Color: {vehicle.color}
                </p>
              )}
            </div>
          ))}
        </div>

        {vehicles.length === 0 && !showForm && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
            No vehicles registered yet. Click "Add Vehicle" to register your first vehicle.
          </p>
        )}
      </div>
    </div>
  );
}

export default MyVehicles;
