import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function GuardDashboard() {
  const { logout } = useAuth();

  return (
    <div className="container">
      <div className="header">
        <h1>🛡️ Guard Portal</h1>
        <nav className="nav">
          <Link to="/guard/verify" className="nav-link">Verify Asset</Link>
          <Link to="/guard/vehicle" className="nav-link">Log Vehicle</Link>
          <Link to="/guard/scholars" className="nav-link">Day Scholars</Link>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </nav>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, var(--success-light) 0%, var(--accent-light) 100%)', border: '1px solid var(--success)' }}>
        <h2>🛡️ Gate Management System</h2>
        <p>
          Welcome to the security portal. Select a function below to manage gate activities and maintain campus security.
        </p>
      </div>

      <div className="grid">
        <Link to="/guard/verify" className="card-link">
          <div className="card dashboard-card">
            <div className="card-icon">📷</div>
            <h3>Verify Asset</h3>
            <p>
              Scan QR codes to verify student assets and ensure authorized access
            </p>
          </div>
        </Link>

        <Link to="/guard/vehicle" className="card-link">
          <div className="card dashboard-card">
            <div className="card-icon">🚗</div>
            <h3>Log Vehicle</h3>
            <p>
              Record vehicle entry and exit times for security tracking
            </p>
          </div>
        </Link>

        <Link to="/guard/scholars" className="card-link">
          <div className="card dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Day Scholars</h3>
            <p>
              Manage day scholar check-ins and check-outs
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default GuardDashboard;
