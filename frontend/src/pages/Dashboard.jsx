import React, { useState, useEffect } from 'react';
import { assetService, ebiosService } from '../services/api';

const StatCard = ({ title, value, color }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '24px',
    borderLeft: `4px solid ${color}`,
  }}>
    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px' }}>{title}</p>
    <p style={{ color: '#1e293b', fontSize: '28px', fontWeight: '700', margin: 0 }}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([assetService.getAll(), ebiosService.getProjects()])
      .then(([a, p]) => {
        setAssets(a.data);
        setProjects(p.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const critical = assets.filter(a => a.criticality === 4).length;
  const active = assets.filter(a => a.status === 'active').length;

  const byType = assets.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <p style={{ color: '#64748b' }}>Chargement...</p>;

  return (
    <div>
      <h2 style={{ color: '#1e293b', marginBottom: '4px' }}>Tableau de bord</h2>
      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>
        Vue d'ensemble du systeme d'information
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard title="Total actifs" value={assets.length} color="#2563eb" />
        <StatCard title="Actifs critiques" value={critical} color="#dc2626" />
        <StatCard title="Actifs actifs" value={active} color="#16a34a" />
        <StatCard title="Projets EBIOS RM" value={projects.length} color="#7c3aed" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '16px', fontSize: '15px' }}>Actifs par type</h3>
        {Object.keys(byType).length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Aucun actif enregistre.</p>
        ) : (
          Object.entries(byType).map(([type, count]) => (
            <div key={type} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: '#475569', textTransform: 'capitalize' }}>{type}</span>
                <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>{count}</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '6px' }}>
                <div style={{
                  background: '#2563eb',
                  height: '6px',
                  borderRadius: '4px',
                  width: `${(count / assets.length) * 100}%`,
                }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}