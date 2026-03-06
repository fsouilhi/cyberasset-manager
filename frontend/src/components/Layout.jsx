import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <aside style={{
        width: '240px',
        background: '#1a1f2e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}>
        <div style={{ padding: '0 24px 32px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa', margin: 0 }}>
            CyberAsset Manager
          </h1>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>
            Gestion des actifs IT
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { to: '/', label: 'Tableau de bord', exact: true },
            { to: '/assets', label: 'Actifs IT' },
            { to: '/ebios', label: 'Analyse EBIOS RM' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 24px',
                color: isActive ? '#60a5fa' : '#94a3b8',
                background: isActive ? '#1e293b' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '24px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Deconnexion
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, background: '#f8fafc', padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}