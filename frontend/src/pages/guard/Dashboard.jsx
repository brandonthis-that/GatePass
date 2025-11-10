import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function GuardDashboard() {
  const { logout } = useAuth();

  return (
    <div className="container">
      <div className="header">
        <h1>🛡️ Guard Portal</h1>
        <div className="nav">
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)' }}>
        <h2 style={{ marginBottom: '8px' }}>Gate Management System</h2>
        <p style={{ color: 'var(--muted)' }}>
          Select a function below to manage gate activities
        </p>
      </div>

      <div className="grid">
        <Link to="/guard/verify" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
            <h2 style={{ marginBottom: '8px' }}>Verify Asset</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Scan QR code to verify student assets
            </p>
          </div>
        </Link>

        <Link to="/guard/vehicle" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚗</div>
            <h2 style={{ marginBottom: '8px' }}>Log Vehicle</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Log vehicle entry and exit
            </p>
          </div>
        </Link>

        <Link to="/guard/scholars" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
            <h2 style={{ marginBottom: '8px' }}>Day Scholars</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Sign day scholars in and out
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default GuardDashboard;
