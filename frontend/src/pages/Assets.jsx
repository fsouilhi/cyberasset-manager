import React, { useState, useEffect } from 'react';
import { assetService } from '../services/api';

const CRITICALITY_LABELS = { 1: 'Faible', 2: 'Modere', 3: 'Important', 4: 'Critique' };
const CRITICALITY_COLORS = { 1: '#64748b', 2: '#d97706', 3: '#ea580c', 4: '#dc2626' };
const TYPES = ['server', 'workstation', 'network', 'application', 'database', 'cloud', 'iot', 'other'];

const Badge = ({ value, labels, colors }) => (
  <span style={{
    background: colors[value] + '20',
    color: colors[value],
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  }}>
    {labels[value]}
  </span>
);

const initialForm = {
  name: '', type: 'server', ip_address: '', hostname: '',
  os: '', owner: '', criticality: 2, status: 'active',
};

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState({ type: '', criticality: '' });

  const load = () => {
    assetService.getAll(filter)
  .then(r => setAssets(r.data.data || r.data))      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await assetService.create(form);
      setShowForm(false);
      setForm(initialForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet actif ?')) return;
    await assetService.delete(id);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#1e293b', margin: 0 }}>Actifs IT</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Inventaire du systeme d'information
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: '#2563eb', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
          }}
        >
          + Ajouter un actif
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <select
          value={filter.type}
          onChange={e => setFilter({ ...filter, type: e.target.value })}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
        >
          <option value="">Tous les types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filter.criticality}
          onChange={e => setFilter({ ...filter, criticality: e.target.value })}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
        >
          <option value="">Toutes les criticites</option>
          {[1, 2, 3, 4].map(c => <option key={c} value={c}>{CRITICALITY_LABELS[c]}</option>)}
        </select>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '24px', marginBottom: '24px',
        }}>
          <h3 style={{ margin: '0 0 20px', color: '#1e293b' }}>Nouvel actif</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Nom', key: 'name', required: true },
                { label: 'Hostname', key: 'hostname' },
                { label: 'Adresse IP', key: 'ip_address' },
                { label: 'OS', key: 'os' },
                { label: 'Proprietaire', key: 'owner' },
              ].map(({ label, key, required }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                    {label}
                  </label>
                  <input
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={required}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '6px',
                      border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Criticite</label>
                <select
                  value={form.criticality}
                  onChange={e => setForm({ ...form, criticality: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                >
                  {[1, 2, 3, 4].map(c => <option key={c} value={c}>{CRITICALITY_LABELS[c]}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: '#2563eb', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
                }}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: '#f1f5f9', color: '#475569', border: 'none',
                  padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Chargement...</p>
      ) : assets.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '48px', textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>Aucun actif enregistre.</p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: '#2563eb', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '14px', marginTop: '12px',
            }}
          >
            Ajouter le premier actif
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Nom', 'Type', 'IP', 'OS', 'Criticite', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                    {asset.name}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{asset.type}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{asset.ip_address || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{asset.os || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge value={asset.criticality} labels={CRITICALITY_LABELS} colors={CRITICALITY_COLORS} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>{asset.status}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      style={{
                        background: '#fef2f2', color: '#dc2626', border: 'none',
                        padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}