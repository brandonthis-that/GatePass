import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="header">
        <h1>Student Portal</h1>
        <div className="nav">
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>Welcome, {user?.username}!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
          Manage your assets and vehicles from this dashboard.
        </p>
      </div>

      <div className="grid">
        <Link to="/student/assets" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💻</div>
            <h3 style={{ marginBottom: '8px' }}>My Assets</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Register and view your laptops, tablets, and other assets
            </p>
          </div>
        </Link>

        <Link to="/student/vehicles" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚗</div>
            <h3 style={{ marginBottom: '8px' }}>My Vehicles</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Register and manage your vehicle information
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
