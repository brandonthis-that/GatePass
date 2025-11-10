import { useState } from 'react';
import { Link } from 'react-router-dom';
import { guardAPI } from '../../services/api';

function LogVehicle() {
  const [plateNumber, setPlateNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLog = async (direction) => {
    if (!plateNumber) {
      alert('Please enter a plate number');
      return;
    }

    setLoading(true);
    try {
      const response = await guardAPI.logVehicle({
        plate_number: plateNumber,
        direction,
      });
      setResult({ success: true, data: response.data, direction });
    } catch (error) {
      alert('Failed to log vehicle');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPlateNumber('');
    setResult(null);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Log Vehicle</h1>
        <div className="nav">
          <Link to="/guard">Back</Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {!result ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '80px', marginBottom: '16px' }}>🚗</div>
              <h2 style={{ marginBottom: '8px' }}>Vehicle Entry/Exit</h2>
              <p style={{ color: 'var(--muted)' }}>
                Enter vehicle plate number and select direction
              </p>
            </div>

            <input
              className="input"
              type="text"
              placeholder="License Plate Number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              autoFocus
              style={{ fontSize: '24px', textAlign: 'center', marginBottom: '24px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button
                className="button button-success"
                onClick={() => handleLog('in')}
                disabled={loading}
                style={{ padding: '24px', fontSize: '18px' }}
              >
                ➡️ ENTRY
              </button>
              <button
                className="button button-danger"
                onClick={() => handleLog('out')}
                disabled={loading}
                style={{ padding: '24px', fontSize: '18px' }}
              >
                ⬅️ EXIT
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '80px', marginBottom: '16px' }}>
              {result.direction === 'in' ? '➡️' : '⬅️'}
            </div>
            <h2 style={{ marginBottom: '24px' }}>
              Vehicle Logged: {result.direction.toUpperCase()}
            </h2>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '8px', textAlign: 'left', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Vehicle Details</h3>
              <p style={{ marginBottom: '8px' }}>
                <strong>Plate:</strong> {result.data.vehicle.plate_number}
              </p>
              
              {result.data.owner ? (
                <>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>Owner:</strong> {result.data.owner.full_name}
                  </p>
                  <p>
                    <strong>Student ID:</strong> {result.data.owner.student_id_number}
                  </p>
                </>
              ) : (
                <p style={{ color: 'var(--muted)' }}>
                  ⚠️ Unregistered vehicle
                </p>
              )}
            </div>

            <button
              className="button"
              onClick={reset}
              style={{ width: '100%' }}
            >
              Log Another Vehicle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LogVehicle;
