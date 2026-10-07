import { useState, useEffect } from 'react';
import './AppStyles.css';

function authHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
}

function BoatStaffPage() {
    const [boats, setBoats] = useState([]);
    const [staff, setStaff] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [packages, setPackages] = useState([]);

    const [boatName, setBoatName] = useState('');
    const [boatCapacity, setBoatCapacity] = useState('');
    const [editingBoatId, setEditingBoatId] = useState(null);

    const [staffName, setStaffName] = useState('');
    const [staffRole, setStaffRole] = useState('CAPTAIN');
    const [staffPhone, setStaffPhone] = useState('');
    const [editingStaffId, setEditingStaffId] = useState(null);

    const [boatId, setBoatId] = useState('');
    const [captainId, setCaptainId] = useState('');
    const [guideId, setGuideId] = useState('');
    const [assignPackageId, setAssignPackageId] = useState('');

    const [complianceMap, setComplianceMap] = useState({});

    const BASE = 'http://localhost:8080/api';

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchCompliance = (boatList) => {
        boatList.forEach(b => {
            fetch(`${BASE}/inspections/boat/${b.id}/compliant`, { headers: authHeaders() })
                .then(r => r.json())
                .then(res => setComplianceMap(prev => ({ ...prev, [b.id]: res.compliant })));
        });
    };

    const fetchAll = () => {
        fetch(`${BASE}/boats`, { headers: authHeaders() }).then(r => r.json()).then(data => {
            setBoats(data);
            fetchCompliance(data);
        });
        fetch(`${BASE}/staff`, { headers: authHeaders() }).then(r => r.json()).then(setStaff);
        fetch(`${BASE}/assignments`, { headers: authHeaders() }).then(r => r.json()).then(setAssignments);
        fetch(`${BASE}/packages`, { headers: authHeaders() }).then(r => r.json()).then(setPackages);
    };

    const saveBoat = () => {
        if (!boatName || !boatCapacity) return alert('Fill in boat details');
        const method = editingBoatId ? 'PUT' : 'POST';
        const url = editingBoatId ? `${BASE}/boats/${editingBoatId}` : `${BASE}/boats`;
        fetch(url, {
            method, headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ name: boatName, capacity: Number(boatCapacity) }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setBoatName(''); setBoatCapacity(''); setEditingBoatId(null); fetchAll(); })
            .catch(err => alert(err.message));
    };

    const editBoat = (b) => {
        setEditingBoatId(b.id);
        setBoatName(b.name);
        setBoatCapacity(b.capacity);
    };

    const deleteBoat = (id) => {
        if (!window.confirm('Delete this boat?')) return;
        fetch(`${BASE}/boats/${id}`, { method: 'DELETE', headers: authHeaders() })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); })
            .then(fetchAll)
            .catch(err => alert(err.message));
    };

    const saveStaff = () => {
        if (!staffName || !staffPhone) return alert('Enter staff name and phone number');
        const method = editingStaffId ? 'PUT' : 'POST';
        const url = editingStaffId ? `${BASE}/staff/${editingStaffId}` : `${BASE}/staff`;
        fetch(url, {
            method, headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ name: staffName, role: staffRole, phone: staffPhone }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setStaffName(''); setStaffPhone(''); setEditingStaffId(null); fetchAll(); })
            .catch(err => alert(err.message));
    };

    const editStaff = (s) => {
        setEditingStaffId(s.id);
        setStaffName(s.name);
        setStaffRole(s.role);
        setStaffPhone(s.phone || '');
    };

    const deleteStaff = (id) => {
        if (!window.confirm('Delete this staff member?')) return;
        fetch(`${BASE}/staff/${id}`, { method: 'DELETE', headers: authHeaders() })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); })
            .then(fetchAll)
            .catch(err => alert(err.message));
    };

    const toggleOffDuty = (s) => {
        const endpoint = s.availability === 'OFF_DUTY' ? 'available' : 'off-duty';
        fetch(`${BASE}/staff/${s.id}/${endpoint}`, { method: 'PUT', headers: authHeaders() })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); })
            .then(fetchAll)
            .catch(err => alert(err.message));
    };

    const createAssignment = () => {
        if (!boatId || !captainId || !guideId || !assignPackageId) return alert('Fill in all required fields');
        fetch(`${BASE}/assignments`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({
                boat: { id: boatId },
                captain: { id: captainId },
                guide: { id: guideId },
                safariPackage: { id: assignPackageId },
            }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setBoatId(''); setCaptainId(''); setGuideId(''); setAssignPackageId(''); fetchAll(); })
            .catch(err => alert(err.message));
    };

    const completeAssignment = (id) => fetch(`${BASE}/assignments/${id}/complete`, { method: 'PUT', headers: authHeaders() }).then(fetchAll);
    const cancelAssignment = (id) => fetch(`${BASE}/assignments/${id}/cancel`, { method: 'PUT', headers: authHeaders() }).then(fetchAll);

    const captains = staff.filter(s => s.role === 'CAPTAIN');
    const guides = staff.filter(s => s.role === 'TOUR_GUIDE');

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Boat & Staff Management</h1>
                    <p>Manage boats, staff, and trip assignments</p>
                </header>

                <div className="new-payment-card">
                    <h2>{editingBoatId ? 'Edit Boat' : 'Add Boat'}</h2>
                    <div className="new-payment-form">
                        <input
                            placeholder="Boat name (letters only)"
                            value={boatName}
                            onChange={e => setBoatName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                        />
                        <input
                            type="number"
                            placeholder="Capacity"
                            value={boatCapacity}
                            min="1"
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || Number(val) > 0) setBoatCapacity(val);
                            }}
                        />
                        <button className="btn-primary" onClick={saveBoat}>{editingBoatId ? 'Save Changes' : 'Add Boat'}</button>
                        {editingBoatId && <button className="btn-text" onClick={() => { setEditingBoatId(null); setBoatName(''); setBoatCapacity(''); }}>Cancel</button>}
                    </div>
                </div>

                <div className="new-payment-card">
                    <h2>{editingStaffId ? 'Edit Staff' : 'Add Staff'}</h2>
                    <div className="new-payment-form">
                        <input
                            placeholder="Staff name (e.g. Nimal Perera)"
                            value={staffName}
                            onChange={e => {
                                const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                const formatted = lettersOnly.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                setStaffName(formatted);
                            }}
                        />
                        <select value={staffRole} onChange={e => setStaffRole(e.target.value)}>
                            <option value="CAPTAIN">Captain</option>
                            <option value="TOUR_GUIDE">Tour Guide</option>
                        </select>
                        <input
                            placeholder="Phone (e.g. 0771234567)"
                            value={staffPhone}
                            onChange={e => setStaffPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                        <button className="btn-primary" onClick={saveStaff}>{editingStaffId ? 'Save Changes' : 'Add Staff'}</button>
                        {editingStaffId && <button className="btn-text" onClick={() => { setEditingStaffId(null); setStaffName(''); setStaffPhone(''); }}>Cancel</button>}
                    </div>
                </div>

                <div className="new-payment-card">
                    <h2>New Assignment</h2>
                    <div className="new-payment-form" style={{ flexWrap: 'wrap' }}>
                        <select value={assignPackageId} onChange={e => setAssignPackageId(e.target.value)}>
                            <option value="">Select safari package</option>
                            {packages.filter(p => p.status === 'ACTIVE' && new Date(p.scheduleDate) >= new Date(new Date().setHours(0,0,0,0))).map(p => (
                                <option key={p.id} value={p.id}>{p.destination} — {p.scheduleDate}</option>
                            ))}
                        </select>
                        <select value={boatId} onChange={e => setBoatId(e.target.value)}>
                            <option value="">Select boat</option>
                            {boats.filter(b => b.status === 'AVAILABLE' && complianceMap[b.id] === true).map(b => (
                                <option key={b.id} value={b.id}>{b.name} ({b.capacity} seats)</option>
                            ))}
                        </select>
                        <select value={captainId} onChange={e => setCaptainId(e.target.value)}>
                            <option value="">Select captain</option>
                            {captains.filter(c => c.availability === 'AVAILABLE').map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <select value={guideId} onChange={e => setGuideId(e.target.value)}>
                            <option value="">Select guide</option>
                            {guides.filter(g => g.availability === 'AVAILABLE').map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <button className="btn-primary" onClick={createAssignment}>Create Assignment</button>
                    </div>
                </div>

                <div className="payments-table-card">
                    <h2 style={{ marginTop: 0 }}>Assignments</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th><th>Boat</th><th>Captain</th><th>Guide</th><th>Destination</th><th>Date</th><th>Status</th><th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {assignments.length === 0 && (
                            <tr><td colSpan="8" className="empty-row">No assignments yet.</td></tr>
                        )}
                        {assignments.map(a => (
                            <tr key={a.id}>
                                <td>#{a.id}</td>
                                <td>{a.boat?.name}</td>
                                <td>{a.captain?.name}</td>
                                <td>{a.guide?.name || '—'}</td>
                                <td>{a.safariPackage?.destination}</td>
                                <td>{a.safariPackage?.scheduleDate}</td>
                                <td><span className={`status-pill ${a.status === 'COMPLETED' ? 'status-verified' : a.status === 'CANCELLED' ? 'status-failed' : 'status-pending'}`}>{a.status}</span></td>
                                <td className="actions-cell">
                                    <button className="btn-outline" onClick={() => completeAssignment(a.id)} disabled={a.status !== 'SCHEDULED'}>Complete</button>
                                    <button className="btn-outline btn-danger" onClick={() => cancelAssignment(a.id)} disabled={a.status !== 'SCHEDULED'}>Cancel</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="payments-table-card">
                    <h2 style={{ marginTop: 0 }}>Boats</h2>
                    <table>
                        <thead><tr><th>Name</th><th>Capacity</th><th>Status</th><th>Compliance</th><th>Actions</th></tr></thead>
                        <tbody>
                        {boats.map(b => (
                            <tr key={b.id}>
                                <td>{b.name}</td><td>{b.capacity}</td>
                                <td><span className={`status-pill ${b.status === 'AVAILABLE' ? 'status-verified' : 'status-pending'}`}>{b.status}</span></td>
                                <td><span className={`status-pill ${complianceMap[b.id] ? 'status-verified' : 'status-failed'}`}>{complianceMap[b.id] === undefined ? 'Checking...' : complianceMap[b.id] ? 'Compliant' : 'Needs Inspection'}</span></td>
                                <td className="actions-cell">
                                    <button className="btn-outline" onClick={() => editBoat(b)}>Edit</button>
                                    <button className="btn-outline btn-danger" onClick={() => deleteBoat(b.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="payments-table-card">
                    <h2 style={{ marginTop: 0 }}>Staff</h2>
                    <table>
                        <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Availability</th><th>Actions</th></tr></thead>
                        <tbody>
                        {staff.map(s => (
                            <tr key={s.id}>
                                <td>{s.name}</td><td>{s.role}</td><td>{s.phone || '—'}</td>
                                <td><span className={`status-pill ${s.availability === 'AVAILABLE' ? 'status-verified' : s.availability === 'OFF_DUTY' ? 'status-refunded' : 'status-pending'}`}>{s.availability}</span></td>
                                <td className="actions-cell">
                                    <button className="btn-outline" onClick={() => editStaff(s)}>Edit</button>
                                    <button className="btn-outline" onClick={() => toggleOffDuty(s)} disabled={s.availability === 'ASSIGNED'}>
                                        {s.availability === 'OFF_DUTY' ? 'Set Available' : 'Set Off Duty'}
                                    </button>
                                    <button className="btn-outline btn-danger" onClick={() => deleteStaff(s.id)}>Delete</button>
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

export default BoatStaffPage;