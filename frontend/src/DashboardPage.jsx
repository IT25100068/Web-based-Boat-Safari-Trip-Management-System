import { useState, useEffect } from 'react';
import './AppStyles.css';

function DashboardPage({ user }) {
    const [data, setData] = useState(null);
    const isStaff = user.role !== 'CUSTOMER';

    useEffect(() => {
        const token = localStorage.getItem('token');
        const url = isStaff
            ? 'http://localhost:8080/api/dashboard/staff'
            : `http://localhost:8080/api/dashboard/customer/${user.id}`;
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(setData);
    }, []);

    if (!data) return <div className="payments-page"><div className="payments-container">Loading dashboard…</div></div>;

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Welcome back, {user.name.split(' ')[0]}</h1>
                    <p>{isStaff ? "Here's what's happening across the system today." : "Here's a summary of your safari trips and payments."}</p>
                </header>

                {!isStaff && (
                    <>
                        <div className="stat-grid">
                            <div className="stat-card">
                                <div className="stat-icon">🗓️</div>
                                <div className="stat-value">{data.totalBookings}</div>
                                <div className="stat-label">Total Bookings</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⛵</div>
                                <div className="stat-value">{data.upcomingTrips}</div>
                                <div className="stat-label">Upcoming Trips</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💳</div>
                                <div className="stat-value">LKR {Number(data.totalSpent).toLocaleString()}</div>
                                <div className="stat-label">Total Spent</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🧾</div>
                                <div className="stat-value">{data.totalPayments}</div>
                                <div className="stat-label">Payments Made</div>
                            </div>
                        </div>

                        <div className="payments-table-card">
                            <h2 style={{ marginTop: 0 }}>Recent Bookings</h2>
                            <table>
                                <thead><tr><th>ID</th><th>Destination</th><th>Trip Date</th><th>Status</th></tr></thead>
                                <tbody>
                                {data.recentBookings.length === 0 && (
                                    <tr><td colSpan="4" className="empty-row">No bookings yet — head to Safari Packages to get started.</td></tr>
                                )}
                                {data.recentBookings.map(b => (
                                    <tr key={b.id}>
                                        <td>#{b.id}</td>
                                        <td>{b.destination}</td>
                                        <td>{b.tripDate || '—'}</td>
                                        <td><span className={`status-pill ${b.status === 'CONFIRMED' ? 'status-verified' : b.status === 'CANCELLED' ? 'status-failed' : 'status-pending'}`}>{b.status}</span></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {isStaff && (
                    <>
                        <div className="stat-grid">
                            <div className="stat-card">
                                <div className="stat-icon">🗓️</div>
                                <div className="stat-value">{data.totalBookings}</div>
                                <div className="stat-label">Total Bookings</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-value">{data.pendingBookings}</div>
                                <div className="stat-label">Pending Bookings</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-value">LKR {Number(data.totalRevenue).toLocaleString()}</div>
                                <div className="stat-label">Total Revenue</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⚠️</div>
                                <div className="stat-value">{data.pendingPayments}</div>
                                <div className="stat-label">Pending Payments</div>
                            </div>
                        </div>

                        <div className="payments-table-card">
                            <h2 style={{ marginTop: 0 }}>Recent Bookings — All Customers</h2>
                            <table>
                                <thead><tr><th>ID</th><th>Customer</th><th>Destination</th><th>Status</th></tr></thead>
                                <tbody>
                                {data.recentBookings.length === 0 && (
                                    <tr><td colSpan="4" className="empty-row">No bookings yet.</td></tr>
                                )}
                                {data.recentBookings.map(b => (
                                    <tr key={b.id}>
                                        <td>#{b.id}</td>
                                        <td>{b.customer}</td>
                                        <td>{b.destination}</td>
                                        <td><span className={`status-pill ${b.status === 'CONFIRMED' ? 'status-verified' : b.status === 'CANCELLED' ? 'status-failed' : 'status-pending'}`}>{b.status}</span></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;