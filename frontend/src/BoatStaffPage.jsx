import { useState, useEffect } from 'react';
import './AppStyles.css';

function BoatStaffPage() {
    const [boats, setBoats] = useState([]);
    const [staff, setStaff] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [boatName, setBoatName] = useState('');
    const [boatCapacity, setBoatCapacity] = useState('');
    const [editingBoatId, setEditingBoatId] = useState(null);

    const [staffName, setStaffName] = useState('');
    const [staffRole, setStaffRole] = useState('CAPTAIN');
    const [editingStaffId, setEditingStaffId] = useState(null);

    const [boatId, setBoatId] = useState('');
    const [captainId, setCaptainId] = useState('');
    const [guideId, setGuideId] = useState('');
    const [destination, setDestination] = useState('');
    const [tripDate, setTripDate] = useState('');

    const BASE = 'http://localhost:8080/api';

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = () => {
        fetch(`${BASE}/boats`).then(r => r.json()).then(setBoats);
        fetch(`${BASE}/staff`).then(r => r.json()).then(setStaff);
        fetch(`${BASE}/assignments`).then(r => r.json()).then(setAssignments);
    };

    const saveBoat = () => {
        if (!boatName || !boatCapacity) return alert('Fill in boat details');
        const method = editingBoatId ? 'PUT' : 'POST';
        const url = editingBoatId ? `${BASE}/boats/${editingBoatId}` : `${BASE}/boats`;
        fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
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
        fetch(`${BASE}/boats/${id}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); })
            .then(fetchAll)
            .catch(err => alert(err.message));
    };

    const saveStaff = () => {
        if (!staffName) return alert('Enter staff name');
        const method = editingStaffId ? 'PUT' : 'POST';
        const url = editingStaffId ? `${BASE}/staff/${editingStaffId}` : `${BASE}/staff`;
        fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: staffName, role: staffRole }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setStaffName(''); setEditingStaffId(null); fetchAll(); })
            .catch(err => alert(err.message));
    };

    const editStaff = (s) => {
        setEditingStaffId(s.id);
        setStaffName(s.name);
        setStaffRole(s.role);
    };

    const deleteStaff = (id) => {
        if (!window.confirm('Delete this staff member?')) return;
        fetch(`${BASE}/staff/${id}`, { method: 'DELETE' })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); })
            .then(fetchAll)
            .catch(err => alert(err.message));
    };

    const createAssignment = () => {
        if (!boatId || !captainId || !destination || !tripDate) return alert('Fill in all required fields');
        fetch(`${BASE}/assignments`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                boat: { id: boatId },
                captain: { id: captainId },
                guide: guideId ? { id: guideId } : null,
                tripDestination: destination,
                tripDate,
            }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => { setBoatId(''); setCaptainId(''); setGuideId(''); setDestination(''); setTripDate(''); fetchAll(); })
            .catch(err => alert(err.message));
    };

    const completeAssignment = (id) => fetch(`${BASE}/assignments/${id}/complete`, { method: 'PUT' }).then(fetchAll);
    const cancelAssignment = (id) => fetch(`${BASE}/assignments/${id}/cancel`, { method: 'PUT' }).then(fetchAll);

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
                        <input placeholder="Boat name" value={boatName} onChange={e => setBoatName(e.target.value)} />
                        <input type="number" placeholder="Capacity" value={boatCapacity} onChange={e => setBoatCapacity(e.target.value)} />
                        <button className="btn-primary" onClick={saveBoat}>{editingBoatId ? 'Save Changes' : 'Add Boat'}</button>
                        {editingBoatId && <button className="btn-text" onClick={() => { setEditingBoatId(null); setBoatName(''); setBoatCapacity(''); }}>Cancel</button>}
                    </div>
                </div>

                <div className="new-payment-card">
                    <h2>{editingStaffId ? 'Edit Staff' : 'Add Staff'}</h2>
                    <div className="new-payment-form">
                        <input placeholder="Staff name" value={staffName} onChange={e => setStaffName(e.target.value)} />
                        <select value={staffRole} onChange={e => setStaffRole(e.target.value)}>
                            <option value="CAPTAIN">Captain</option>
                            <option value="TOUR_GUIDE">Tour Guide</option>
                        </select>
                        <button className="btn-primary" onClick={saveStaff}>{editingStaffId ? 'Save Changes' : 'Add Staff'}</button>
                        {editingStaffId && <button className="btn-text" onClick={() => { setEditingStaffId(null); setStaffName(''); }}>Cancel</button>}
                    </div>
                </div>

                <div className="new-payment-card">
                    <h2>New Assignment</h2>
                    <div className="new-payment-form" style={{ flexWrap: 'wrap' }}>
                        <select value={boatId} onChange={e => setBoatId(e.target.value)}>
                            <option value="">Select boat</option>
                            {boats.filter(b => b.status === 'AVAILABLE').map(b => (
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
                            <option value="">Select guide (optional)</option>
                            {guides.filter(g => g.availability === 'AVAILABLE').map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <input placeholder="Trip destination" value={destination} onChange={e => setDestination(e.target.value)} />
                        <input type="date" value={tripDate} onChange={e => setTripDate(e.target.value)} />
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
                                <td>{a.tripDestination}</td>
                                <td>{a.tripDate}</td>
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
                        <thead><tr><th>Name</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                        {boats.map(b => (
                            <tr key={b.id}>
                                <td>{b.name}</td><td>{b.capacity}</td>
                                <td><span className={`status-pill ${b.status === 'AVAILABLE' ? 'status-verified' : 'status-pending'}`}>{b.status}</span></td>
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
                        <thead><tr><th>Name</th><th>Role</th><th>Availability</th><th>Actions</th></tr></thead>
                        <tbody>
                        {staff.map(s => (
                            <tr key={s.id}>
                                <td>{s.name}</td><td>{s.role}</td>
                                <td><span className={`status-pill ${s.availability === 'AVAILABLE' ? 'status-verified' : 'status-pending'}`}>{s.availability}</span></td>
                                <td className="actions-cell">
                                    <button className="btn-outline" onClick={() => editStaff(s)}>Edit</button>
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