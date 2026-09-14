import { useState } from 'react';
import PackagesPage from './PackagesPage';
import BookingsPage from './BookingsPage';
import PaymentsPage from './PaymentsPage';
import './AppStyles.css';

function App() {
  const [view, setView] = useState('bookings');

  return (
      <div className="app-shell">
        <nav className="top-nav">
          <div className="nav-links">
            <button className={`nav-link ${view === 'packages' ? 'active' : ''}`} onClick={() => setView('packages')}>
              Safari Packages
            </button>
            <button className={`nav-link ${view === 'bookings' ? 'active' : ''}`} onClick={() => setView('bookings')}>
              Bookings
            </button>
            <button className={`nav-link ${view === 'payments' ? 'active' : ''}`} onClick={() => setView('payments')}>
              Payments
            </button>
          </div>
        </nav>

        <main>
          {view === 'packages' && <PackagesPage />}
          {view === 'bookings' && <BookingsPage />}
          {view === 'payments' && <PaymentsPage />}
        </main>
      </div>
  );
}

export default App;