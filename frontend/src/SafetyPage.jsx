import { useState, useEffect } from 'react';
import './AppStyles.css';

function authHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
}

function SafetyPage() {
    const [boats, setBoats] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [inspections, setInspections] = useState([]);
    const [complianceMap, setComplianceMap] = useState({});
    const [selectedBoatId, setSelectedBoatId] = useState('');

    const [eqName, setEqName] = useState('');
    const [eqCategory, setEqCategory] = useState('LIFESAVING');
    const [eqQuantity, setEqQuantity] = useState('');
    const [eqExpiry, setEqExpiry] = useState('');

    const [inspectBoatId, setInspectBoatId] = useState('');
    const [notes, setNotes] = useState('');

    const [equipmentCatalog, setEquipmentCatalog] = useState([]);
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeCategory, setNewTypeCategory] = useState('LIFESAVING');

    const [editingEquipmentId, setEditingEquipmentId] = useState(null);
    const [editQty, setEditQty] = useState('');
    const [editExpiry, setEditExpiry] = useState('');

    const BASE = 'http://localhost:8080/api';

    useEffect(() => {
        fetchBoats();
        fetchInspections();
        fetchCatalog();
    }, []);

    useEffect(() => {
        if (selectedBoatId) fetchEquipment(selectedBoatId);
    }, [selectedBoatId]);


    const fetchBoats = () => {
        fetch(`${BASE}/boats`, { headers: authHeaders() }).then(r => r.json()).then(data => {
            setBoats(data);
            data.forEach(b => {
                fetch(`${BASE}/inspections/boat/${b.id}/compliant`, { headers: authHeaders() })
                    .then(r => r.json())
                    .then(res => setComplianceMap(prev => ({ ...prev, [b.id]: res.compliant })));
            });
        });
    };

    const fetchEquipment = (boatId) => {
        fetch(`${BASE}/equipment?boatId=${boatId}`, { headers: authHeaders() }).then(r => r.json()).then(setEquipment);
    };

    const fetchInspections = () => {
        fetch(`${BASE}/inspections`, { headers: authHeaders() }).then(r => r.json()).then(setInspections);
    };

    const fetchCatalog = () => {
        fetch(`${BASE}/equipment-types`, { headers: authHeaders() }).then(r => r.json()).then(setEquipmentCatalog);
    };

    const addEquipment = () => {
        if (!selectedBoatId || !eqName || !eqQuantity) return alert('Fill in boat, name, and quantity');
        fetch(`${BASE}/equipment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({
                boat: { id: selectedBoatId },
                name: eqName,
                category: eqCategory,
                quantity: Number(eqQuantity),
                expiryDate: eqExpiry || null,
            }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setEqName(''); setEqQuantity(''); setEqExpiry(''); fetchEquipment(selectedBoatId); })
            .catch(err => alert(err.message));
    };

    const addEquipmentType = () => {
        if (!newTypeName) return alert('Enter a name for the new equipment type');
        fetch(`${BASE}/equipment-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ name: newTypeName, category: newTypeCategory }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setNewTypeName(''); fetchCatalog(); })
            .catch(err => alert(err.message));
    };

    const updateCondition = (id, condition) => {
        fetch(`${BASE}/equipment/${id}/condition`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ condition }),
        }).then(() => fetchEquipment(selectedBoatId));
    };

    const retireEquipment = (id) => {
        if (!window.confirm('Retire this equipment? It will no longer count toward inspections.')) return;
        fetch(`${BASE}/equipment/${id}/retire`, { method: 'PUT', headers: authHeaders() })
            .then(() => fetchEquipment(selectedBoatId));
    };

    const deleteEquipment = (id) => {
        if (!window.confirm('Permanently delete this equipment record?')) return;
        fetch(`${BASE}/equipment/${id}`, { method: 'DELETE', headers: authHeaders() })
            .then(() => fetchEquipment(selectedBoatId));
    };

    const submitInspection = () => {
        if (!inspectBoatId) return alert('Select a boat to inspect');
        fetch(`${BASE}/inspections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ boat: { id: inspectBoatId }, notes }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setInspectBoatId(''); setNotes(''); fetchInspections(); fetchBoats(); })
            .catch(err => alert(err.message));
    };

    const voidInspection = (id) => {
        const reason = window.prompt('Reason for voiding this inspection (required, min 5 characters):');
        if (reason === null) return;
        fetch(`${BASE}/inspections/${id}/void`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ reason }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { fetchInspections(); fetchBoats(); })
            .catch(err => alert(err.message));
    };

    const isExpired = (date) => date && new Date(date) < new Date();

    const startEditEquipment = (e) => {
        setEditingEquipmentId(e.id);
        setEditQty(e.quantity);
        setEditExpiry(e.expiryDate || '');
    };

    const saveEditEquipment = (id) => {
        fetch(`${BASE}/equipment/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ quantity: Number(editQty), expiryDate: editExpiry || null }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setEditingEquipmentId(null); fetchEquipment(selectedBoatId); })
            .catch(err => alert(err.message));
    };

    const deleteEquipmentType = (id) => {
        if (!window.confirm('Remove this equipment type from the catalog?')) return;
        fetch(`${BASE}/equipment-types/${id}`, { method: 'DELETE', headers: authHeaders() })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); })
            .then(fetchCatalog)
            .catch(err => alert(err.message));
    };

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Safety & Compliance Management</h1>
                    <p>Manage safety equipment inventory and record boat inspections</p>
                </header>

                <div className="payments-table-card">
                    <h2 style={{ marginTop: 0 }}>Boat Compliance Overview</h2>
                    <table>
                        <thead><tr><th>Boat</th><th>Compliance Status</th></tr></thead>
                        <tbody>
                        {boats.length === 0 && <tr><td colSpan="2" className="empty-row">No boats yet.</td></tr>}
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
                    <h2>Equipment Catalog</h2>
                    <p className="modal-hint">
                        This is the approved list of safety equipment types. Add a new type here only when a genuinely new category of equipment is being introduced — staff will pick from this list when stocking individual boats.
                    </p>
                    <div className="new-payment-form">
                        <input placeholder="New equipment type name (e.g. Smoke Signal)" value={newTypeName} onChange={e => setNewTypeName(e.target.value)} />
                        <select value={newTypeCategory} onChange={e => setNewTypeCategory(e.target.value)}>
                            <option value="LIFESAVING">Lifesaving</option>
                            <option value="FIRE_SAFETY">Fire Safety</option>
                            <option value="NAVIGATION">Navigation</option>
                            <option value="EMERGENCY">Emergency</option>
                        </select>
                        <button className="btn-primary" onClick={addEquipmentType}>Add to Catalog</button>
                    </div>

                    {equipmentCatalog.length > 0 && (
                        <>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F4C4A', marginTop: '18px', marginBottom: '8px' }}>Mandatory (required on every boat)</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                {equipmentCatalog.filter(t => t.isMandatory).map(t => (
                                    <span key={t.id} className="status-pill status-pending">
                                        {t.name}
                                    </span>
                                ))}
                            </div>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F4C4A', marginBottom: '8px' }}>Additional / Optional</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {equipmentCatalog.filter(t => !t.isMandatory).length === 0 && (
                                    <span style={{ fontSize: '13px', color: '#A5AEAB' }}>None added yet.</span>
                                )}
                                {equipmentCatalog.filter(t => !t.isMandatory).map(t => (
                                    <span key={t.id} className="status-pill status-pending">{t.name}
                                        <button
                                            onClick={() => deleteEquipmentType(t.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, padding: 0 }}
                                            title="Remove from catalog"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="new-payment-card">
                    <h2>Manage Equipment Inventory</h2>
                    <div className="new-payment-form">
                        <select value={selectedBoatId} onChange={e => setSelectedBoatId(e.target.value)}>
                            <option value="">Select a boat to view/manage equipment</option>
                            {boats.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    {selectedBoatId && (
                        <>
                            <div className="new-payment-form" style={{ marginTop: '14px', flexWrap: 'wrap' }}>
                                <select value={eqName} onChange={e => {
                                    const selected = equipmentCatalog.find(item => item.name === e.target.value);
                                    setEqName(e.target.value);
                                    if (selected) setEqCategory(selected.category);
                                }}>
                                    <option value="">Select equipment type</option>
                                    {equipmentCatalog.map(item => (
                                        <option key={item.id} value={item.name}>{item.name}</option>
                                    ))}
                                </select>
                                <input type="number" placeholder="Quantity" value={eqQuantity} onChange={e => setEqQuantity(e.target.value)} />
                                <input type="date" placeholder="Expiry (optional)" value={eqExpiry} onChange={e => setEqExpiry(e.target.value)} />
                                <button className="btn-primary" onClick={addEquipment}>Add Equipment</button>
                            </div>

                            <table style={{ marginTop: '18px' }}>
                                <thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Expiry</th><th>Condition</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                {equipment.length === 0 && <tr><td colSpan="7" className="empty-row">No equipment recorded for this boat yet.</td></tr>}
                                {equipment.map(e => (
                                    <tr key={e.id}>
                                        <td>{e.name}</td>
                                        <td>{e.category}</td>
                                        <td>
                                            {editingEquipmentId === e.id ? (
                                                <input type="number" value={editQty} onChange={ev => setEditQty(ev.target.value)} style={{ width: '60px', padding: '6px 8px' }} />
                                            ) : e.quantity}
                                        </td>
                                        <td>
                                            {editingEquipmentId === e.id ? (
                                                <input type="date" value={editExpiry} onChange={ev => setEditExpiry(ev.target.value)} style={{ padding: '6px 8px' }} />
                                            ) : e.expiryDate ? (
                                                <span className={isExpired(e.expiryDate) ? 'status-pill status-failed' : ''}>
                                                    {e.expiryDate} {isExpired(e.expiryDate) && '(Expired)'}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            <select value={e.condition} onChange={ev => updateCondition(e.id, ev.target.value)} disabled={e.status === 'RETIRED'}>
                                                <option value="GOOD">Good</option>
                                                <option value="NEEDS_REPLACEMENT">Needs Replacement</option>
                                                <option value="DAMAGED">Damaged</option>
                                            </select>
                                        </td>
                                        <td><span className={`status-pill ${e.status === 'ACTIVE' ? 'status-verified' : 'status-pending'}`}>{e.status}</span></td>
                                        <td className="actions-cell">
                                            {editingEquipmentId === e.id ? (
                                                <>
                                                    <button className="btn-outline" onClick={() => saveEditEquipment(e.id)}>Save</button>
                                                    <button className="btn-text" onClick={() => setEditingEquipmentId(null)}>Cancel</button>
                                                </>
                                            ) : (
                                                <button className="btn-outline" onClick={() => startEditEquipment(e)} disabled={e.status === 'RETIRED'}>Edit</button>
                                            )}
                                            <button className="btn-outline" onClick={() => retireEquipment(e.id)} disabled={e.status === 'RETIRED'}>Retire</button>
                                            <button className="btn-outline btn-danger" onClick={() => deleteEquipment(e.id)} disabled={e.status !== 'RETIRED'}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                <div className="new-payment-card">
                    <h2>New Inspection</h2>
                    <p className="modal-hint">
                        The inspection automatically checks all active equipment for this boat — it passes only if every item is in good condition and not expired.
                    </p>
                    <div className="new-payment-form">
                        <select value={inspectBoatId} onChange={e => setInspectBoatId(e.target.value)}>
                            <option value="">Select boat</option>
                            {boats.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <input
                            placeholder="Notes (optional)"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                        <button className="btn-primary" onClick={submitInspection}>Run Inspection</button>
                    </div>
                </div>

                <div className="payments-table-card">
                    <h2 style={{ marginTop: 0 }}>Inspection History</h2>
                    <table>
                        <thead><tr><th>ID</th><th>Boat</th><th>Inspector</th><th>Date</th><th>Result</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                        {inspections.length === 0 && <tr><td colSpan="7" className="empty-row">No inspections yet.</td></tr>}
                        {inspections.map(i => (
                            <tr key={i.id}>
                                <td>#{i.id}</td>
                                <td>{i.boat?.name}</td>
                                <td>{i.inspector?.name || '—'}</td>
                                <td>{i.inspectionDate}</td>
                                <td><span className={`status-pill ${i.voided ? 'status-refunded' : i.result === 'PASSED' ? 'status-verified' : 'status-failed'}`}>{i.voided ? 'VOIDED' : i.result}</span></td>
                                <td>{i.voided ? `Voided by ${i.voidedBy}: ${i.voidReason}` : (i.notes || '—')}</td>
                                <td className="actions-cell">
                                    <button className="btn-outline btn-danger" onClick={() => voidInspection(i.id)} disabled={i.voided}>Void</button>
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