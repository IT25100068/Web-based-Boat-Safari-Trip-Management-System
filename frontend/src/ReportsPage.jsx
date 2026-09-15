import { useState, useEffect } from 'react';
import './AppStyles.css';

function ReportsPage() {
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [bookingsSummary, setBookingsSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [type, setType] = useState('BOOKING_CONFIRMATION');
  const [message, setMessage] = useState('');

  const BASE = 'http://localhost:8080/api';

  useEffect(() => {
    fetchReports();
    fetchNotifications();
  }, []);

  const fetchReports = () => {
    fetch(`${BASE}/reports/payments-summary`).then(r => r.json()).then(setPaymentsSummary).catch(() => {});
    fetch(`${BASE}/reports/bookings-summary`).then(r => r.json()).then(setBookingsSummary).catch(() => {});
  };

  const fetchNotifications = () => {
    fetch(`${BASE}/notifications`).then(r => r.json()).then(setNotifications);
  };

  const sendNotification = () => {
    if (!recipientName || !message) return alert('Fill in all fields');
    fetch(`${BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientName, type, message }),
    })
      .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
      .then(() => { setRecipientName(''); setMessage(''); fetchNotifications(); })
      .catch(err => alert(err.message));
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
          ) : <p>Loading or unavailable — requires Payment module merged.</p>}
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
          ) : <p>Loading or unavailable — requires Booking module merged.</p>}
        </div>

        <div className="new-payment-card">
          <h2>Send Notification</h2>
          <div className="new-payment-form">
            <input placeholder="Recipient name" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
              <option value="PAYMENT_UPDATE">Payment Update</option>
              <option value="CANCELLATION">Cancellation</option>
              <option value="REMINDER">Reminder</option>
            </select>
            <input placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
            <button className="btn-primary" onClick={sendNotification}>Send</button>
          </div>
        </div>

        <div className="payments-table-card">
          <table>
            <thead><tr><th>ID</th><th>Recipient</th><th>Type</th><th>Message</th><th>Status</th></tr></thead>
            <tbody>
              {notifications.length === 0 && <tr><td colSpan="5" className="empty-row">No notifications yet.</td></tr>}
              {notifications.map(n => (
                <tr key={n.id}>
                  <td>#{n.id}</td><td>{n.recipientName}</td><td>{n.type}</td><td>{n.message}</td>
                  <td><span className="status-pill status-verified">{n.status}</span></td>
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