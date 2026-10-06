import { useState, useEffect } from 'react';
import './AppStyles.css';

function BrowsePackagesPage({ onBookPackage }) {
    const [packages, setPackages] = useState([]);
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:8080/api/packages', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setPackages(data.filter(p => p.status === 'ACTIVE' && new Date(p.scheduleDate) >= new Date().setHours(0,0,0,0))));
    }, []);

    const filteredPackages = packages.filter(p => {
        const matchesSearch = p.destination.toLowerCase().includes(search.toLowerCase());
        const matchesDate = !dateFilter || p.scheduleDate === dateFilter;
        return matchesSearch && matchesDate;
    });

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Browse Safari Packages</h1>
                    <p>Explore our available boat safari trips and find your next adventure</p>
                </header>

                <div className="new-payment-card">
                    <div className="new-payment-form">
                        <input
                            placeholder="Search by destination..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                        />
                        {(search || dateFilter) && (
                            <button className="btn-text" onClick={() => { setSearch(''); setDateFilter(''); }}>
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="package-grid">
                    {filteredPackages.length === 0 && (
                        <div className="empty-state">
                            {packages.length === 0
                                ? 'No packages available right now — check back soon.'
                                : 'No trips match your search.'}
                        </div>
                    )}
                    {filteredPackages.map(p => (
                        <div key={p.id} className="package-card">
                            <div className="package-card-header">
                                <h3>{p.destination}</h3>
                                <span className="package-price">LKR {Number(p.price).toLocaleString()}</span>
                            </div>
                            <p className="package-description">{p.description}</p>
                            <div className="package-meta">
                                <span>📅 {p.scheduleDate} {p.scheduleTime && `· ${p.scheduleTime}`}</span>
                                <span>🪑 {p.availableSeats} seats left</span>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', marginTop: '14px' }} onClick={() => onBookPackage(p.id)}>
                                Book This Trip
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BrowsePackagesPage;