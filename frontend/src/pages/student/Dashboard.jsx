import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="header">
        <h1>Student Portal</h1>
        <nav className="nav">
          <Link to="/student/assets" className="nav-link">My Assets</Link>
          <Link to="/student/vehicles" className="nav-link">My Vehicles</Link>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </nav>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--info-light) 100%)', border: '1px solid var(--accent)' }}>
        <h2>Welcome, {user?.full_name || user?.username}! 👋</h2>
        <p>
          Manage your assets and vehicles from this dashboard. All your registered items are secure and tracked.
        </p>
      </div>

      <div className="grid">
        <Link to="/student/assets" className="card-link">
          <div className="card dashboard-card">
            <div className="card-icon">💻</div>
            <h3>My Assets</h3>
            <p>
              Register and view your laptops, tablets, and other valuable assets with QR codes
            </p>
          </div>
        </Link>

        <Link to="/student/vehicles" className="card-link">
          <div className="card dashboard-card">
            <div className="card-icon">🚗</div>
            <h3>My Vehicles</h3>
            <p>
              Register and manage your vehicle information for gate access
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
