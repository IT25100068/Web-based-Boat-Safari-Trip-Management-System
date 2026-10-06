import { useState } from 'react';
import { apiPost } from './api';
import './AppStyles.css';

function LoginPage({ onLogin }) {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [nicNumber, setNicNumber] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [nicType, setNicType] = useState('new'); // 'old' or 'new'

    const handleLogin = () => {
        setError('');
        if (!email || !password) return setError('Enter email and password');
        setLoading(true);
        apiPost('/auth/login', { email, password })
            .then(data => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                onLogin(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    const handleRegister = () => {
        setError('');
        if (!name || !email || !password || !phone || !nicNumber || !address) {
            return setError('Please fill in all fields');
        }
        setLoading(true);
        apiPost('/auth/register', { name, email, password, phone, nicNumber, address })
            .then(data => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                onLogin(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    return (
        <div className="auth-shell">
            <div className="auth-visual">
                <div className="auth-visual-content">
                    <div className="auth-mark">⚓</div>
                    <h1>Boat Safari Trip<br/>Management System</h1>
                    <p>Explore rivers and wetlands with our guided boat safari experiences.</p>
                    <ul className="auth-features">
                        <li>🌊 Book curated safari trips</li>
                        <li>💳 Secure, simple payments</li>
                        <li>📋 Manage your reservations with ease</li>
                    </ul>
                </div>
            </div>

            <div className="auth-panel">
                <div className="auth-card">
                    <div className="auth-tabs">
                        <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Log In</button>
                        <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>Sign Up</button>
                    </div>

                    {mode === 'login' && (
                        <>
                            <input className="auth-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                            <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                            {error && <div className="auth-error">{error}</div>}
                            <button className="btn-primary auth-submit" onClick={handleLogin} disabled={loading}>
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>
                        </>
                    )}

                    {mode === 'register' && (
                        <>
                            <input
                                className="auth-input"
                                placeholder="Full name (e.g. Nimal Perera)"
                                value={name}
                                onChange={e => {
                                    const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                    const formatted = lettersOnly
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');
                                    setName(formatted);
                                }}
                            />
                            <input className="auth-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                            <input className="auth-input" type="password" placeholder="Password (min. 8 characters)" value={password} onChange={e => setPassword(e.target.value)} />
                            <input className="auth-input" placeholder="Phone number (e.g. 0771234567)" value={phone}
                                   onChange={e => {
                                       const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                                       setPhone(digitsOnly);
                                   }} />
                            <div className="nic-type-toggle">
                                <button type="button" className={`nic-type-btn ${nicType === 'new' ? 'active' : ''}`} onClick={() => { setNicType('new'); setNicNumber(''); }}>
                                    New NIC (12 digits)
                                </button>
                                <button type="button" className={`nic-type-btn ${nicType === 'old' ? 'active' : ''}`} onClick={() => { setNicType('old'); setNicNumber(''); }}>
                                    Old NIC (9 digits + V)
                                </button>
                            </div>

                            <input
                                className="auth-input"
                                placeholder={nicType === 'new' ? 'NIC number (12 digits)' : 'NIC number (9 digits + V)'}
                                value={nicNumber}
                                onChange={e => {
                                    let val = e.target.value;
                                    if (nicType === 'new') {
                                        val = val.replace(/\D/g, '').slice(0, 12);
                                    } else {
                                        // allow digits for first 9 chars, then optionally V/X as the 10th
                                        let digits = val.replace(/[^0-9]/g, '').slice(0, 9);
                                        let letter = val.replace(/[0-9]/g, '').slice(0, 1).toUpperCase();
                                        val = digits + (val.length > 9 ? letter : '');
                                    }
                                    setNicNumber(val);
                                }}
                            />
                            <input className="auth-input" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
                            {error && <div className="auth-error">{error}</div>}
                            <button className="btn-primary auth-submit" onClick={handleRegister} disabled={loading}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LoginPage;