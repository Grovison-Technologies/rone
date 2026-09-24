import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [newStation, setNewStation] = useState({ stationId: '', displayName: '', consoleType: 'PS5', controllerCount: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/stations');
      setStations(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch stations', err);
      setError('Failed to fetch stations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/stations', newStation);
      await fetchStations();
      setShowAddModal(false);
      setNewStation({ stationId: '', displayName: '', consoleType: 'PS5', controllerCount: 1 });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add station');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`/api/stations/${editingStation._id}`, editingStation);
      await fetchStations();
      setEditingStation(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update station');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>STATIONS</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ ADD STATION</button>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: 'var(--status-warning)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid var(--status-warning)' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading stations...</div>
        ) : stations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No stations found.</div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>STATION ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>NAME</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>CONSOLE</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>CONTROLLERS</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>STATUS</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{s.stationId}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{s.displayName}</td>
                    <td style={{ padding: '1rem' }}>{s.consoleType}</td>
                    <td style={{ padding: '1rem' }}>{s.controllerCount}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${
                        s.status === 'AVAILABLE' ? 'status-available' : 
                        s.status === 'ACTIVE' ? 'status-active' : 'status-offline'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setEditingStation(s)}>EDIT</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--bg-darkest)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>ADD STATION</h3>
            {error && <div style={{ color: 'var(--status-warning)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <form onSubmit={handleAddSubmit}>
              <div className="input-group">
                <label>Station ID (Internal)</label>
                <input required type="text" value={newStation.stationId} onChange={e => setNewStation({...newStation, stationId: e.target.value})} placeholder="e.g. PS5-03" />
              </div>
              <div className="input-group">
                <label>Display Name</label>
                <input required type="text" value={newStation.displayName} onChange={e => setNewStation({...newStation, displayName: e.target.value})} placeholder="e.g. PS5 #03" />
              </div>
              <div className="input-group">
                <label>Console Type</label>
                <select 
                  value={newStation.consoleType} 
                  onChange={e => setNewStation({...newStation, consoleType: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--bg-darker)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                >
                  <option value="PS5">PS5</option>
                  <option value="PS4">PS4</option>
                </select>
              </div>
              <div className="input-group">
                <label>Controller Count</label>
                <input required type="number" min="1" max="4" value={newStation.controllerCount} onChange={e => setNewStation({...newStation, controllerCount: Number(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => { setShowAddModal(false); setError(''); }}>CANCEL</button>
                <button type="submit" className="btn btn-primary">SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--bg-darkest)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>EDIT STATION</h3>
            {error && <div style={{ color: 'var(--status-warning)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="input-group">
                <label>Display Name</label>
                <input required type="text" value={editingStation.displayName} onChange={e => setEditingStation({...editingStation, displayName: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Console Type</label>
                <select 
                  value={editingStation.consoleType} 
                  onChange={e => setEditingStation({...editingStation, consoleType: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--bg-darker)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                >
                  <option value="PS5">PS5</option>
                  <option value="PS4">PS4</option>
                </select>
              </div>
              <div className="input-group">
                <label>Controller Count</label>
                <input required type="number" min="1" max="4" value={editingStation.controllerCount} onChange={e => setEditingStation({...editingStation, controllerCount: Number(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => { setEditingStation(null); setError(''); }}>CANCEL</button>
                <button type="submit" className="btn btn-primary">SAVE CHANGES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stations;
