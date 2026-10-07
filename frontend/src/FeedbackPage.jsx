import { useState, useEffect } from 'react';
import './AppStyles.css';

function authHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
}

function FeedbackPage({ user }) {
    const [bookings, setBookings] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const [activeBookingId, setActiveBookingId] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const isStaff = user.role !== 'CUSTOMER';
    const BOOKINGS_URL = 'http://localhost:8080/api/bookings';
    const FEEDBACK_URL = 'http://localhost:8080/api/feedback';

    useEffect(() => {
        fetchFeedback();
        if (!isStaff) fetchBookings();
    }, []);

    const fetchBookings = () => {
        fetch(`${BOOKINGS_URL}/customer/${user.id}`, { headers: authHeaders() })
            .then(res => res.json())
            .then(setBookings);
    };

    const fetchFeedback = () => {
        fetch(FEEDBACK_URL, { headers: authHeaders() })
            .then(res => res.json())
            .then(setFeedbackList);
    };

    const hasFeedback = (bookingId) => feedbackList.some(f => f.booking && f.booking.id === bookingId);

    const eligibleBookings = bookings.filter(b => b.status === 'CONFIRMED' && !hasFeedback(b.id));
    const myFeedback = feedbackList.filter(f => f.booking && bookings.some(b => b.id === f.booking.id));
    const averageRating = feedbackList.length > 0
        ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1)
        : null;


    const openFeedbackForm = (bookingId) => {
        setActiveBookingId(bookingId);
        setRating(0);
        setComment('');
    };

    const submitFeedback = () => {
        if (rating === 0) return alert('Please select a rating');
        fetch(FEEDBACK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ booking: { id: activeBookingId }, rating, comment }),
        })
            .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.error); }); return res.json(); })
            .then(() => {
                setActiveBookingId(null);
                setRating(0);
                setComment('');
                fetchFeedback();
            })
            .catch(err => alert(err.message));
    };

    const renderStars = (value) => (
        <span className="star-display">
      {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={i <= value ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
    );

    const deleteFeedback = (id) => {
        if (!window.confirm('Delete this review? This cannot be undone.')) return;
        fetch(`${FEEDBACK_URL}/${id}`, { method: 'DELETE', headers: authHeaders() })
            .then(fetchFeedback);
    };

    return (
        <div className="payments-page">
            <div className="payments-container">
                <header className="payments-header">
                    <h1>{isStaff ? 'Customer Feedback' : 'Feedback & Reviews'}</h1>
                    <p>{isStaff ? 'See what customers are saying about their trips' : 'Share your experience and see your past reviews'}</p>
                </header>

                {isStaff && averageRating && (
                    <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '24px' }}>
                        <div className="stat-card">
                            <div className="stat-icon">⭐</div>
                            <div className="stat-value">{averageRating} / 5</div>
                            <div className="stat-label">Average Rating</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💬</div>
                            <div className="stat-value">{feedbackList.length}</div>
                            <div className="stat-label">Total Reviews</div>
                        </div>
                    </div>
                )}

                {!isStaff && eligibleBookings.length > 0 && (
                    <div className="payments-table-card">
                        <h2 style={{ marginTop: 0 }}>Trips Awaiting Your Review</h2>
                        <div className="feedback-eligible-list">
                            {eligibleBookings.map(b => (
                                <div key={b.id} className="feedback-eligible-item">
                                    <div>
                                        <strong>{b.safariPackage?.destination}</strong>
                                        <div className="feedback-eligible-date">Trip date: {b.tripDate}</div>
                                    </div>
                                    <button className="btn-primary" onClick={() => openFeedbackForm(b.id)}>Leave a Review</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="payments-table-card">
                    <h2 style={{ marginTop: 0 }}>{isStaff ? 'All Customer Reviews' : 'Your Reviews'}</h2>
                    <div className="review-list">
                        {(isStaff ? feedbackList : myFeedback).length === 0 && (
                            <div className="empty-state">No reviews yet.</div>
                        )}
                        {(isStaff ? feedbackList : myFeedback).map(f => (
                            <div key={f.id} className="review-card">
                                <div className="review-card-header">
                                    <div>
                                        <strong>{f.booking?.safariPackage?.destination || 'Trip'}</strong>
                                        {isStaff && <span className="review-customer"> — {f.booking?.customer?.name}</span>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {renderStars(f.rating)}
                                        {isStaff && (
                                            <button className="btn-outline btn-danger" onClick={() => deleteFeedback(f.id)}>Delete</button>
                                        )}
                                    </div>
                                </div>
                                {f.comment && <p className="review-comment">"{f.comment}"</p>}
                                <span className="review-date">
                  {new Date(f.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {activeBookingId && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Rate Your Trip</h3>
                        <p className="modal-hint">How was your safari experience?</p>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`star ${star <= rating ? 'filled' : ''}`} onClick={() => setRating(star)}>★</span>
                            ))}
                        </div>
                        <textarea
                            className="modal-input"
                            placeholder="Share your thoughts (optional)"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={4}
                            style={{ resize: 'none', fontFamily: 'inherit' }}
                        />
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={submitFeedback}>Submit Review</button>
                            <button className="btn-text" onClick={() => setActiveBookingId(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeedbackPage;