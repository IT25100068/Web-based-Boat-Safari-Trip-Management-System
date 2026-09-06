import { useState, useEffect } from 'react';
import './PaymentsPage.css';

function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [amount, setAmount] = useState('');
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

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = () => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => setPayments(data));
    };

    const startCheckout = () => {
        if (!amount || !method) {
            alert('Please enter amount and select a payment method');
            return;
        }
        if (Number(amount) <= 0) {
            alert('Amount must be greater than zero');
            return;
        }
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, paymentMethod: method }),
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
        if (!cardNumber || !expiry || !cvv) {
            alert('Please fill in all card details');
            return;
        }
        setProcessing(true);
        fetch(`${API_URL}/${pendingPaymentId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardNumber }),
        })
            .then(res => res.json())
            .then(data => {
                setProcessing(false);
                setResult(data.status === 'VERIFIED' ? 'success' : 'failed');
                fetchPayments();
            });
    };

    const submitBankTransfer = () => {
        if (!cardNumber) {
            alert('Please enter your transfer reference number');
            return;
        }
        fetch(`${API_URL}/${pendingPaymentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionReference: cardNumber }),
        }).then(() => {
            closeCheckout();
        });
    };

    const closeCheckout = () => {
        fetchPayments();
        setShowCheckout(false);
        setResult(null);
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setAmount('');
        setMethod('');
    };

    const verifyPayment = (id) => {
        fetch(`${API_URL}/${id}/verify`, { method: 'PUT' }).then(fetchPayments);
    };

    const refundPayment = (id) => {
        fetch(`${API_URL}/${id}/refund`, { method: 'PUT' }).then(fetchPayments);
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

                <div className="new-payment-card">
                    <h2>New Payment</h2>
                    <div className="new-payment-form">
                        <input
                            type="number"
                            placeholder="Amount (LKR)"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        <select value={method} onChange={e => setMethod(e.target.value)}>
                            <option value="">Select payment method</option>
                            <option value="Card">Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                        <button className="btn-primary" onClick={startCheckout}>Pay now</button>
                    </div>
                </div>

                <div className="payments-table-card">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
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
                                <td colSpan="6" className="empty-row">No payments yet — add one above.</td>
                            </tr>
                        )}
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td>LKR {Number(p.amount).toLocaleString()}</td>
                                <td>{p.paymentMethod}</td>
                                <td><span className={`status-pill ${statusClass(p.status)}`}>{p.status}</span></td>
                                <td className="ref-cell">{p.transactionReference || '—'}</td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-outline"
                                        onClick={() => verifyPayment(p.id)}
                                        disabled={p.status !== 'PENDING'}
                                    >
                                        Verify
                                    </button>
                                    <button
                                        className="btn-outline btn-danger"
                                        onClick={() => refundPayment(p.id)}
                                        disabled={p.status !== 'VERIFIED'}
                                    >
                                        Refund
                                    </button>
                                    <button
                                        className = "btn-outline"
                                        onClick={() => openReceipt(p)}
                                        disabled={p.status === 'PENDING'}
                                    >
                                        Receipt
                                    </button>
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
                                            placeholder="Card number"
                                            value={cardNumber}
                                            onChange={e => setCardNumber(e.target.value)}
                                        />
                                        <div className="modal-row">
                                            <input
                                                className="modal-input"
                                                placeholder="MM/YY"
                                                value={expiry}
                                                onChange={e => setExpiry(e.target.value)}
                                            />
                                            <input
                                                className="modal-input"
                                                placeholder="CVV"
                                                value={cvv}
                                                onChange={e => setCvv(e.target.value)}
                                            />
                                        </div>
                                        <div className="modal-actions">
                                            <button className="btn-primary" onClick={submitCardPayment}>Submit payment</button>
                                            <button className="btn-text" onClick={closeCheckout}>Cancel</button>
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
                                            placeholder="Transfer reference number"
                                            value={cardNumber}
                                            onChange={e => setCardNumber(e.target.value)}
                                        />
                                        <div className="modal-actions">
                                            <button className="btn-primary" onClick={submitBankTransfer}>Confirm transfer</button>
                                            <button className="btn-text" onClick={closeCheckout}>Cancel</button>
                                        </div>
                                    </>
                                )}

                                {method === 'Cash' && (
                                    <>
                                        <h3>Confirm cash payment</h3>
                                        <p className="modal-hint">This payment will stay pending until a staff member confirms it in person.</p>
                                        <div className="modal-actions">
                                            <button className="btn-primary" onClick={closeCheckout}>Confirm & close</button>
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
                                <button className="btn-primary" onClick={closeCheckout}>Close</button>
                            </div>
                        )}

                        {result === 'failed' && (
                            <div className="result-state">
                                <div className="result-icon failed">✕</div>
                                <h3>Payment failed</h3>
                                <p className="modal-hint">Check the card details and try again.</p>
                                <div className="modal-actions">
                                    <button className="btn-primary" onClick={() => setResult(null)}>Try again</button>
                                    <button className="btn-text" onClick={closeCheckout}>Cancel</button>
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
                                <td>Boat safari trip payment</td>
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