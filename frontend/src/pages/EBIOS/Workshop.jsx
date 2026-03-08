import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ebiosService } from '../../services/api';

const WORKSHOPS = [
  { step: '1', label: 'Atelier 1', title: 'Cadrage et socle de securite' },
  { step: '2', label: 'Atelier 2', title: 'Sources de risque' },
  { step: '3', label: 'Atelier 3', title: 'Scenarios strategiques' },
  { step: '4', label: 'Atelier 4', title: 'Scenarios operationnels' },
  { step: '5', label: 'Atelier 5', title: 'Traitement du risque' },
];

const RISK_COLORS = { acceptable: '#16a34a', tolerable: '#d97706', unacceptable: '#dc2626' };

export default function EbiosWorkshop() {
  const { projectId, step } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [extraData, setExtraData] = useState({});

  const currentWorkshop = WORKSHOPS.find(w => w.step === step);

  const loadData = async () => {
    setLoading(true);
    try {
      let res, extra = {};
      if (step === '1') {
        const [bv, fe] = await Promise.all([
          ebiosService.getBusinessValues(projectId),
          ebiosService.getFearedEvents(projectId),
        ]);
        res = bv;
        extra.fearedEvents = fe.data;
      } else if (step === '2') {
        res = await ebiosService.getRiskSources(projectId);
      } else if (step === '3') {
        const [ss, rs, fe] = await Promise.all([
          ebiosService.getStrategicScenarios(projectId),
          ebiosService.getRiskSources(projectId),
          ebiosService.getFearedEvents(projectId),
        ]);
        res = ss;
        extra.riskSources = rs.data;
        extra.fearedEvents = fe.data;
      } else if (step === '4') {
        res = await ebiosService.getOperationalScenarios(projectId);
      } else if (step === '5') {
        const [measures, scenarios] = await Promise.all([
          ebiosService.getMeasures(projectId),
          ebiosService.getStrategicScenarios(projectId),
        ]);
        res = measures;
        extra.scenarios = scenarios.data;
      }
      setData(res.data);
      setExtraData(extra);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); setShowForm(false); setForm({}); }, [step, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (step === '1') await ebiosService.createBusinessValue(projectId, form);
      else if (step === '2') await ebiosService.createRiskSource(projectId, form);
      else if (step === '3') await ebiosService.createStrategicScenario(projectId, {
        ...form, likelihood: parseInt(form.likelihood), severity: parseInt(form.severity),
      });
      else if (step === '4') await ebiosService.createOperationalScenario(projectId, {
        ...form, likelihood: parseInt(form.likelihood), severity: parseInt(form.severity),
      });
      else if (step === '5') await ebiosService.createMeasure(projectId, form);
      setShowForm(false);
      setForm({});
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const renderForm = () => {
    if (step === '1') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[{ label: 'Nom', key: 'name', required: true }, { label: 'Responsable', key: 'responsable' }, { label: 'Description', key: 'description' }].map(({ label, key, required }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>{label}</label>
            <input value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} required={required}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
        ))}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Type</label>
          <select value={form.type || 'process'} onChange={e => setForm({ ...form, type: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {['process', 'information', 'service'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    );

    if (step === '2') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[{ label: 'Nom', key: 'name', required: true }, { label: 'Motivation', key: 'motivation' }].map(({ label, key, required }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>{label}</label>
            <input value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} required={required}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
        ))}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Categorie</label>
          <select value={form.category || 'organized_crime'} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {['state_actor', 'organized_crime', 'hacktivist', 'malicious_insider', 'negligent_insider', 'competitor'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Pertinence (1-4)</label>
          <select value={form.pertinence || 2} onChange={e => setForm({ ...form, pertinence: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    );

    if (step === '3') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Nom</label>
          <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Source de risque</label>
          <select value={form.risk_source_id || ''} onChange={e => setForm({ ...form, risk_source_id: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            <option value="">Selectionner...</option>
            {(extraData.riskSources || []).map(rs => <option key={rs.id} value={rs.id}>{rs.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Evenement redoute</label>
          <select value={form.feared_event_id || ''} onChange={e => setForm({ ...form, feared_event_id: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            <option value="">Selectionner...</option>
            {(extraData.fearedEvents || []).map(fe => <option key={fe.id} value={fe.id}>{fe.description}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Vraisemblance (1-4)</label>
          <select value={form.likelihood || 2} onChange={e => setForm({ ...form, likelihood: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Gravite (1-4)</label>
          <select value={form.severity || 2} onChange={e => setForm({ ...form, severity: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    );

    if (step === '4') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Nom</label>
          <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Description technique</label>
          <input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Vraisemblance (1-4)</label>
          <select value={form.likelihood || 2} onChange={e => setForm({ ...form, likelihood: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Gravite (1-4)</label>
          <select value={form.severity || 2} onChange={e => setForm({ ...form, severity: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    );

    if (step === '5') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Nom de la mesure</label>
          <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Scenario concerne</label>
          <select value={form.strategic_scenario_id || ''} onChange={e => setForm({ ...form, strategic_scenario_id: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            <option value="">Selectionner...</option>
            {(extraData.scenarios || []).map(s => <option key={s.id} value={s.id}>{s.scenario_name || s.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Type</label>
          <select value={form.type || 'preventive'} onChange={e => setForm({ ...form, type: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {['preventive', 'detective', 'corrective', 'deterrent'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Option de traitement</label>
          <select value={form.treatment_option || 'reduce'} onChange={e => setForm({ ...form, treatment_option: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {['reduce', 'transfer', 'avoid', 'accept'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Responsable</label>
          <input value={form.responsible || ''} onChange={e => setForm({ ...form, responsible: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Risque residuel</label>
          <select value={form.residual_risk_level || 'tolerable'} onChange={e => setForm({ ...form, residual_risk_level: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            {['acceptable', 'tolerable', 'unacceptable'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
    );

    return <p style={{ color: '#64748b' }}>Formulaire en cours de developpement.</p>;
  };

  const renderItem = (item) => {
    if (step === '1') return (
      <div key={item.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{item.name}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{item.type} — {item.responsable}</p>
          </div>
        </div>
      </div>
    );

    if (step === '2') return (
      <div key={item.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{item.name}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{item.category}</p>
          </div>
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '12px' }}>
            Pertinence : {item.pertinence}/4
          </span>
        </div>
      </div>
    );

    if (step === '3') return (
      <div key={item.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{item.scenario_name || item.name}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
              Source : {item.risk_source_name} — Vraisemblance : {item.likelihood}/4 — Gravite : {item.severity}/4
            </p>
          </div>
          <span style={{
            background: RISK_COLORS[item.risk_level] + '20',
            color: RISK_COLORS[item.risk_level],
            padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
          }}>
            {item.risk_level}
          </span>
        </div>
      </div>
    );

    if (step === '4') return (
      <div key={item.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{item.name}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
              Vraisemblance : {item.likelihood}/4 — Gravite : {item.severity}/4
            </p>
          </div>
          <span style={{
            background: RISK_COLORS[item.risk_level] + '20',
            color: RISK_COLORS[item.risk_level],
            padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
          }}>
            {item.risk_level}
          </span>
        </div>
      </div>
    );

    if (step === '5') return (
      <div key={item.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{item.name}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
              {item.type} — {item.treatment_option} — Responsable : {item.responsible}
            </p>
          </div>
          <span style={{
            background: RISK_COLORS[item.residual_risk_level] + '20',
            color: RISK_COLORS[item.residual_risk_level],
            padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
          }}>
            Residuel : {item.residual_risk_level}
          </span>
        </div>
      </div>
    );

    return (
      <div key={item.id} style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <p style={{ margin: 0, color: '#1e293b', fontSize: '14px' }}>{item.name || item.description}</p>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {WORKSHOPS.map(w => (
          <button
            key={w.step}
            onClick={() => navigate(`/ebios/${projectId}/workshop/${w.step}`)}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500',
              background: w.step === step ? '#2563eb' : '#f1f5f9',
              color: w.step === step ? '#fff' : '#475569',
            }}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#1e293b', margin: 0 }}>{currentWorkshop?.label}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>{currentWorkshop?.title}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: '#2563eb', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
          }}
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '24px', marginBottom: '24px',
        }}>
          <form onSubmit={handleSubmit}>
            {renderForm()}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button type="submit" disabled={saving}
                style={{
                  background: '#2563eb', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
                }}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{
                  background: '#f1f5f9', color: '#475569', border: 'none',
                  padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
                }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '24px', color: '#64748b' }}>Chargement...</p>
        ) : data.length === 0 ? (
          <p style={{ padding: '24px', color: '#94a3b8', textAlign: 'center' }}>
            Aucun element pour cet atelier.
          </p>
        ) : (
          data.map(item => renderItem(item))
        )}
      </div>
    </div>
  );
}