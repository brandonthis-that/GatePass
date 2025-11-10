import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    student_id_number: '',
    full_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.username, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        // Determine redirect based on username (guard vs student)
        if (formData.username.includes('guard')) {
          navigate('/guard');
        } else {
          navigate('/student');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container" style={{ maxWidth: '480px', marginTop: '80px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
          🎓 GatePass System
        </h1>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button
            className={`button ${isLogin ? '' : 'button-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`button ${!isLogin ? '' : 'button-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <>
              <input
                className="input"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              
              <input
                className="input"
                type="text"
                name="student_id_number"
                placeholder="Student ID (e.g., S12345)"
                value={formData.student_id_number}
                onChange={handleChange}
                required
              />
              
              <input
                className="input"
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </>
          )}

          <button
            className="button"
            type="submit"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', fontSize: '13px' }}>
          <strong>Demo Credentials:</strong><br />
          Guard: guard1 / guard123<br />
          Student: john_doe / student123
        </div>
      </div>
    </div>
  );
}

export default Login;
