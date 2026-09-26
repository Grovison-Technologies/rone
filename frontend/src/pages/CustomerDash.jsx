import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const CustomerDash = () => {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stations, setStations] = useState([]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [profileRes, txRes, activeRes, stationRes] = await Promise.all([
        axios.get('/api/customers/me'),
        axios.get('/api/customers/me/transactions'),
        axios.get('/api/sessions/my-active'),
        axios.get('/api/stations/customer')
      ]);
      setProfile(profileRes.data);
      setTransactions(txRes.data);
      setActiveSession(activeRes.data);
      setStations(stationRes.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        logout('customer');
      } else {
        setError('Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
    const interval = setInterval(fetchCustomerData, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateElapsed = (start) => {
    const diff = Math.floor((new Date() - new Date(start)) / 1000);
    const m = Math.floor(diff / 60);
    return `${m}m`;
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--status-warning)' }}>{error}</div>;

  return (
    <div style={{ backgroundColor: 'var(--bg-darkest)', minHeight: '100vh', padding: '1rem', paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Hello, {profile?.name}</h2>
          <p style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 600 }}>{profile?.rOneId}</p>
        </div>
        <img src="/logo.png" alt="R.ONE" style={{ height: '24px' }} />
      </header>

      <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem 1rem', borderColor: 'var(--accent-blue)', boxShadow: 'var(--shadow-glow)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '0.5rem' }}>AVAILABLE XP</p>
        <h1 style={{ fontSize: '3.5rem', color: 'var(--accent-blue)', marginBottom: '0' }}>{profile?.wallet?.totalAvailableXP.toFixed(2) || 0}</h1>
      </div>

      {activeSession && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: activeSession.status === 'ACTIVE' ? 'var(--status-success)' : 'var(--status-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Active Session</h3>
            <span className={`status-badge ${activeSession.status === 'ACTIVE' ? 'status-active' : 'status-paused'}`}>
              {activeSession.status}
            </span>
          </div>
          <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Station:</span> 
            <span style={{ fontWeight: 600 }}>{activeSession.station?.displayName}</span>
          </p>
          <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Time Played:</span> 
            <span style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>{calculateElapsed(activeSession.currentSegment?.startedAt)}</span>
          </p>
          <p style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Current Rate:</span> 
            <span style={{ fontWeight: 600 }}>{activeSession.currentSegment?.hourlyXPRate} XP/hr</span>
          </p>
        </div>
      )}

      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>STATION AVAILABILITY</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stations.map(station => (
          <div key={station._id} style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(255,255,255,0.02)', 
            border: `1px solid ${station.status === 'AVAILABLE' ? 'var(--status-success)' : station.status === 'ACTIVE' ? 'red' : 'var(--status-warning)'}`,
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{station.displayName}</h4>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: station.status === 'AVAILABLE' ? 'var(--status-success)' : station.status === 'ACTIVE' ? 'red' : 'var(--status-warning)' 
            }}>
              {station.status === 'ACTIVE' ? 'ENGAGED' : station.status}
            </span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>RECENT ACTIVITY</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No recent activity.</p>
        ) : transactions.map((t, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>{t.type.replace('_', ' ')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ fontWeight: 700, color: t.amount > 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
              {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} XP
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', backgroundColor: 'var(--bg-darker)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => logout('customer')} className="btn" style={{ width: '100%', borderColor: 'var(--status-warning)', color: 'var(--status-warning)' }}>LOG OUT</button>
      </div>
    </div>
  );
};

export default CustomerDash;
