import { useState, useEffect } from 'react';

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
    const [result, setResult] = useState(null); // 'success' | 'failed' | null

    const API_URL = 'http://localhost:8080/api/payments';

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = () => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => setPayments(data));
    };

    // Step 1: create a PENDING payment, then open checkout
    const startCheckout = () => {
        if (!amount || !method) {
            alert('Please enter amount and select a payment method');
            return;
        }

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, paymentMethod: method }),
        })
            .then(res => res.json())
            .then(data => {
                setPendingPaymentId(data.id);
                setShowCheckout(true);
                setResult(null);
            });
    };

    // Step 2: simulate the actual card processing
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

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Payment Management</h2>

            <div style={{ marginBottom: '20px' }}>
                <input placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
                <select value={method} onChange={e => setMethod(e.target.value)}>
                    <option value="">Select Payment Method</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <button onClick={startCheckout}>Pay Now</button>

            </div>

            <table border="1" cellPadding="8">
                <thead>
                <tr>
                    <th>ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Transaction Ref</th><th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {payments.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.amount}</td>
                        <td>{p.paymentMethod}</td>
                        <td>{p.status}</td>
                        <td>{p.transactionReference || '-'}</td>
                        <td>
                            <button onClick={() => verifyPayment(p.id)}>Verify</button>
                            <button onClick={() => refundPayment(p.id)}>Refund</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Checkout Modal */}
            {showCheckout && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        {result === null && !processing && (
                            <>
                                {method === 'Card' ? (
                                    <>
                                        <h3>Enter Card Details</h3>
                                        <input
                                            placeholder="Card Number (try ending in 0000 for a failed payment)"
                                            value={cardNumber}
                                            onChange={e => setCardNumber(e.target.value)}
                                            style={{ width: '100%', marginBottom: '10px' }}
                                        />
                                        <input
                                            placeholder="Expiry (MM/YY)"
                                            value={expiry}
                                            onChange={e => setExpiry(e.target.value)}
                                            style={{ width: '48%', marginRight: '4%' }}
                                        />
                                        <input
                                            placeholder="CVV"
                                            value={cvv}
                                            onChange={e => setCvv(e.target.value)}
                                            style={{ width: '48%' }}
                                        />
                                        <div style={{ marginTop: '15px' }}>
                                            <button onClick={submitCardPayment}>Submit Payment</button>
                                            <button onClick={closeCheckout}>Cancel</button>
                                        </div>
                                    </>
                                ) : method === 'Bank Transfer' ? (
                                    <>
                                    <h3>Bank Transfer Details</h3>
                                    <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                                        <p style={{ margin: 0 }}><strong>Account Name:</strong> Boat Safari Trip Co.</p>
                                        <p style={{ margin: 0 }}><strong>Account Number:</strong> 1234567890</p>
                                        <p style={{ margin: 0 }}><strong>Bank:</strong> Sample Bank</p>
                                    </div>
                                    <p>After transferring, enter your reference number below:</p>
                                    <input
                                        placeholder="Transfer Reference Number"
                                        value={cardNumber}
                                        onChange={e => setCardNumber(e.target.value)}
                                        style={{ width: '100%', marginBottom: '10px' }}
                                    />
                                    <div style={{ marginTop: '15px' }}>
                                        <button onClick={submitBankTransfer}>Confirm Transfer</button>
                                        <button onClick={closeCheckout}>Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                <h3>Confirm Cash Payment</h3>
                                <p>This payment will be marked as pending until confirmed by staff.</p>
                                <div style={{ marginTop: '15px' }}>
                                    <button onClick={closeCheckout}>Confirm & Close</button>
                                </div>
                            </>
                        )}
                            </>
                        )}

                        {processing && <h3>Processing payment...</h3>}

                        {result === 'success' && (
                            <>
                                <h3 style={{ color: 'green' }}>✅ Payment Successful</h3>
                                <button onClick={closeCheckout}>Close</button>
                            </>

                        )}

                        {result === 'failed' && (
                            <>
                                <h3 style={{ color: 'red' }}>❌ Payment Failed</h3>
                                <p>Please check your card details and try again.</p>
                                <button onClick={() => setResult(null)}>Try Again</button>
                                <button onClick={closeCheckout}>Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
};

const modalStyle = {
    background: 'white', color: 'black', padding: '30px',
    borderRadius: '8px', minWidth: '350px',
};

export default PaymentsPage;