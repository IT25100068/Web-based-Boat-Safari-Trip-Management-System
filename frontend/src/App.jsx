import { useState } from 'react';
import PackagesPage from './PackagesPage';
import BookingsPage from './BookingsPage';
import PaymentsPage from './PaymentsPage';
import ReportsPage from './ReportsPage';
import BoatStaffPage from './BoatStaffPage';
import './AppStyles.css';

function App() {
    const [view, setView] = useState('bookings');

    return (
        <div className="app-shell">
            <nav className="top-nav">
                <div className="nav-links">
                    <button className={`nav-link ${view === 'packages' ? 'active' : ''}`} onClick={() => setView('packages')}>Safari Packages</button>
                    <button className={`nav-link ${view === 'bookings' ? 'active' : ''}`} onClick={() => setView('bookings')}>Bookings</button>
                    <button className={`nav-link ${view === 'payments' ? 'active' : ''}`} onClick={() => setView('payments')}>Payments</button>
                    <button className={`nav-link ${view === 'reports' ? 'active' : ''}`} onClick={() => setView('reports')}>Reports</button>
                    <button className={`nav-link ${view === 'boatstaff' ? 'active' : ''}`} onClick={() => setView('boatstaff')}>Boats & Staff</button>
                </div>
            </nav>

            <main>
                {view === 'packages' && <PackagesPage />}
                {view === 'bookings' && <BookingsPage />}
                {view === 'payments' && <PaymentsPage />}
                {view === 'reports' && <ReportsPage />}
                {view === 'boatstaff' && <BoatStaffPage />}
            </main>
        </div>
    );
}

export default App;