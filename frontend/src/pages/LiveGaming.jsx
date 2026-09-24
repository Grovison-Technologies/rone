import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerSelect from '../components/CustomerSelect';

const LiveGaming = () => {
  const [stations, setStations] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  
  // Start Session Form State
  const [newSessionData, setNewSessionData] = useState({ customerId: '', playerCount: 1, gameName: '', splitMethod: 'SINGLE', splitPayers: [] });
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0); // Force re-render every second
  
  const fetchData = async () => {
    try {
      const [stRes, sessRes, custRes] = await Promise.all([
        axios.get('/api/stations'),
        axios.get('/api/sessions/active'),
        axios.get('/api/customers')
      ]);
      setStations(stRes.data);
      setActiveSessions(sessRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch live gaming data.');
    }
  };

  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, 30000);
    
    // Live timer
    const timerInterval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    
    return () => {
      clearInterval(dataInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const handleStartSession = async () => {
    setError('');
    try {
      await axios.post('/api/sessions/start', {
        stationId: selectedStation._id,
        customerId: newSessionData.customerId,
        playerCount: newSessionData.playerCount,
        gameName: newSessionData.gameName,
        splitMethod: newSessionData.splitMethod,
        splitPayers: newSessionData.splitPayers
      });
      setShowStartModal(false);
      setNewSessionData({ customerId: '', playerCount: 1, gameName: '', splitMethod: 'SINGLE', splitPayers: [] });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start session');
    }
  };

  const handleAction = async (sessionId, action) => {
    try {
      if (action === 'pause') {
        await axios.put(`/api/sessions/${sessionId}/pause`);
      } else if (action === 'resume') {
        await axios.put(`/api/sessions/${sessionId}/resume`);
      } else if (action === 'end') {
        if(window.confirm('Are you sure you want to end this session?')) {
          await axios.put(`/api/sessions/${sessionId}/end`);
        } else return;
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const calculateElapsed = (start, previousSeconds = 0) => {
    let diff = previousSeconds;
    if (start) {
      diff += Math.floor((new Date() - new Date(start)) / 1000);
    }
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  // Combine stations with their active sessions
  const combinedStations = stations.map(station => {
    const activeSession = activeSessions.find(s => s.station._id === station._id);
    return { ...station, session: activeSession };
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>LIVE GAMING</h2>
        <div>
          <button className="btn" style={{ marginRight: '1rem' }} onClick={fetchData}>REFRESH</button>
        </div>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: 'var(--status-warning)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid var(--status-warning)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {combinedStations.map(station => (
          <div key={station._id} className="card" style={{ 
            borderColor: station.status === 'ACTIVE' ? 'var(--accent-blue)' : station.status === 'PAUSED' ? 'var(--status-warning)' : 'rgba(255,255,255,0.1)',
            boxShadow: station.status === 'ACTIVE' ? 'var(--shadow-glow)' : 'none'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{station.displayName}</h3>
              <span className={`status-badge ${
                station.status === 'AVAILABLE' ? 'status-available' : 
                station.status === 'ACTIVE' ? 'status-active' : 
                station.status === 'PAUSED' ? 'status-paused' : 'status-offline'
              }`}>
                {station.status}
              </span>
            </div>

            {station.status === 'AVAILABLE' || !station.session ? (
              <div style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Ready for a new session</p>
                <button className="btn" onClick={() => { setSelectedStation(station); setShowStartModal(true); setError(''); }}>START HERE</button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Customer(s):</span> 
                    <span style={{ fontWeight: 600, textAlign: 'right' }}>
                      {station.session.splitMethod === 'EQUAL' && station.session.splitPayers?.length > 0
                        ? `${station.session.payerCustomer?.name} + ${station.session.splitPayers.length} split`
                        : station.session.payerCustomer?.name || 'Unknown'
                      }
                    </span>
                  </p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Players:</span> 
                    <span>{station.session.currentSegment?.playerCount}</span>
                  </p>
                  <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Rate:</span> 
                    <span>{station.session.currentSegment?.hourlyXPRate} XP/hr</span>
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Duration:</span> 
                    <span style={{ color: station.status === 'ACTIVE' ? 'white' : 'var(--status-warning)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {station.status === 'ACTIVE' 
                        ? calculateElapsed(station.session.currentSegment?.startedAt, station.session.totalBillableSeconds) 
                        : calculateElapsed(null, station.session.totalBillableSeconds)}
                    </span>
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {station.status === 'ACTIVE' ? (
                    <button className="btn" onClick={() => handleAction(station.session._id, 'pause')}>PAUSE</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleAction(station.session._id, 'resume')}>RESUME</button>
                  )}
                  <button className="btn">PLAYERS</button>
                  <button className="btn btn-danger" style={{ gridColumn: 'span 2' }} onClick={() => handleAction(station.session._id, 'end')}>END SESSION</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showStartModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--bg-darkest)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>START NEW SESSION</h3>
            {error && <div style={{ color: 'var(--status-warning)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            
            <div className="input-group">
              <label>Selected Station</label>
              <input type="text" disabled value={selectedStation?.displayName || ''} />
            </div>
            <div className="input-group">
              <label>Select Customer</label>
              <CustomerSelect 
                customers={customers} 
                selectedId={newSessionData.customerId} 
                onChange={(id) => setNewSessionData({...newSessionData, customerId: id})} 
              />
            </div>
            <div className="input-group">
              <label>Number of Players</label>
              <input type="number" min="1" max={selectedStation?.controllerCount || 4} value={newSessionData.playerCount} onChange={e => setNewSessionData({...newSessionData, playerCount: Number(e.target.value)})} />
            </div>

            {newSessionData.playerCount > 1 && (
              <div className="input-group">
                <label>Billing Method</label>
                <select 
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-dark)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  value={newSessionData.splitMethod} 
                  onChange={e => {
                    setNewSessionData({...newSessionData, splitMethod: e.target.value});
                  }}
                >
                  <option value="SINGLE">Single Payer (Primary Customer)</option>
                  <option value="EQUAL">Split Equally</option>
                </select>
              </div>
            )}

            {newSessionData.splitMethod === 'EQUAL' && newSessionData.playerCount > 1 && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Select additional players to split the cost with.</p>
                {Array.from({ length: newSessionData.playerCount - 1 }).map((_, idx) => (
                  <div className="input-group" key={idx}>
                    <label>Player {idx + 2}</label>
                    <CustomerSelect 
                      customers={customers} 
                      selectedId={newSessionData.splitPayers[idx] || ''} 
                      onChange={(id) => {
                        const newPayers = [...newSessionData.splitPayers];
                        newPayers[idx] = id;
                        setNewSessionData({...newSessionData, splitPayers: newPayers});
                      }} 
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="input-group">
              <label>Game to Play (Optional)</label>
              <input type="text" placeholder="e.g. FIFA 24" value={newSessionData.gameName || ''} onChange={e => setNewSessionData({...newSessionData, gameName: e.target.value})} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" className="btn" onClick={() => setShowStartModal(false)}>CANCEL</button>
              <button type="button" className="btn btn-primary" onClick={handleStartSession} disabled={!newSessionData.customerId}>START</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveGaming;
