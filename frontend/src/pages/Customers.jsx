import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '', pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustData, setAdjustData] = useState({ amount: '', reason: '' });

  const [customerTransactions, setCustomerTransactions] = useState([]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/customers');
      setCustomers(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch customers', err);
      setError('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/customers', newCustomer);
      await fetchCustomers();
      setShowAddModal(false);
      setNewCustomer({ name: '', mobile: '', pin: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const handleAdjustXP = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/customers/${selectedCustomer._id}/adjust-xp`, {
        amount: Number(adjustData.amount),
        reason: adjustData.reason
      });
      await fetchCustomers();
      setShowAdjustModal(false);
      setSelectedCustomer(null);
      setAdjustData({ amount: '', reason: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust XP');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you SURE you want to delete this customer? Their profile and wallet will be permanently removed. This action cannot be undone.')) {
      try {
        await axios.delete(`/api/customers/${id}`);
        await fetchCustomers();
        if (selectedCustomer && selectedCustomer._id === id) {
          setSelectedCustomer(null);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const fetchTransactions = async (id) => {
    try {
      const { data } = await axios.get(`/api/customers/${id}/transactions`);
      setCustomerTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  };

  const handleSelectCustomer = (c) => {
    setSelectedCustomer(c);
    fetchTransactions(c._id);
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({ id: '', name: '', mobile: '', pin: '' });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/customers/${editCustomerData.id}`, {
        name: editCustomerData.name,
        mobile: editCustomerData.mobile,
        pin: editCustomerData.pin
      });
      await fetchCustomers();
      setShowEditModal(false);
      // Update selected customer if we are viewing it
      if (selectedCustomer && selectedCustomer._id === editCustomerData.id) {
        setSelectedCustomer({ ...selectedCustomer, name: editCustomerData.name, mobile: editCustomerData.mobile });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update customer');
    }
  };

  const exportCSV = () => {
    if (customers.length === 0) return alert('No customers to export');
    const headers = ['R.ONE ID', 'Name', 'Mobile', 'XP Balance', 'Status', 'Joined Date'];
    const rows = customers.map(c => [
      c.rOneId,
      c.name,
      c.mobile,
      c.wallet?.totalAvailableXP || 0,
      c.status,
      new Date(c.createdAt).toLocaleDateString()
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>CUSTOMERS</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={exportCSV}>EXPORT CSV</button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ NEW CUSTOMER</button>
        </div>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: 'var(--status-warning)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid var(--status-warning)' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
           <div style={{ padding: '2rem', textAlign: 'center' }}>Loading customers...</div>
        ) : customers.length === 0 ? (
           <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No customers found.</div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>CUSTOMER</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>R.ONE ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>MOBILE</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>XP BALANCE</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>STATUS</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{c.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--primary-blue)' }}>{c.rOneId}</td>
                    <td style={{ padding: '1rem' }}>{c.mobile}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--accent-blue)' }}>{c.wallet?.totalAvailableXP || 0} XP</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${c.status === 'ACTIVE' ? 'status-active' : 'status-offline'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleSelectCustomer(c)}>VIEW</button>
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
            <h3 style={{ marginBottom: '1.5rem' }}>CREATE CUSTOMER</h3>
            {error && <div style={{ color: 'var(--status-warning)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <form onSubmit={handleAddSubmit}>
              <div className="input-group">
                <label>Name</label>
                <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="input-group">
                <label>Mobile Number</label>
                <input required type="text" value={newCustomer.mobile} onChange={e => setNewCustomer({...newCustomer, mobile: e.target.value})} placeholder="10-digit number" />
              </div>
              <div className="input-group">
                <label>4-Digit PIN (For Customer Login)</label>
                <input required type="text" maxLength={4} value={newCustomer.pin} onChange={e => setNewCustomer({...newCustomer, pin: e.target.value})} placeholder="e.g. 1234" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => { setShowAddModal(false); setError(''); }}>CANCEL</button>
                <button type="submit" className="btn btn-primary">CREATE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', backgroundColor: 'var(--bg-darkest)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--accent-blue)', margin: 0 }}>CUSTOMER DETAILS</h3>
              <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => {
                setEditCustomerData({ id: selectedCustomer._id, name: selectedCustomer.name, mobile: selectedCustomer.mobile, pin: '' });
                setShowEditModal(true);
              }}>EDIT</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Name:</span> 
                <span style={{ fontWeight: 600 }}>{selectedCustomer.name}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>R.ONE ID:</span> 
                <span style={{ fontWeight: 600 }}>{selectedCustomer.rOneId}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mobile:</span> 
                <span style={{ fontWeight: 600 }}>{selectedCustomer.mobile}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span> 
                <span className={`status-badge ${selectedCustomer.status === 'ACTIVE' ? 'status-active' : 'status-offline'}`}>
                  {selectedCustomer.status}
                </span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Joined:</span> 
                <span>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>WALLET</h4>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Available XP:</span> 
                <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{selectedCustomer.wallet?.totalAvailableXP.toFixed(2) || 0}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Purchased XP:</span> 
                <span>{selectedCustomer.wallet?.purchasedXP.toFixed(2) || 0}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bonus XP:</span> 
                <span>{selectedCustomer.wallet?.bonusXP.toFixed(2) || 0}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lifetime XP Burned:</span> 
                <span style={{ color: 'var(--status-warning)' }}>{selectedCustomer.wallet?.lifetimeXPBurned.toFixed(2) || 0}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lifetime Bonus Earned:</span> 
                <span style={{ color: 'var(--status-success)' }}>{selectedCustomer.wallet?.lifetimeBonusEarned.toFixed(2) || 0}</span>
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>RECENT TRANSACTIONS</h4>
              {customerTransactions.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No transactions found.</div>
              ) : (
                customerTransactions.map(tx => (
                  <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <div>
                      <div style={{ color: '#fff' }}>{tx.type}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: tx.amount > 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} XP
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <div>
                <button className="btn" style={{ borderColor: 'var(--status-warning)', color: 'var(--status-warning)', marginRight: '1rem' }} onClick={() => setShowAdjustModal(true)}>ADJUST XP</button>
                <button className="btn" style={{ backgroundColor: 'rgba(255,0,0,0.1)', borderColor: 'red', color: 'red' }} onClick={() => handleDeleteCustomer(selectedCustomer._id)}>DELETE</button>
              </div>
              <button className="btn btn-primary" onClick={() => setSelectedCustomer(null)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {showAdjustModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--bg-darker)', border: '1px solid var(--status-warning)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--status-warning)' }}>MANUAL XP ADJUSTMENT</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Use a positive number (e.g. 50) to ADD XP, or a negative number (e.g. -50) to CUT XP from the customer's bonus balance.
            </p>
            <form onSubmit={handleAdjustXP}>
              <div className="input-group">
                <label>Amount (+/-)</label>
                <input required type="number" value={adjustData.amount} onChange={e => setAdjustData({...adjustData, amount: e.target.value})} placeholder="e.g. 50 or -50" />
              </div>
              <div className="input-group">
                <label>Reason (Optional)</label>
                <input type="text" value={adjustData.reason} onChange={e => setAdjustData({...adjustData, reason: e.target.value})} placeholder="e.g. Compensation for lag" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowAdjustModal(false)}>CANCEL</button>
                <button type="submit" className="btn" style={{ backgroundColor: 'var(--status-warning)', color: '#000', fontWeight: 'bold' }}>CONFIRM</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--bg-darkest)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>EDIT CUSTOMER</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="input-group">
                <label>Name</label>
                <input required type="text" value={editCustomerData.name} onChange={e => setEditCustomerData({...editCustomerData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Mobile Number</label>
                <input required type="text" value={editCustomerData.mobile} onChange={e => setEditCustomerData({...editCustomerData, mobile: e.target.value})} />
              </div>
              <div className="input-group">
                <label>New 4-Digit PIN (Optional)</label>
                <input type="text" maxLength={4} value={editCustomerData.pin} onChange={e => setEditCustomerData({...editCustomerData, pin: e.target.value})} placeholder="Leave blank to keep existing" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>CANCEL</button>
                <button type="submit" className="btn btn-primary">SAVE CHANGES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
