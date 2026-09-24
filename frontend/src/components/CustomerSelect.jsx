import React, { useState, useEffect, useRef } from 'react';

const CustomerSelect = ({ customers, selectedId, onChange, placeholder = "Search by name, phone, or R.ONE ID..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedCustomer = customers.find(c => c._id === selectedId);

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.rOneId.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.75rem',
          borderRadius: '4px',
          backgroundColor: 'var(--bg-darker)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: selectedCustomer ? 'white' : 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>
          {selectedCustomer 
            ? `${selectedCustomer.name} (${selectedCustomer.rOneId}) - ${selectedCustomer.wallet?.totalAvailableXP || 0} XP` 
            : '-- Choose Customer --'
          }
        </span>
        <span style={{ fontSize: '0.8rem' }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'var(--bg-darker)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          maxHeight: '250px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <input 
              type="text"
              autoFocus
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: 'white',
                outline: 'none',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ overflowY: 'auto' }}>
            {filteredCustomers.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No customers found.
              </div>
            ) : (
              filteredCustomers.map(c => (
                <div 
                  key={c._id}
                  onClick={() => {
                    onChange(c._id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'white' }}>{c.name}</strong>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{c.wallet?.totalAvailableXP || 0} XP</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{c.mobile}</span>
                    <span>{c.rOneId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelect;
