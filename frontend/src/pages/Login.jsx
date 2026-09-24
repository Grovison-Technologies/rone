import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = ({ type = 'staff' }) => {
  const [email, setEmail] = useState('admin@rone.com');
  const [password, setPassword] = useState('password123');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { loginStaff, loginCustomer } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (type === 'staff') {
      const res = await loginStaff(email, password);
      if (res.success) {
        navigate('/owner-dash');
      } else {
        setError(res.message);
      }
    } else {
      const res = await loginCustomer(mobile, pin);
      if (res.success) {
        navigate('/customer-dash');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-darkest)' }}>
      <div className="card" style={{ width: '90%', maxWidth: '400px', textAlign: 'center', padding: '3rem 2rem', borderColor: type === 'staff' ? 'rgba(255,255,255,0.1)' : 'var(--accent-blue)', boxShadow: type === 'customer' ? 'var(--shadow-glow)' : 'none' }}>
        <img src="/logo.png" alt="R.ONE Logo" style={{ height: '40px', marginBottom: '2rem' }} />
        <h2 style={{ marginBottom: '2rem' }}>{type === 'staff' ? 'STAFF LOGIN' : 'CUSTOMER LOGIN'}</h2>
        
        {error && <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: 'var(--status-warning)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid var(--status-warning)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {type === 'staff' ? (
            <>
              <div className="input-group">
                <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <input type="text" required placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} />
              </div>
              <div className="input-group">
                <input type="password" required placeholder="4-Digit PIN" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
            LOGIN
          </button>
        </form>

        <div style={{ marginTop: '2rem' }}>
          {type === 'staff' && (
            <button className="btn" onClick={() => navigate('/customer-login')} style={{ fontSize: '0.75rem' }}>Switch to Customer Login</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
