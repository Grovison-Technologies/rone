import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('rates');
  const [xpPacks, setXPPacks] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newData, setNewData] = useState({ name: '', price: 0, baseXP: 0, bonusXP: 0 });

  const [showEditRateModal, setShowEditRateModal] = useState(false);
  const [editRateData, setEditRateData] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [xpRes, ratesRes] = await Promise.all([
        axios.get('/api/xppacks'),
        axios.get('/api/rates')
      ]);
      setXPPacks(xpRes.data);
      setRates(ratesRes.data);
    } catch (err) {
      setError('Failed to load settings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEditPack = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/xppacks/${editData._id}`, editData);
      setShowEditModal(false);
      fetchSettings();
    } catch (err) {
      alert('Failed to update package');
    }
  };

  const handleAddPack = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/xppacks', newData);
      setShowAddModal(false);
      setNewData({ name: '', price: 0, baseXP: 0, bonusXP: 0 });
      fetchSettings();
    } catch (err) {
      alert('Failed to add package');
    }
  };

  const handleEditRate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/rates/${editRateData._id}`, editRateData);
      setShowEditRateModal(false);
      fetchSettings();
    } catch (err) {
      alert('Failed to update rate');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2>SYSTEM SETTINGS</h2>
      </header>

      {error && <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: 'var(--status-warning)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid var(--status-warning)' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'rates' ? 'var(--primary-blue)' : 'transparent',
            borderColor: activeTab === 'rates' ? 'var(--primary-blue)' : 'rgba(255,255,255,0.2)'
          }}
          onClick={() => setActiveTab('rates')}
        >
          GAME RATES
        </button>
        <button 
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'packs' ? 'var(--primary-blue)' : 'transparent',
            borderColor: activeTab === 'packs' ? 'var(--primary-blue)' : 'rgba(255,255,255,0.2)'
          }}
          onClick={() => setActiveTab('packs')}
        >
          XP PACKAGES
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem' }}>Loading settings...</div>
      ) : activeTab === 'rates' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>CONSOLE</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>PLAYERS</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>HOURLY RATE</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>OFF-PEAK RATE</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{r.consoleType}</td>
                  <td style={{ padding: '1rem' }}>{r.playerCount}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-blue)', fontWeight: 600 }}>{r.hourlyXPRate} XP / hr</td>
                  <td style={{ padding: '1rem', color: 'var(--status-success)', fontWeight: 600 }}>{r.offPeakXPRate} XP / hr</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => { setEditRateData(r); setShowEditRateModal(true); }}>EDIT</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {xpPacks.map(pack => (
            <div key={pack._id} className="card" style={{ textAlign: 'center', borderColor: pack.isPopular ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
              {pack.isPopular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--accent-blue)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                  MOST POPULAR
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', marginTop: pack.isPopular ? '0.5rem' : '0' }}>{pack.name}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>₹{pack.price}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Base XP</span>
                <span style={{ fontWeight: 600 }}>{pack.baseXP}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bonus XP</span>
                <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>+{pack.bonusXP}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total XP</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{pack.baseXP + pack.bonusXP}</span>
              </div>

              <button className="btn" style={{ width: '100%' }} onClick={() => { setEditData(pack); setShowEditModal(true); }}>EDIT PACKAGE</button>
            </div>
          ))}
          
          <div className="card" onClick={() => setShowAddModal(true)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', cursor: 'pointer' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>+ ADD PACKAGE</h3>
          </div>
        </div>
      )}

      {showEditModal && editData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--bg-darkest)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>EDIT XP PACKAGE</h3>
            <form onSubmit={handleEditPack}>
              <div className="input-group">
                <label>Name</label>
                <input required type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Price (₹)</label>
                <input required type="number" value={editData.price} onChange={e => setEditData({...editData, price: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Base XP</label>
                <input required type="number" value={editData.baseXP} onChange={e => setEditData({...editData, baseXP: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Bonus XP</label>
                <input required type="number" value={editData.bonusXP} onChange={e => setEditData({...editData, bonusXP: Number(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>CANCEL</button>
                <button type="submit" className="btn btn-primary">SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--bg-darkest)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>ADD XP PACKAGE</h3>
            <form onSubmit={handleAddPack}>
              <div className="input-group">
                <label>Name</label>
                <input required type="text" value={newData.name} onChange={e => setNewData({...newData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Price (₹)</label>
                <input required type="number" value={newData.price} onChange={e => setNewData({...newData, price: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Base XP</label>
                <input required type="number" value={newData.baseXP} onChange={e => setNewData({...newData, baseXP: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Bonus XP</label>
                <input required type="number" value={newData.bonusXP} onChange={e => setNewData({...newData, bonusXP: Number(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>CANCEL</button>
                <button type="submit" className="btn btn-primary">ADD</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditRateModal && editRateData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--bg-darkest)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>EDIT HOURLY RATE</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              <strong>{editRateData.consoleType}</strong> - {editRateData.playerCount} Player(s)
            </p>
            <form onSubmit={handleEditRate}>
              <div className="input-group">
                <label>Hourly XP Rate</label>
                <input required type="number" step="0.01" value={editRateData.hourlyXPRate} onChange={e => setEditRateData({...editRateData, hourlyXPRate: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Off-Peak XP Rate</label>
                <input required type="number" step="0.01" value={editRateData.offPeakXPRate || ''} onChange={e => setEditRateData({...editRateData, offPeakXPRate: Number(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowEditRateModal(false)}>CANCEL</button>
                <button type="submit" className="btn btn-primary">SAVE CHANGES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
