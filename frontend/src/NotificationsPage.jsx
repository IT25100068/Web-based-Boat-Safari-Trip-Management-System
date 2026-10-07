import { useState, useEffect } from 'react';
import './AppStyles.css';

function authHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
}

const typeIcons = {
    BOOKING_CONFIRMATION: '✅',
    PAYMENT_UPDATE: '💳',
    CANCELLATION: '❌',
    REMINDER: '🔔',
};

const typeLabels = {
    BOOKING_CONFIRMATION: 'Booking Confirmation',
    PAYMENT_UPDATE: 'Payment Update',
    CANCELLATION: 'Cancellation',
    REMINDER: 'Reminder',
};

function NotificationsPage({ user, onNotificationRead }) {
    const [notifications, setNotifications] = useState([]);
    const [openNotification, setOpenNotification] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8080/api/notifications?recipientId=${user.id}`, { headers: authHeaders() })
            .then(res => res.json())
            .then(data => {
                const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(sorted);
            });
    }, []);

    const markAsRead = (id) => {
        fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: 'PUT', headers: authHeaders() })
            .then(() => {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                onNotificationRead();
            });


    };

    const openNotificationDetail = (n) => {
        setOpenNotification(n);
        if (!n.isRead) {
            fetch(`http://localhost:8080/api/notifications/${n.id}/read`, { method: 'PUT', headers: authHeaders() })
                .then(() => {
                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                    onNotificationRead();
                });
        }
    };

    const closeNotificationDetail = () => {
        setOpenNotification(null);
    };

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Notifications</h1>
                    <p>Updates about your bookings and payments</p>
                </header>

                <div className="notification-list">
                    {notifications.length === 0 && (
                        <div className="empty-state">No notifications yet.</div>
                    )}
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={`notification-card ${!n.isRead ? 'unread' : ''}`}
                            onClick={() => openNotificationDetail(n)}
                        >
                            {!n.isRead && <div className="unread-dot"></div>}
                            <div className="notification-icon">{typeIcons[n.type] || '🔔'}</div>
                            <div className="notification-body">
                                <div className="notification-header-row">
                                    <span className="notification-type">{typeLabels[n.type] || n.type}</span>
                                    <span className="notification-date">
                                    {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                                </div>
                                <p className="notification-message">{n.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {openNotification && (
                <div className="modal-overlay" onClick={closeNotificationDetail}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="notification-detail-icon">{typeIcons[openNotification.type] || '🔔'}</div>
                        <h3>{typeLabels[openNotification.type] || openNotification.type}</h3>
                        <p className="modal-hint">
                            {new Date(openNotification.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="notification-detail-message">{openNotification.message}</p>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={closeNotificationDetail}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationsPage;