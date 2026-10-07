import { useState, useEffect } from 'react';
import './AppStyles.css';

function authHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
}

function formatCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
    let digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
        return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
}

function isExpiryValid(value) {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt('20' + match[2], 10);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    if (year > currentYear + 15) return false;

    return true;
}

function PaymentsPage({ user, preselectedBookingId, onPreselectHandled }) {
    const [payments, setPayments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState('');
    const [method, setMethod] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    const [pendingPaymentId, setPendingPaymentId] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const API_URL = 'http://localhost:8080/api/payments';
    const BOOKINGS_URL = 'http://localhost:8080/api/bookings';

    useEffect(() => {
        fetchPayments();
        fetchBookings();
    }, []);

    useEffect(() => {
        if (preselectedBookingId) {
            setSelectedBookingId(String(preselectedBookingId));
            onPreselectHandled();
        }
    }, [preselectedBookingId, bookings]);

    const fetchPayments = () => {
        const url = user.role === 'CUSTOMER'
            ? `${API_URL}?customerId=${user.id}`
            : API_URL;
        fetch(url, { headers: authHeaders() }).then(res => res.json()).then(setPayments);
    };

    const fetchBookings = () => {
        const url = user.role === 'CUSTOMER'
            ? `${BOOKINGS_URL}/customer/${user.id}`
            : BOOKINGS_URL;
        fetch(url, { headers: authHeaders() }).then(res => res.json()).then(setBookings);
    };

    const unpaidBookings = bookings.filter(b =>
        b.status !== 'CANCELLED' && !payments.some(p => p.booking?.id === b.id)
    );

    const startCheckout = () => {
        if (!selectedBookingId || !method) {
            alert('Please select a booking and payment method');
            return;
        }
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ booking: { id: selectedBookingId }, paymentMethod: method }),
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Something went wrong'); });
                }
                return res.json();
            })
            .then(data => {
                setPendingPaymentId(data.id);
                setShowCheckout(true);
                setResult(null);
            })
            .catch(err => alert(err.message));
    };

    const submitCardPayment = () => {
        const digitsOnly = cardNumber.replace(/\s/g, '');
        if (!digitsOnly || digitsOnly.length !== 16) {
            alert('Card number must be exactly 16 digits');
            return;
        }
        if (!expiry || !isExpiryValid(expiry)) {
            alert('Enter a valid expiry date (MM/YY) that has not already passed');
            return;
        }
        if (!cvv || cvv.length !== 3) {
            alert('CVV must be exactly 3 digits');
            return;
        }
        setProcessing(true);
        fetch(`${API_URL}/${pendingPaymentId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ cardNumber: digitsOnly }),
        })
            .then(res => res.json())
            .then(data => {
                setProcessing(false);
                setResult(data.status === 'VERIFIED' ? 'success' : 'failed');
                fetchPayments();
            });
    };

    const BANK_REF_PATTERN = /^[A-Za-z0-9]{10}$/;

    const submitBankTransfer = () => {
        const ref = cardNumber.trim();
        if (!BANK_REF_PATTERN.test(ref)) {
            alert('Transfer reference must be exactly 10 characters (letters and numbers only)');
            return;
        }
        if (!ref) {
            alert('Please enter your transfer reference number');
            return;
        }
        if (ref.length < 6) {
            alert('Transfer reference number must be at least 6 characters');
            return;
        }
        fetch(`${API_URL}/${pendingPaymentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ transactionReference: ref }),
        }).then(() => {
            closeCheckout(false);
        });
    };

    const resetCheckoutState = () => {
        setShowCheckout(false);
        setResult(null);
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setSelectedBookingId('');
        setMethod('');
        setPendingPaymentId(null);
    };

    const closeCheckout = (wasCancelled) => {
        if (wasCancelled && pendingPaymentId && result === null) {
            fetch(`${API_URL}/${pendingPaymentId}`, { method: 'DELETE', headers: authHeaders() })
                .finally(() => {
                    fetchPayments();
                    fetchBookings();
                    resetCheckoutState();
                });
        } else {
            fetchPayments();
            fetchBookings();
            resetCheckoutState();
        }
    };

    const verifyPayment = (id) => {
        fetch(`${API_URL}/${id}/verify`, { method: 'PUT', headers: authHeaders() }).then(fetchPayments);
    };

    const refundPayment = (id) => {
        fetch(`${API_URL}/${id}/refund`, { method: 'PUT', headers: authHeaders() }).then(fetchPayments);
    };

    const statusClass = (status) => {
        if (status === 'VERIFIED') return 'status-verified';
        if (status === 'REFUNDED') return 'status-refunded';
        if (status === 'FAILED') return 'status-failed';
        return 'status-pending';
    };

    const openReceipt = (payment) => {
        setSelectedPayment(payment);
        setShowReceipt(true);
    };

    const closeReceipt = () => {
        setShowReceipt(false);
        setSelectedPayment(null);
    };

    const printReceipt = () => {
        window.print();
    };

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>Payment Management</h1>
                    <p>Verify, refund, and track boat safari trip payments</p>
                </header>

                {user.role === 'CUSTOMER' && (
                    <div className="new-payment-card">
                        <h2>New Payment</h2>
                        <div className="new-payment-form">
                            <select value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)}>
                                <option value="">Select a booking to pay for</option>
                                {unpaidBookings.map(b => (
                                    <option key={b.id} value={b.id}>
                                        #{b.id} — {b.safariPackage?.destination} — LKR {(b.safariPackage?.price * b.numberOfSeats).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                            <select value={method} onChange={e => setMethod(e.target.value)}>
                                <option value="">Select payment method</option>
                                <option value="Card">Card</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                            <button className="btn-primary" onClick={startCheckout}>Pay now</button>
                        </div>
                    </div>
                )}

                <div className="payments-table-card">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            {user.role !== 'CUSTOMER' && <th>Customer</th>}
                            <th>Trip</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Transaction Ref</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {payments.length === 0 && (
                            <tr>
                                <td colSpan={user.role !== 'CUSTOMER' ? 8 : 7} className="empty-row">No payments yet — add one above.</td>
                            </tr>
                        )}
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                {user.role !== 'CUSTOMER' && <td>{p.booking?.customer?.name || '—'}</td>}
                                <td>{p.booking?.safariPackage?.destination || '—'}</td>
                                <td>LKR {Number(p.amount).toLocaleString()}</td>
                                <td>{p.paymentMethod}</td>
                                <td><span className={`status-pill ${statusClass(p.status)}`}>{p.status}</span></td>
                                <td className="ref-cell">{p.transactionReference || '—'}</td>
                                <td className="actions-cell">
                                    {user.role !== 'CUSTOMER' && (
                                        <>
                                            <button className="btn-outline" onClick={() => verifyPayment(p.id)} disabled={p.status !== 'PENDING'}>Verify</button>
                                            <button className="btn-outline btn-danger" onClick={() => refundPayment(p.id)} disabled={p.status !== 'VERIFIED'}>Refund</button>
                                        </>
                                    )}
                                    <button className="btn-outline" onClick={() => openReceipt(p)} disabled={p.status === 'PENDING'}>Receipt</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCheckout && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        {result === null && !processing && (
                            <>
                                {method === 'Card' && (
                                    <>
                                        <h3>Card details</h3>
                                        <p className="modal-hint">Use a card number ending in 0000 to simulate a failed payment.</p>
                                        <input
                                            className="modal-input"
                                            placeholder="Card number (16 digits)"
                                            value={cardNumber}
                                            maxLength={19}
                                            inputMode="numeric"
                                            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                        />
                                        <div className="modal-row">
                                            <input
                                                className="modal-input"
                                                placeholder="MM/YY"
                                                value={expiry}
                                                maxLength={5}
                                                inputMode="numeric"
                                                onChange={e => setExpiry(formatExpiry(e.target.value))}
                                            />
                                            <input
                                                className="modal-input"
                                                placeholder="CVV"
                                                value={cvv}
                                                maxLength={3}
                                                inputMode="numeric"
                                                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                            />
                                        </div>
                                        <div className="modal-actions">
                                            <button className="btn-primary" onClick={submitCardPayment}>Submit payment</button>
                                            <button className="btn-text" onClick={() => closeCheckout(true)}>Cancel</button>
                                        </div>
                                    </>
                                )}

                                {method === 'Bank Transfer' && (
                                    <>
                                        <h3>Bank transfer details</h3>
                                        <div className="bank-details">
                                            <p><strong>Account name</strong> Boat Safari Trip Co.</p>
                                            <p><strong>Account number</strong> 1234567890</p>
                                            <p><strong>Bank</strong> Sample Bank</p>
                                        </div>
                                        <p className="modal-hint">After transferring, enter your reference number below.</p>
                                        <input
                                            className="modal-input"
                                            placeholder="Transfer reference (10 characters)"
                                            value={cardNumber}
                                            maxLength={10}
                                            onChange={e => setCardNumber(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 10))}
                                        />
                                        <div className="modal-actions">
                                            <button className="btn-primary" onClick={submitBankTransfer}>Confirm transfer</button>
                                            <button className="btn-text" onClick={() => closeCheckout(true)}>Cancel</button>
                                        </div>
                                    </>
                                )}

                                {method === 'Cash' && (
                                    <>
                                        <h3>Confirm cash payment</h3>
                                        <p className="modal-hint">This payment will stay pending until a staff member confirms it in person.</p>
                                        <div className="modal-actions">
                                            <button className="btn-primary" onClick={() => closeCheckout(false)}>Confirm & close</button>
                                            <button className="btn-text" onClick={() => closeCheckout(true)}>Cancel</button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {processing && (
                            <div className="processing-state">
                                <div className="spinner"></div>
                                <p>Processing payment…</p>
                            </div>
                        )}

                        {result === 'success' && (
                            <div className="result-state">
                                <div className="result-icon success">✓</div>
                                <h3>Payment successful</h3>
                                <button className="btn-primary" onClick={() => closeCheckout(false)}>Close</button>
                            </div>
                        )}

                        {result === 'failed' && (
                            <div className="result-state">
                                <div className="result-icon failed">✕</div>
                                <h3>Payment failed</h3>
                                <p className="modal-hint">Check the card details and try again.</p>
                                <div className="modal-actions">
                                    <button className="btn-primary" onClick={() => setResult(null)}>Try again</button>
                                    <button className="btn-text" onClick={() => closeCheckout(true)}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showReceipt && selectedPayment && (
                <div className="modal-overlay no-print-overlay">
                    <div className="receipt-card">
                        <div className="receipt-header">
                            <h2>Boat Safari Trip Co.</h2>
                            <p className="receipt-subtitle">Payment Receipt</p>
                        </div>

                        <div className="receipt-meta">
                            <div>
                                <span className="receipt-label">Invoice No.</span>
                                <span>INV-{String(selectedPayment.id).padStart(5, '0')}</span>
                            </div>
                            <div>
                                <span className="receipt-label">Date</span>
                                <span>{new Date(selectedPayment.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <table className="receipt-table">
                            <thead>
                            <tr>
                                <th>Description</th>
                                <th>Method</th>
                                <th>Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>{selectedPayment.booking?.safariPackage?.destination || 'Boat safari trip'} payment</td>
                                <td>{selectedPayment.paymentMethod}</td>
                                <td>LKR {Number(selectedPayment.amount).toLocaleString()}</td>
                            </tr>
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan="2">Total</td>
                                <td>LKR {Number(selectedPayment.amount).toLocaleString()}</td>
                            </tr>
                            </tfoot>
                        </table>

                        <div className="receipt-status-row">
                            <span className="receipt-label">Status</span>
                            <span className={`status-pill ${statusClass(selectedPayment.status)}`}>{selectedPayment.status}</span>
                        </div>

                        {selectedPayment.transactionReference && (
                            <div className="receipt-status-row">
                                <span className="receipt-label">Transaction Ref.</span>
                                <span className="ref-cell">{selectedPayment.transactionReference}</span>
                            </div>
                        )}

                        <p className="receipt-footer">Thank you for booking with Boat Safari Trip Co.</p>

                        <div className="modal-actions no-print">
                            <button className="btn-primary" onClick={printReceipt}>Print / Save as PDF</button>
                            <button className="btn-text" onClick={closeReceipt}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default PaymentsPage;