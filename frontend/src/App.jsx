import { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import PackagesPage from './PackagesPage';
import BookingsPage from './BookingsPage';
import PaymentsPage from './PaymentsPage';
import ReportsPage from './ReportsPage';
import SafetyPage from './SafetyPage';
import BoatStaffPage from './BoatStaffPage';
import './AppStyles.css';
import DashboardPage from './DashboardPage';
import BrowsePackagesPage from './BrowsePackagesPage';
import FeedbackPage from './FeedbackPage';
import NotificationsPage from './NotificationsPage';

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard');
    const [checkedStorage, setCheckedStorage] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [preselectedPackageId, setPreselectedPackageId] = useState(null);
    const [preselectedBookingId, setPreselectedBookingId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
        }
        setCheckedStorage(true);
    }, []);

    useEffect(() => {
        const closeDropdown = (e) => {
            if (!e.target.closest('.profile-menu')) setProfileOpen(false);
        };
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    useEffect(() => {
        if (user && user.role === 'CUSTOMER') {
            const token = localStorage.getItem('token');
            fetch(`http://localhost:8080/api/notifications?recipientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setUnreadCount(data.filter(n => !n.isRead).length));
        }
    }, [user, view]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const decrementUnreadCount = () => {
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    if (!checkedStorage) return null; // avoid flashing login screen before checking storage

    if (!user) {
        return <LoginPage onLogin={(u) => { setUser(u); setView('dashboard'); }} />;
    }

    const isStaff = user.role !== 'CUSTOMER';

    return (
        <div className="app-shell">
            <nav className="top-nav">
                <div className="nav-brand-mini">
                    <span className="nav-brand-icon">⚓</span>
                    <span className="nav-brand-label">Boat Safari</span>
                </div>

                <div className="nav-links">
                    <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
                    {isStaff && (
                        <button className={`nav-link ${view === 'packages' ? 'active' : ''}`} onClick={() => setView('packages')}>
                            Safari Packages
                        </button>
                    )}
                    {!isStaff && (
                        <button className={`nav-link ${view === 'browse' ? 'active' : ''}`} onClick={() => setView('browse')}>
                            Browse Trips
                        </button>
                    )}
                    <button className={`nav-link ${view === 'bookings' ? 'active' : ''}`} onClick={() => setView('bookings')}>
                        Bookings
                    </button>
                    <button className={`nav-link ${view === 'payments' ? 'active' : ''}`} onClick={() => setView('payments')}>
                        Payments
                    </button>
                    {isStaff && (
                        <button className={`nav-link ${view === 'reports' ? 'active' : ''}`} onClick={() => setView('reports')}>
                            Reports
                        </button>
                    )}
                    {isStaff && (
                        <button className={`nav-link ${view === 'safety' ? 'active' : ''}`} onClick={() => setView('safety')}>
                            Safety
                        </button>
                    )}
                    {isStaff && (
                        <button className={`nav-link ${view === 'boatstaff' ? 'active' : ''}`} onClick={() => setView('boatstaff')}>
                            Boats & Staff
                        </button>
                    )}
                    <button className={`nav-link ${view === 'feedback' ? 'active' : ''}`} onClick={() => setView('feedback')}>Feedback</button>
                    {!isStaff && (
                        <button className={`nav-link ${view === 'notifications' ? 'active' : ''}`} onClick={() => setView('notifications')}>
                            Notifications
                            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                        </button>
                    )}
                </div>

                <div className="profile-menu" onClick={() => setProfileOpen(!profileOpen)}>
                    <div className="profile-chip">
                        <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <div className="profile-text">
                            <span className="profile-name">{user.name}</span>
                            <span className="profile-role">{user.role === 'STAFF' ? 'Staff' : 'Customer'}</span>
                        </div>
                        <svg className={`profile-chevron ${profileOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    {profileOpen && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-header">
                                <div className="profile-avatar large">{user.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div className="profile-dropdown-name">{user.name}</div>
                                    <div className="profile-dropdown-email">{user.email}</div>
                                </div>
                            </div>
                            <button className="profile-dropdown-item logout" onClick={handleLogout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <main>
                {view === 'dashboard' && <DashboardPage user={user} />}
                {view === 'packages' && isStaff && <PackagesPage />}
                {view === 'browse' && !isStaff && (
                    <BrowsePackagesPage onBookPackage={(id) => { setPreselectedPackageId(id); setView('bookings'); }} />
                )}
                {view === 'bookings' && (
                    <BookingsPage
                        user={user}
                        preselectedPackageId={preselectedPackageId}
                        onPreselectHandled={() => setPreselectedPackageId(null)}
                        onPayNow={(bookingId) => { setPreselectedBookingId(bookingId); setView('payments'); }}
                    />
                )}
                {view === 'payments' && (
                    <PaymentsPage
                        user={user}
                        preselectedBookingId={preselectedBookingId}
                        onPreselectHandled={() => setPreselectedBookingId(null)}
                    />
                )}
                {view === 'reports' && isStaff && <ReportsPage />}
                {view === 'safety' && isStaff && <SafetyPage />}
                {view === 'boatstaff' && isStaff && <BoatStaffPage />}
                {view === 'feedback' && <FeedbackPage user={user} />}
                {view === 'notifications' && !isStaff && (
                    <NotificationsPage user={user} onNotificationRead={decrementUnreadCount} />
                )}
            </main>
        </div>
    );
}

export default App;