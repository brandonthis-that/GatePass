import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { guardAPI } from '../../services/api';

function DayScholars() {
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadScholars();
  }, []);

  const loadScholars = async () => {
    try {
      const response = await guardAPI.getDayScholars();
      setScholars(response.data);
    } catch (error) {
      console.error('Failed to load day scholars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInOut = async (scholar, action) => {
    setActionLoading(scholar.id);
    try {
      await guardAPI.logScholar(scholar.id, action);
      loadScholars(); // Reload to get updated status
    } catch (error) {
      alert('Failed to update scholar status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Day Scholars</h1>
        <div className="nav">
          <Link to="/guard">Back</Link>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>Manage Day Scholar Sign-In/Out ({scholars.length})</h2>

        {scholars.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
            No day scholars registered in the system.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {scholars.map((scholar) => (
              <div
                key={scholar.id}
                className="card"
                style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h3 style={{ marginBottom: '8px' }}>{scholar.full_name}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '8px' }}>
                    Student ID: {scholar.student_id_number}
                  </p>
                  <span
                    className={`status-badge ${
                      scholar.status === 'ON_CAMPUS' ? 'on-campus' : 'off-campus'
                    }`}
                  >
                    {scholar.status === 'ON_CAMPUS' ? '🟢 On Campus' : '⚪ Off Campus'}
                  </span>
                </div>

                <div>
                  {scholar.status === 'ON_CAMPUS' ? (
                    <button
                      className="button button-danger"
                      onClick={() => handleSignInOut(scholar, 'out')}
                      disabled={actionLoading === scholar.id}
                      style={{ padding: '12px 24px' }}
                    >
                      {actionLoading === scholar.id ? 'Processing...' : 'Sign Out'}
                    </button>
                  ) : (
                    <button
                      className="button button-success"
                      onClick={() => handleSignInOut(scholar, 'in')}
                      disabled={actionLoading === scholar.id}
                      style={{ padding: '12px 24px' }}
                    >
                      {actionLoading === scholar.id ? 'Processing...' : 'Sign In'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DayScholars;
