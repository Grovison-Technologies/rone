import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import Customers from './pages/Customers';
import Stations from './pages/Stations';
import Settings from './pages/Settings';
import LiveGaming from './pages/LiveGaming';
import CustomerDash from './pages/CustomerDash';
import Reports from './pages/Reports';
import Login from './pages/Login';
import CustomerSelect from './components/CustomerSelect';
import Landing from './pages/Landing';
import './index.css';

// Set default base URL and credentials for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
axios.defaults.withCredentials = true;

axios.interceptors.request.use(config => {
  try {
    const userStr = localStorage.getItem('rOneUser');
    const custStr = localStorage.getItem('rOneCustomer');
    const user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
    const customer = custStr && custStr !== 'undefined' ? JSON.parse(custStr) : null;
    
    let token = null;
    
    // Check if the request is for a customer-specific endpoint
    const isCustomerRoute = config.url && (
      config.url.includes('/api/customers/me') ||
      config.url.includes('/api/sessions/my-active') ||
      config.url.includes('/api/stations/customer')
    );

    if (isCustomerRoute && customer?.token) {
      token = customer.token;
    } else if (user?.token) {
      token = user.token;
    } else if (customer?.token) {
      token = customer.token; // fallback
    }

    if (token) {
      if (config.headers.set) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error('Error parsing auth token', err);
  }
  return config;
});

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const isActive = (path) => location.pathname === path ? { color: 'var(--accent-blue)', borderLeft: '3px solid var(--accent-blue)', backgroundColor: 'rgba(0,168,255,0.1)' } : { color: 'var(--text-secondary)' };

  const closeSidebar = () => {
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay desktop-only" onClick={closeSidebar} style={{ display: 'block' }}></div>
      )}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`} style={{ width: '250px', backgroundColor: 'var(--bg-darker)', height: '100vh', padding: '2rem 0', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 2rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="R.ONE" style={{ height: '30px', marginRight: '1rem' }} />
            <span style={{ fontWeight: 700, letterSpacing: '1px' }}>{user?.role || 'OWNER'}</span>
          </div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <Link to="/owner-dash" onClick={closeSidebar} style={{ padding: '1rem 2rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', ...isActive('/owner-dash') }}>
            OVERVIEW
          </Link>
          <Link to="/live" onClick={closeSidebar} style={{ padding: '1rem 2rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', ...isActive('/live') }}>
            LIVE GAMING
          </Link>
          <Link to="/customers" onClick={closeSidebar} style={{ padding: '1rem 2rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', ...isActive('/customers') }}>
            CUSTOMERS
          </Link>
          <Link to="/stations" onClick={closeSidebar} style={{ padding: '1rem 2rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', ...isActive('/stations') }}>
            STATIONS
          </Link>
          {user?.role === 'OWNER' && (
            <Link to="/reports" onClick={closeSidebar} style={{ padding: '1rem 2rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', ...isActive('/reports') }}>
              REPORTS
            </Link>
          )}
          <Link to="/settings" onClick={closeSidebar} style={{ padding: '1rem 2rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', ...isActive('/settings') }}>
            SETTINGS
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn" onClick={() => logout('user')} style={{ width: '100%', fontSize: '0.75rem', borderColor: 'var(--status-warning)' }}>Logout</button>
          <Link to="/customer-login" className="btn" style={{ width: '100%', fontSize: '0.75rem' }}>View Customer App</Link>
        </div>
      </div>
    </>
  );
};

const OwnerOverview = () => {
  const [summary, setSummary] = useState(null);
  const [showAddXPModal, setShowAddXPModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [xpData, setXpData] = useState({ customerId: '', baseXP: '', bonusXP: '', amountPaid: '', validityDays: '' });
  const [error, setError] = useState('');
  const [isOffPeak, setIsOffPeak] = useState(false);

  const fetchOverviewData = async () => {
    try {
      const [sumRes, custRes, sysRes] = await Promise.all([
        axios.get('/api/reports/summary'),
        axios.get('/api/customers'),
        axios.get('/api/system')
      ]);
      setSummary(sumRes.data);
      setCustomers(custRes.data);
      setIsOffPeak(sysRes.data?.isOffPeakModeActive || false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleAddXP = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`/api/customers/${xpData.customerId}/add-xp`, xpData);
      setShowAddXPModal(false);
      setXpData({ customerId: '', baseXP: '', bonusXP: '', amountPaid: '', validityDays: '' });
      alert('XP Added Successfully!');
      fetchOverviewData(); // Refresh summary if payment affects revenue
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add XP');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>OVERVIEW</h2>
        
        <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-darker)' }}>
          <span style={{ fontWeight: 'bold', color: isOffPeak ? 'var(--text-secondary)' : 'var(--status-warning)' }}>PEAK</span>
          <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
            <input 
              type="checkbox" 
              checked={isOffPeak} 
              onChange={async () => {
                try {
                  const res = await axios.put('/api/system/toggle-peak');
                  setIsOffPeak(res.data.isOffPeakModeActive);
                } catch(err) { alert('Failed to toggle mode'); }
              }} 
              style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <span className="slider round" style={{ 
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: isOffPeak ? 'var(--status-success)' : 'var(--status-warning)', 
              transition: '.4s', borderRadius: '34px',
              display: 'flex', alignItems: 'center'
            }}>
              <span style={{ 
                position: 'absolute', height: '26px', width: '26px', left: isOffPeak ? '30px' : '4px', bottom: '4px', 
                backgroundColor: 'white', transition: '.4s', borderRadius: '50%' 
              }}></span>
            </span>
          </label>
          <span style={{ fontWeight: 'bold', color: isOffPeak ? 'var(--status-success)' : 'var(--text-secondary)' }}>OFF-PEAK</span>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--accent-blue)', fontSize: '2rem', marginBottom: '0.5rem' }}>₹{summary?.todaysRevenue || 0}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>TODAY'S REVENUE</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{summary?.totalSessionsToday || 0}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>SESSIONS</p>
        </div>
        <div className="card" style={{ borderColor: 'var(--accent-blue)', boxShadow: 'var(--shadow-glow)' }}>
          <h3 style={{ color: 'var(--accent-blue)', fontSize: '2rem', marginBottom: '0.5rem' }}>{summary?.activeSessionsCount || 0}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>ACTIVE SESSIONS</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', letterSpacing: '1px' }}>QUICK ACTIONS</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/live" className="btn btn-primary">+ START SESSION</Link>
          <button className="btn" onClick={() => setShowAddXPModal(true)}>+ ADD XP</button>
          <Link to="/customers" className="btn">+ NEW CUSTOMER</Link>
        </div>
      </div>

      {showAddXPModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', backgroundColor: 'var(--bg-darkest)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>ADD XP TO WALLET</h3>
            {error && <div style={{ color: 'var(--status-warning)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            
            <form onSubmit={handleAddXP}>
              <div className="input-group">
                <label>Select Customer</label>
                <CustomerSelect 
                  customers={customers} 
                  selectedId={xpData.customerId} 
                  onChange={(id) => setXpData({...xpData, customerId: id})} 
                />
              </div>
              <div className="input-group">
                <label>Base XP</label>
                <input type="number" required value={xpData.baseXP} onChange={e => setXpData({...xpData, baseXP: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Bonus XP</label>
                <input type="number" value={xpData.bonusXP} onChange={e => setXpData({...xpData, bonusXP: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Amount Paid (₹)</label>
                <input type="number" required value={xpData.amountPaid} onChange={e => setXpData({...xpData, amountPaid: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label>Bonus Validity (Days)</label>
                <input type="number" placeholder="Optional" value={xpData.validityDays} onChange={e => setXpData({...xpData, validityDays: Number(e.target.value)})} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Leave blank for no expiry</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowAddXPModal(false)}>CANCEL</button>
                <button type="submit" className="btn btn-primary" disabled={!xpData.customerId || xpData.amountPaid === '' || xpData.amountPaid < 0}>ADD XP</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const OwnerLayout = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="main-content" style={{ flex: 1, backgroundColor: 'var(--bg-darkest)', overflowY: 'auto' }}>
        <div className="mobile-header">
          <button className="btn" onClick={() => setIsSidebarOpen(true)} style={{ padding: '0.5rem', marginRight: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
            ☰
          </button>
          <img src="/logo.png" alt="R.ONE" style={{ height: '24px', marginRight: '0.5rem' }} />
          <span style={{ fontWeight: 700 }}>R.ONE</span>
        </div>
        {children}
      </div>
    </div>
  );
};

const CustomerLayout = ({ children }) => {
  const { customer, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!customer) return <Navigate to="/customer-login" />;

  return (
    <>
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login type="staff" />} />
        <Route path="/customer-login" element={<Login type="customer" />} />
        
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Protected Owner Routes */}
        <Route path="/owner-dash" element={<OwnerLayout><OwnerOverview /></OwnerLayout>} />
        <Route path="/customers" element={<OwnerLayout><Customers /></OwnerLayout>} />
        <Route path="/live" element={<OwnerLayout><LiveGaming /></OwnerLayout>} />
        <Route path="/stations" element={<OwnerLayout><Stations /></OwnerLayout>} />
        <Route path="/reports" element={<OwnerLayout><Reports /></OwnerLayout>} />
        <Route path="/settings" element={<OwnerLayout><Settings /></OwnerLayout>} />
        
        {/* Protected Customer Route */}
        <Route path="/customer-dash" element={<CustomerLayout><CustomerDash /></CustomerLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
