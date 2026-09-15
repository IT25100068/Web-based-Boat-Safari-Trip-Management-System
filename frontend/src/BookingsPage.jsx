import { useState, useEffect } from 'react';
import './AppStyles.css';

function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [packages, setPackages] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packageId, setPackageId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [tripDate, setTripDate] = useState('');
    const [seats, setSeats] = useState('');

    const BOOKINGS_URL = 'http://localhost:8080/api/bookings';
    const PACKAGES_URL = 'http://localhost:8080/api/packages';
    const USERS_URL = 'http://localhost:8080/api/users';


    const fetchBookings = () => {
        fetch(BOOKINGS_URL).then(res => res.json()).then(setBookings);
    };

    const fetchPackages = () => {
        fetch(PACKAGES_URL).then(res => res.json()).then(setPackages);
    };

    const fetchCustomers = () => {
        fetch(USERS_URL).then(res => res.json()).then(setCustomers);
    };
    useEffect(() => {
        fetchBookings();
        fetchPackages();
        fetchCustomers();
    }, []);

    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');

    const addCustomer = () => {
        if (!newCustomerName || !newCustomerEmail) return alert('Enter name and email');
        fetch('http://localhost:8080/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newCustomerName,
                email: newCustomerEmail,
                password: 'default123',
                role: 'CUSTOMER',
            }),
        }).then(() => {
            setNewCustomerName('');
            setNewCustomerEmail('');
            fetchCustomers();
        });
    };

    const createBooking = () => {
        if (!packageId || !tripDate || !seats || !customerId) {
            alert('Please fill in all fields');
            return;
        }
        fetch(BOOKINGS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                safariPackage: { id: packageId },
                customer: { id: customerId },
                tripDate,
                numberOfSeats: Number(seats),
            }),
        })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error); });
                return res.json();
            })
            .then(() => {
                setPackageId('');
                setCustomerId('');
                setTripDate('');
                setSeats('');
                fetchBookings();
                fetchPackages();
            })
            .catch(err => alert(err.message));
    };

    const confirmBooking = (id) => {
        fetch(`${BOOKINGS_URL}/${id}/confirm`, { method: 'PUT' })
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
        fetch(`${BOOKINGS_URL}/${id}/cancel`, { method: 'PUT' }).then(() => {
            fetchBookings();
            fetchPackages();
        });
    };

    const statusClass = (status) => {
        if (status === 'CONFIRMED') return 'status-verified';
        if (status === 'CANCELLED') return 'status-failed';
        return 'status-pending';
    };

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Booking Management</h1>
                    <p>Create, confirm, and manage boat safari trip bookings</p>
                </header>

                <div className="new-payment-card">
                    <h2>Add Customer</h2>
                    <div className="new-payment-form">
                        <input placeholder="Customer name" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
                        <input placeholder="Email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} />
                        <button className="btn-primary" onClick={addCustomer}>Add Customer</button>
                    </div>
                </div>

                <div className="new-payment-card">
                    <h2>New Booking</h2>
                    <div className="new-payment-form">
                        <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                            <option value="">Select customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <select value={packageId} onChange={e => setPackageId(e.target.value)}>
                            <option value="">Select safari package</option>
                            {packages.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.destination} — {p.availableSeats} seats left
                                </option>
                            ))}
                        </select>
                        <input type="date" value={tripDate} onChange={e => setTripDate(e.target.value)} />
                        <input type="number" placeholder="Seats" value={seats} onChange={e => setSeats(e.target.value)} />
                        <button className="btn-primary" onClick={createBooking}>Book Now</button>
                    </div>
                </div>

                <div className="payments-table-card">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th><th>Customer</th><th>Package</th><th>Trip Date</th><th>Seats</th><th>Status</th><th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.length === 0 && (
                            <tr><td colSpan="7" className="empty-row">No bookings yet.</td></tr>
                        )}
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td>#{b.id}</td>
                                <td>{b.customer?.name || '—'}</td>
                                <td>{b.safariPackage?.destination || '—'}</td>
                                <td>{b.tripDate}</td>
                                <td>{b.numberOfSeats}</td>
                                <td><span className={`status-pill ${statusClass(b.status)}`}>{b.status}</span></td>
                                <td className="actions-cell">
                                    <button className="btn-outline" onClick={() => confirmBooking(b.id)} disabled={b.status !== 'PENDING'}>Confirm</button>
                                    <button className="btn-outline btn-danger" onClick={() => cancelBooking(b.id)} disabled={b.status === 'CANCELLED'}>Cancel</button>
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