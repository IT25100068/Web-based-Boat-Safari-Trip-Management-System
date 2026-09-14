import { useState, useEffect } from 'react';
import './AppStyles.css';

function PackagesPage() {
    const [packages, setPackages] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        destination: '', description: '', price: '', totalSeats: '', scheduleDate: '', scheduleTime: ''
    });

    const API_URL = 'http://localhost:8080/api/packages';

    const fetchPackages = () => {
        fetch(API_URL).then(res => res.json()).then(setPackages);
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const resetForm = () => {
        setForm({ destination: '', description: '', price: '', totalSeats: '', scheduleDate: '', scheduleTime: '' });
        setEditingId(null);
    };

    const savePackage = () => {
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_URL}/${editingId}` : API_URL;

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error); });
                return res.json();
            })
            .then(() => {
                resetForm();
                fetchPackages();
            })
            .catch(err => alert(err.message));
    };

    const editPackage = (pkg) => {
        setEditingId(pkg.id);
        setForm({
            destination: pkg.destination,
            description: pkg.description || '',
            price: pkg.price,
            totalSeats: pkg.totalSeats,
            scheduleDate: pkg.scheduleDate,
            scheduleTime: pkg.scheduleTime || '',
        });
    };

    const toggleStatus = (id) => {
        fetch(`${API_URL}/${id}/toggle-status`, { method: 'PUT' }).then(fetchPackages);
    };

    const deletePackage = (id) => {
        if (!window.confirm('Delete this package? This cannot be undone.')) return;
        fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(fetchPackages);
    };

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Safari Trip Management</h1>
                    <p>Create and manage safari packages, schedules, and pricing</p>
                </header>

                <div className="new-payment-card">
                    <h2>{editingId ? 'Edit Package' : 'New Package'}</h2>
                    <div className="new-payment-form" style={{ flexWrap: 'wrap' }}>
                        <input placeholder="Destination" value={form.destination}
                               onChange={e => setForm({ ...form, destination: e.target.value })} />
                        <input placeholder="Description" value={form.description}
                               onChange={e => setForm({ ...form, description: e.target.value })} />
                        <input type="number" placeholder="Price (LKR)" value={form.price}
                               onChange={e => setForm({ ...form, price: e.target.value })} />
                        <input type="number" placeholder="Total seats" value={form.totalSeats}
                               onChange={e => setForm({ ...form, totalSeats: e.target.value })} />
                        <input type="date" value={form.scheduleDate}
                               onChange={e => setForm({ ...form, scheduleDate: e.target.value })} />
                        <input type="time" value={form.scheduleTime}
                               onChange={e => setForm({ ...form, scheduleTime: e.target.value })} />
                        <button className="btn-primary" onClick={savePackage}>
                            {editingId ? 'Save Changes' : 'Create Package'}
                        </button>
                        {editingId && <button className="btn-text" onClick={resetForm}>Cancel</button>}
                    </div>
                </div>

                <div className="payments-table-card">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th><th>Destination</th><th>Price</th><th>Seats</th><th>Schedule</th><th>Status</th><th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {packages.length === 0 && (
                            <tr><td colSpan="7" className="empty-row">No packages yet.</td></tr>
                        )}
                        {packages.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td>{p.destination}</td>
                                <td>LKR {Number(p.price).toLocaleString()}</td>
                                <td>{p.availableSeats} / {p.totalSeats}</td>
                                <td>{p.scheduleDate} {p.scheduleTime}</td>
                                <td>
                    <span className={`status-pill ${p.status === 'ACTIVE' ? 'status-verified' : 'status-failed'}`}>
                      {p.status}
                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="btn-outline" onClick={() => editPackage(p)}>Edit</button>
                                    <button className="btn-outline" onClick={() => toggleStatus(p.id)}>
                                        {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="btn-outline btn-danger" onClick={() => deletePackage(p.id)}>Delete</button>
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

export default PackagesPage;