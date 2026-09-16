import { useState, useEffect } from 'react';
import './AppStyles.css';

function SafetyPage() {
    const [inspections, setInspections] = useState([]);
    const [boats, setBoats] = useState([]);
    const [complianceMap, setComplianceMap] = useState({});
    const [boatId, setBoatId] = useState('');
    const [inspectorName, setInspectorName] = useState('');
    const [lifeJackets, setLifeJackets] = useState(false);
    const [fireExtinguisher, setFireExtinguisher] = useState(false);
    const [firstAidKit, setFirstAidKit] = useState(false);
    const [engine, setEngine] = useState(false);
    const [notes, setNotes] = useState('');

    const BASE = 'http://localhost:8080/api';

    useEffect(() => {
        fetchInspections();
        fetchBoats();
    }, []);

    const fetchInspections = () => {
        fetch(`${BASE}/inspections`).then(r => r.json()).then(setInspections);
    };

    const fetchBoats = () => {
        fetch(`${BASE}/boats`).then(r => r.json()).then(data => {
            setBoats(data);
            data.forEach(b => {
                fetch(`${BASE}/inspections/boat/${b.id}/compliant`)
                    .then(r => r.json())
                    .then(res => setComplianceMap(prev => ({ ...prev, [b.id]: res.compliant })));
            });
        });
    };

    const submitInspection = () => {
        if (!boatId || !inspectorName) return alert('Select a boat and enter inspector name');
        fetch(`${BASE}/inspections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                boat: { id: boatId },
                inspectorName,
                lifeJacketsChecked: lifeJackets,
                fireExtinguisherChecked: fireExtinguisher,
                firstAidKitChecked: firstAidKit,
                engineChecked: engine,
                notes,
            }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => {
                setBoatId(''); setInspectorName(''); setNotes('');
                setLifeJackets(false); setFireExtinguisher(false); setFirstAidKit(false); setEngine(false);
                fetchInspections();
                fetchBoats();
            })
            .catch(err => alert(err.message));
    };

    const deleteInspection = (id) => {
        if (!window.confirm('Delete this inspection record?')) return;
        fetch(`${BASE}/inspections/${id}`, { method: 'DELETE' }).then(() => {
            fetchInspections();
            fetchBoats();
        });
    };

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Safety & Compliance Management</h1>
                    <p>Record boat safety inspections and verify equipment compliance</p>
                </header>

                <div className="payments-table-card">
                    <h2 style={{ marginTop: 0 }}>Boat Compliance Overview</h2>
                    <table>
                        <thead><tr><th>Boat</th><th>Compliance Status</th></tr></thead>
                        <tbody>
                        {boats.length === 0 && (
                            <tr><td colSpan="2" className="empty-row">No boats yet.</td></tr>
                        )}
                        {boats.map(b => (
                            <tr key={b.id}>
                                <td>{b.name}</td>
                                <td>
                    <span className={`status-pill ${complianceMap[b.id] ? 'status-verified' : 'status-pending'}`}>
                      {complianceMap[b.id] === undefined ? 'Checking...' : complianceMap[b.id] ? 'Compliant' : 'Needs Inspection'}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="new-payment-card">
                    <h2>New Inspection</h2>
                    <div className="new-payment-form" style={{ flexWrap: 'wrap' }}>
                        <select value={boatId} onChange={e => setBoatId(e.target.value)}>
                            <option value="">Select boat</option>
                            {boats.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <input placeholder="Inspector name" value={inspectorName} onChange={e => setInspectorName(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '14px', flexWrap: 'wrap' }}>
                        <label><input type="checkbox" checked={lifeJackets} onChange={e => setLifeJackets(e.target.checked)} /> Life jackets</label>
                        <label><input type="checkbox" checked={fireExtinguisher} onChange={e => setFireExtinguisher(e.target.checked)} /> Fire extinguisher</label>
                        <label><input type="checkbox" checked={firstAidKit} onChange={e => setFirstAidKit(e.target.checked)} /> First aid kit</label>
                        <label><input type="checkbox" checked={engine} onChange={e => setEngine(e.target.checked)} /> Engine</label>
                    </div>
                    <input
                        placeholder="Notes (optional)"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        style={{ width: '100%', marginTop: '14px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #D8D2C2' }}
                    />
                    <button className="btn-primary" onClick={submitInspection} style={{ marginTop: '14px' }}>
                        Submit Inspection
                    </button>
                </div>

                <div className="payments-table-card">
                    <h2 style={{ marginTop: 0 }}>Inspection History</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th><th>Boat</th><th>Inspector</th><th>Date</th><th>Result</th><th>Notes</th><th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {inspections.length === 0 && (
                            <tr><td colSpan="7" className="empty-row">No inspections yet.</td></tr>
                        )}
                        {inspections.map(i => (
                            <tr key={i.id}>
                                <td>#{i.id}</td>
                                <td>{i.boat?.name}</td>
                                <td>{i.inspectorName}</td>
                                <td>{i.inspectionDate}</td>
                                <td><span className={`status-pill ${i.result === 'PASSED' ? 'status-verified' : 'status-failed'}`}>{i.result}</span></td>
                                <td>{i.notes || '—'}</td>
                                <td className="actions-cell">
                                    <button className="btn-outline btn-danger" onClick={() => deleteInspection(i.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SafetyPage;