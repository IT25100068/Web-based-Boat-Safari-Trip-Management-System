import { useState, useEffect } from 'react';
import './AppStyles.css';

function authHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
}

function BookingsPage({ user, preselectedPackageId, onPreselectHandled, onPayNow }) {
    const [bookings, setBookings] = useState([]);
    const [packages, setPackages] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packageId, setPackageId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [tripDate, setTripDate] = useState('');
    const [seats, setSeats] = useState('');
    const [editingBookingId, setEditingBookingId] = useState(null);
    const [editSeats, setEditSeats] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const BOOKINGS_URL = 'http://localhost:8080/api/bookings';
    const PACKAGES_URL = 'http://localhost:8080/api/packages';
    const USERS_URL = 'http://localhost:8080/api/users';

    const fetchBookings = () => {
        const url = user.role === 'CUSTOMER'
            ? `${BOOKINGS_URL}/customer/${user.id}`
            : BOOKINGS_URL;
        fetch(url, { headers: authHeaders() }).then(res => res.json()).then(setBookings);
    };

    const fetchPackages = () => {
        fetch(PACKAGES_URL, { headers: authHeaders() }).then(res => res.json()).then(setPackages);
    };

    const fetchCustomers = () => {
        fetch(`${USERS_URL}?role=CUSTOMER`, { headers: authHeaders() })
            .then(res => res.json()).then(setCustomers);
    };

    useEffect(() => {
        fetchBookings();
        fetchPackages();
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (preselectedPackageId && packages.length > 0) {
            const pkg = packages.find(p => p.id === Number(preselectedPackageId));
            if (pkg) {
                setPackageId(String(pkg.id));
                setTripDate(pkg.scheduleDate);
            }
            onPreselectHandled();
        }
    }, [preselectedPackageId, packages]);

    const createBooking = () => {
        const customerIdToUse = user.role === 'CUSTOMER' ? user.id : customerId;
        if (!packageId || !tripDate || !seats || !customerIdToUse) {
            alert('Please fill in all fields');
            return;
        }
        const seatsNum = Number(seats);
        if (seatsNum <= 0) {
            alert('Number of seats must be greater than zero');
            return;
        }
        const selectedPkg = packages.find(p => p.id === Number(packageId));
        if (selectedPkg && seatsNum > selectedPkg.availableSeats) {
            alert(`Only ${selectedPkg.availableSeats} seats are available for this package`);
            return;
        }
        fetch(BOOKINGS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({
                safariPackage: { id: packageId },
                customer: { id: customerIdToUse },
                tripDate,
                numberOfSeats: Number(seats),
            }),
        })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error); });
                return res.json();
            })
            .then(() => {
                setPackageId(''); setCustomerId(''); setTripDate(''); setSeats('');
                fetchBookings();
                fetchPackages();
            })
            .catch(err => alert(err.message));
    };

    const startEditBooking = (booking) => {
        setEditingBookingId(booking.id);
        setEditSeats(booking.numberOfSeats);
    };

    const saveEditBooking = (booking) => {
        const seatsNum = Number(editSeats);
        if (seatsNum <= 0) {
            alert('Number of seats must be greater than zero');
            return;
        }
        fetch(`${BOOKINGS_URL}/${booking.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ numberOfSeats: seatsNum }),
        })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error); });
                return res.json();
            })
            .then(() => {
                setEditingBookingId(null);
                fetchBookings();
                fetchPackages();
            })
            .catch(err => alert(err.message));
    };

    const confirmBooking = (id) => {
        fetch(`${BOOKINGS_URL}/${id}/confirm`, { method: 'PUT', headers: authHeaders() })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error); });
                return res.json();
            })
            .then(() => {
                fetchBookings();
                fetchPackages();
            })
            .catch(err => alert(err.message));
    };

    const cancelBooking = (id) => {
        fetch(`${BOOKINGS_URL}/${id}/cancel`, { method: 'PUT', headers: authHeaders() }).then(() => {
            fetchBookings();
            fetchPackages();
        });
    };

    const statusClass = (status) => {
        if (status === 'CONFIRMED') return 'status-verified';
        if (status === 'CANCELLED') return 'status-failed';
        return 'status-pending';
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            (b.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.safariPackage?.destination || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.customer?.nicNumber || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Booking Management</h1>
                    <p>Create, confirm, and manage boat safari trip bookings</p>
                </header>

                <div className="new-payment-card">
                    <h2>New Booking</h2>
                    <div className="new-payment-form">
                        {user.role !== 'CUSTOMER' && (
                            <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                                <option value="">Select customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={packageId}
                            onChange={e => {
                                const selectedId = e.target.value;
                                setPackageId(selectedId);
                                const pkg = packages.find(p => p.id === Number(selectedId));
                                if (pkg) setTripDate(pkg.scheduleDate);
                            }}
                        >
                            <option value="">Select safari package</option>
                            {packages.filter(p => p.status === 'ACTIVE' && new Date(p.scheduleDate) >= new Date(new Date().setHours(0,0,0,0))).map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.destination} — {p.scheduleDate} — {p.availableSeats} seats left
                                </option>
                            ))}
                        </select>
                        <input type="date" value={tripDate} readOnly disabled placeholder="Trip date (auto-filled)" />
                        <input
                            type="number"
                            placeholder="Seats"
                            value={seats}
                            min="1"
                            max={packages.find(p => p.id === Number(packageId))?.availableSeats || undefined}
                            onChange={e => setSeats(e.target.value)}
                        />
                        <button className="btn-primary" onClick={createBooking}>Book Now</button>
                    </div>
                </div>

                {user.role !== 'CUSTOMER' && (
                    <div className="new-payment-card">
                        <div className="new-payment-form">
                            <input
                                placeholder="Search by customer, NIC, or destination..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="">All statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            {(search || statusFilter) && (
                                <button className="btn-text" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear filters</button>
                            )}
                        </div>
                    </div>
                )}

                <div className="payments-table-card">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th><th>Customer</th><th>Package</th><th>Trip Date</th><th>Seats</th><th>Status</th><th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredBookings.length === 0 && (
                            <tr><td colSpan="7" className="empty-row">
                                {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your search.'}
                            </td></tr>
                        )}
                        {filteredBookings.map(b => (
                            <tr key={b.id}>
                                <td>#{b.id}</td>
                                <td>{b.customer?.name || '—'}</td>
                                <td>{b.safariPackage?.destination || '—'}</td>
                                <td>{b.tripDate}</td>
                                <td>
                                    {editingBookingId === b.id ? (
                                        <input
                                            type="number"
                                            min="1"
                                            max={b.safariPackage?.availableSeats + b.numberOfSeats}
                                            value={editSeats}
                                            onChange={e => setEditSeats(e.target.value)}
                                            style={{ width: '70px', padding: '6px 8px' }}
                                        />
                                    ) : (
                                        b.numberOfSeats
                                    )}
                                </td>
                                <td><span className={`status-pill ${statusClass(b.status)}`}>{b.status}</span></td>
                                <td className="actions-cell">
                                    {user.role !== 'CUSTOMER' && (
                                        <button className="btn-outline" onClick={() => confirmBooking(b.id)} disabled={b.status !== 'PENDING'}>Confirm</button>
                                    )}
                                    {editingBookingId === b.id ? (
                                        <>
                                            <button className="btn-outline" onClick={() => saveEditBooking(b)}>Save</button>
                                            <button className="btn-text" onClick={() => setEditingBookingId(null)}>Cancel Edit</button>
                                        </>
                                    ) : (
                                        <button
                                            className="btn-outline"
                                            onClick={() => startEditBooking(b)}
                                            disabled={b.status !== 'PENDING' || (user.role === 'STAFF' && b.createdBy === 'CUSTOMER')}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    <button className="btn-outline btn-danger" onClick={() => cancelBooking(b.id)} disabled={b.status === 'CANCELLED' || b.status === 'COMPLETED'}>Cancel</button>
                                    {user.role === 'CUSTOMER' && b.status === 'PENDING' && (
                                        <button className="btn-primary" onClick={() => onPayNow(b.id)}>Pay Now</button>
                                    )}
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

export default BookingsPage;