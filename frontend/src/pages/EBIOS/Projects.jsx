import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ebiosService } from '../../services/api';

const STATUS_LABELS = { in_progress: 'En cours', completed: 'Termine', archived: 'Archive' };
const STATUS_COLORS = { in_progress: '#2563eb', completed: '#16a34a', archived: '#64748b' };

const initialForm = { name: '', description: '', organization: '', scope: '' };

export default function EbiosProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    ebiosService.getProjects()
      .then(r => setProjects(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ebiosService.createProject(form);
      setShowForm(false);
      setForm(initialForm);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#1e293b', margin: 0 }}>Analyse EBIOS Risk Manager</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Methode ANSSI — 5 ateliers
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: '#2563eb', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
          }}
        >
          + Nouveau projet
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '24px', marginBottom: '24px',
        }}>
          <h3 style={{ margin: '0 0 20px', color: '#1e293b' }}>Nouveau projet EBIOS RM</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Nom du projet', key: 'name', required: true },
                { label: 'Organisation', key: 'organization' },
                { label: 'Description', key: 'description' },
                { label: 'Perimetre', key: 'scope' },
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
                {saving ? 'Enregistrement...' : 'Creer le projet'}
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
      ) : projects.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '48px', textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>Aucun projet EBIOS RM.</p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: '#2563eb', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '14px', marginTop: '12px',
            }}
          >
            Creer le premier projet
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {projects.map(project => (
            <div
              key={project.id}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                padding: '24px', cursor: 'pointer',
              }}
              onClick={() => navigate(`/ebios/${project.id}/workshop/1`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: '#1e293b', fontSize: '16px' }}>{project.name}</h3>
                  <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '13px' }}>{project.organization}</p>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{project.description}</p>
                </div>
                <span style={{
                  background: STATUS_COLORS[project.status] + '20',
                  color: STATUS_COLORS[project.status],
                  padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                }}>
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                {['Atelier 1', 'Atelier 2', 'Atelier 3', 'Atelier 4', 'Atelier 5'].map((a, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#f1f5f9', color: '#475569',
                      padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}