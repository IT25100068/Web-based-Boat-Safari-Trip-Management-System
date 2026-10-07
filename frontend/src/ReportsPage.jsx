import { useState, useEffect } from 'react';
import './AppStyles.css';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

const typeLabels = {
  BOOKING_CONFIRMATION: 'Booking Confirmation',
  PAYMENT_UPDATE: 'Payment Update',
  CANCELLATION: 'Cancellation',
  REMINDER: 'Reminder',
};

function ReportsPage() {
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [bookingsSummary, setBookingsSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [customers, setCustomers] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [customerBookings, setCustomerBookings] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [customersWithBookings, setCustomersWithBookings] = useState(new Set());

  const BASE = 'http://localhost:8080/api';

  useEffect(() => {
    fetchReports();
    fetchNotifications();
    fetchCustomers();
    fetchCustomersWithBookings();
  }, []);

  useEffect(() => {
    if (!recipientId) {
      setCustomerBookings([]);
      setCustomerPayments([]);
      return;
    }
    fetch(`${BASE}/bookings/customer/${recipientId}`, { headers: authHeaders() })
        .then(r => r.json()).then(setCustomerBookings);
    fetch(`${BASE}/payments?customerId=${recipientId}`, { headers: authHeaders() })
        .then(r => r.json()).then(setCustomerPayments);
  }, [recipientId]);

  const fetchReports = () => {
    fetch(`${BASE}/reports/payments-summary`, { headers: authHeaders() }).then(r => r.json()).then(setPaymentsSummary).catch(() => {});
    fetch(`${BASE}/reports/bookings-summary`, { headers: authHeaders() }).then(r => r.json()).then(setBookingsSummary).catch(() => {});
  };

  const fetchNotifications = () => {
    fetch(`${BASE}/notifications`, { headers: authHeaders() }).then(r => r.json()).then(setNotifications);
  };

  const fetchCustomers = () => {
    fetch(`${BASE}/users?role=CUSTOMER`, { headers: authHeaders() })
        .then(r => r.json()).then(setCustomers);
  };

  const fetchCustomersWithBookings = () => {
    fetch(`${BASE}/bookings`, { headers: authHeaders() })
        .then(r => r.json())
        .then(allBookings => {
          const ids = new Set(allBookings.map(b => b.customer?.id).filter(Boolean));
          setCustomersWithBookings(ids);
        });
  };

  const getRelevantTypes = () => {
    const types = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasUpcomingConfirmedOrPending = customerBookings.some(b => {
      if (b.status !== 'PENDING' && b.status !== 'CONFIRMED') return false;
      if (!b.tripDate) return false;
      const tripDate = new Date(b.tripDate);
      return tripDate >= today;
    });

    if (customerBookings.some(b => b.status === 'PENDING')) {
      if (hasUpcomingConfirmedOrPending) types.add('REMINDER');
    }
    if (customerBookings.some(b => b.status === 'CONFIRMED')) {
      types.add('BOOKING_CONFIRMATION');
      if (hasUpcomingConfirmedOrPending) types.add('REMINDER');
    }
    if (customerBookings.some(b => b.status === 'CANCELLED')) types.add('CANCELLATION');
    if (customerPayments.some(p => p.status === 'PENDING')) types.add('PAYMENT_UPDATE');

    if (types.size === 0) types.add('REMINDER');

    return Array.from(types);
  };

  const relevantTypes = getRelevantTypes();

  const sendNotification = () => {
    if (!recipientId || !type || !message) return alert('Please select a recipient, message type, and enter a message');
    fetch(`${BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ recipient: { id: recipientId }, type, message }),
    })
        .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
        .then(() => { setRecipientId(''); setType(''); setMessage(''); fetchNotifications(); })
        .catch(err => alert(err.message));
  };

  const startEditNotification = (n) => {
    setEditingNotificationId(n.id);
    setEditMessage(n.message);
  };

  const saveEditNotification = (n) => {
    fetch(`${BASE}/notifications/${n.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ type: n.type, message: editMessage }),
    })
        .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
        .then(() => { setEditingNotificationId(null); fetchNotifications(); })
        .catch(err => alert(err.message));
  };

  const deleteNotification = (id) => {
    if (!window.confirm('Delete this notification?')) return;
    fetch(`${BASE}/notifications/${id}`, { method: 'DELETE', headers: authHeaders() }).then(fetchNotifications);
  };

  return (
      <div className="payments-page">
        <div className="payments-container">
          <header className="payments-header">
            <h1>Reports & Notifications</h1>
            <p>Booking and payment summaries, and customer notifications</p>
          </header>

          <div className="payments-table-card">
            <h2 style={{ marginTop: 0 }}>Payments Summary</h2>
            {paymentsSummary ? (
                <div className="new-payment-form" style={{ flexWrap: 'wrap' }}>
                  <div>Total Revenue: <strong>LKR {Number(paymentsSummary.totalRevenue).toLocaleString()}</strong></div>
                  <div>Verified: <strong>{paymentsSummary.verifiedCount}</strong></div>
                  <div>Pending: <strong>{paymentsSummary.pendingCount}</strong></div>
                  <div>Refunded: <strong>{paymentsSummary.refundedCount}</strong></div>
                  <div>Failed: <strong>{paymentsSummary.failedCount}</strong></div>
                </div>
            ) : <p>Loading...</p>}
          </div>

          <div className="payments-table-card">
            <h2 style={{ marginTop: 0 }}>Bookings Summary</h2>
            {bookingsSummary ? (
                <div className="new-payment-form" style={{ flexWrap: 'wrap' }}>
                  <div>Total Bookings: <strong>{bookingsSummary.totalBookings}</strong></div>
                  <div>Confirmed: <strong>{bookingsSummary.confirmedCount}</strong></div>
                  <div>Pending: <strong>{bookingsSummary.pendingCount}</strong></div>
                  <div>Cancelled: <strong>{bookingsSummary.cancelledCount}</strong></div>
                </div>
            ) : <p>Loading...</p>}
          </div>

          <div className="new-payment-card">
            <h2>Send Notification</h2>
            <div className="new-payment-form">
              <select value={recipientId} onChange={e => { setRecipientId(e.target.value); setType(''); }}>
                <option value="">Select customer</option>
                {customers.filter(c => customersWithBookings.has(c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
              <select value={type} onChange={e => setType(e.target.value)} disabled={!recipientId}>
                <option value="">{recipientId ? 'Select message type' : 'Select a customer first'}</option>
                {relevantTypes.map(t => (
                    <option key={t} value={t}>{typeLabels[t]}</option>
                ))}
              </select>
              <input placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
              <button className="btn-primary" onClick={sendNotification}>Send</button>
            </div>
          </div>

          <div className="payments-table-card">
            <table>
              <thead><tr><th>ID</th><th>Recipient</th><th>Phone</th><th>Type</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
              {notifications.length === 0 && <tr><td colSpan="7" className="empty-row">No notifications yet.</td></tr>}
              {notifications.map(n => (
                  <tr key={n.id}>
                    <td>#{n.id}</td>
                    <td>{n.recipient?.name || '—'}</td>
                    <td>{n.recipient?.phone || '—'}</td>
                    <td>{n.type}</td>
                    <td>{editingNotificationId === n.id ? (
                        <input value={editMessage} onChange={e => setEditMessage(e.target.value)} style={{ width: '200px', padding: '6px 8px' }} />
                    ) : n.message}</td>
                    <td><span className="status-pill status-verified">{n.status}</span></td>
                    <td className="actions-cell">
                      {editingNotificationId === n.id ? (
                          <>
                            <button className="btn-outline" onClick={() => saveEditNotification(n)}>Save</button>
                            <button className="btn-text" onClick={() => setEditingNotificationId(null)}>Cancel</button>
                          </>
                      ) : (
                          <button className="btn-outline" onClick={() => startEditNotification(n)}>Edit</button>
                      )}
                      <button className="btn-outline btn-danger" onClick={() => deleteNotification(n.id)}>Delete</button>
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

export default ReportsPage;