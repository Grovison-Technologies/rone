import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  const [dateRange, setDateRange] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchReports = async () => {
    try {
      let params = {};
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const getLocalBoundary = (d, isEnd) => {
        const date = new Date(d);
        if (isEnd) {
          date.setHours(23, 59, 59, 999);
        } else {
          date.setHours(0, 0, 0, 0);
        }
        return date.toISOString();
      };

      if (dateRange === 'today') {
        params = { startDate: getLocalBoundary(today, false), endDate: getLocalBoundary(today, true) };
      } else if (dateRange === 'yesterday') {
        params = { startDate: getLocalBoundary(yesterday, false), endDate: getLocalBoundary(yesterday, true) };
      } else if (dateRange === 'custom') {
        if (customStart && customEnd) {
          const startStr = customStart + "T00:00:00"; // parse exactly in local time
          const endStr = customEnd + "T00:00:00";
          params = { startDate: getLocalBoundary(startStr, false), endDate: getLocalBoundary(endStr, true) };
        }
      }

      const [sumRes, txRes, sessRes] = await Promise.all([
        axios.get('/api/reports/summary', { params }),
        axios.get('/api/reports/transactions', { params }),
        axios.get('/api/reports/sessions', { params })
      ]);
      setSummary(sumRes.data);
      setTransactions(txRes.data);
      setSessions(sessRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reports');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, customStart, customEnd]);

  const calculateDuration = (start, end) => {
    if (!end) return 'Ongoing';
    const diff = Math.floor((new Date(end) - new Date(start)) / 1000);
    const m = Math.floor(diff / 60);
    return `${m}m`;
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    let title = 'Report';
    if (dateRange === 'today') title = 'Report - Today';
    else if (dateRange === 'yesterday') title = 'Report - Yesterday';
    else if (dateRange === 'custom') title = `Report - ${customStart} to ${customEnd}`;

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Revenue: Rs. ${summary.todaysRevenue}`, 14, 25);
    doc.text(`Total Sessions: ${summary.totalSessionsToday}`, 14, 30);
    doc.text(`XP Consumed: ${summary.totalXPConsumedToday.toFixed(2)}`, 14, 35);
    doc.text(`New Customers: ${summary.newCustomersCount || 0}`, 14, 40);

    let startY = 50;

    if (activeTab === 'transactions') {
      if (transactions.length === 0) {
        doc.text('No transactions found in this period.', 14, startY);
      } else {
        const tableColumn = ["Date", "Customer", "Type", "Amount", "Balance", "Staff"];
        const tableRows = [];

        transactions.forEach(tx => {
          const txData = [
            new Date(tx.createdAt).toLocaleString(),
            tx.customer?.name || 'Unknown',
            tx.type,
            tx.amount.toFixed(2),
            tx.afterBalance.toFixed(2),
            tx.staffResponsible?.name || 'System'
          ];
          tableRows.push(txData);
        });

        autoTable(doc, {
          startY,
          head: [tableColumn],
          body: tableRows,
        });
      }
    } else {
      if (sessions.length === 0) {
        doc.text('No sessions found in this period.', 14, startY);
      } else {
        const tableColumn = ["Started", "Station", "Customer", "Players", "Split", "Status", "Total XP"];
        const tableRows = [];

        sessions.forEach(s => {
          const sData = [
            new Date(s.startedAt).toLocaleString(),
            s.station?.displayName || 'Unknown',
            s.payerCustomer?.name || 'Unknown',
            s.currentSegment?.playerCount || 1,
            s.splitMethod === 'EQUAL' ? 'Yes' : 'No',
            s.status,
            (s.totalXPUsed || 0).toFixed(2)
          ];
          tableRows.push(sData);
        });

        autoTable(doc, {
          startY,
          head: [tableColumn],
          body: tableRows,
        });
      }
    }

    doc.save(`rone_${activeTab}_report.pdf`);
  };

  if (error) return <div style={{ padding: '2rem', color: 'var(--status-warning)' }}>{error}</div>;
  if (!summary) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>REPORTS & AUDITING</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={exportPDF}>EXPORT PDF</button>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--bg-darker)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {dateRange === 'custom' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--bg-darker)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              <span>to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--bg-darker)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
          )}
          
          <button className="btn" onClick={fetchReports}>REFRESH</button>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--accent-blue)', fontSize: '2rem', marginBottom: '0.5rem' }}>₹{summary.todaysRevenue}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>REVENUE</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{summary.totalSessionsToday}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>TOTAL SESSIONS</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{summary.totalXPConsumedToday.toFixed(2)}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>XP CONSUMED</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--status-warning)' }}>{summary.activeSessionsCount}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>ACTIVE SESSIONS</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#00d2ff' }}>{summary.newCustomersCount || 0}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>NEW CUSTOMERS</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'transactions' ? 'var(--primary-blue)' : 'transparent',
            borderColor: activeTab === 'transactions' ? 'var(--primary-blue)' : 'rgba(255,255,255,0.2)'
          }}
          onClick={() => setActiveTab('transactions')}
        >
          WALLET TRANSACTIONS
        </button>
        <button 
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'sessions' ? 'var(--primary-blue)' : 'transparent',
            borderColor: activeTab === 'sessions' ? 'var(--primary-blue)' : 'rgba(255,255,255,0.2)'
          }}
          onClick={() => setActiveTab('sessions')}
        >
          SESSION LOGS
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'transactions' ? (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>DATE/TIME</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>CUSTOMER</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>TYPE</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>BALANCE</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>STAFF</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No transactions found.</td></tr>
                ) : transactions.map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(t.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{t.customer?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-blue)' }}>{t.customer?.rOneId}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${t.type.includes('USAGE') ? 'status-offline' : 'status-active'}`}>
                        {t.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: t.amount > 0 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                      {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} XP
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {t.afterBalance.toFixed(2)} XP
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {t.staffResponsible ? t.staffResponsible.name : 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>SESSION ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>CUSTOMER</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>GAME / STATION</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>START TIME</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>END TIME</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>DURATION</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>XP USED</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>No sessions found.</td></tr>
                ) : sessions.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--primary-blue)' }}>{s.sessionNumber}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{s.payerCustomer?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.payerCustomer?.mobile}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{s.gameName || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.station?.displayName}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(s.startedAt).toLocaleTimeString()}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{s.endedAt ? new Date(s.endedAt).toLocaleTimeString() : <span style={{ color: 'var(--status-active)' }}>Active</span>}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                      {calculateDuration(s.startedAt, s.endedAt)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--status-warning)' }}>
                      -{s.totalXPUsed.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
