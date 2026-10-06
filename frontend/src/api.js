const API_BASE = 'http://localhost:8080/api';

function authHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function apiGet(path) {
    return fetch(`${API_BASE}${path}`, {
        headers: { ...authHeaders() },
    }).then(handleResponse);
}

export function apiPost(path, body) {
    return fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
    }).then(handleResponse);
}

export function apiPut(path, body) {
    return fetch(`${API_BASE}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse);
}

export function apiDelete(path) {
    return fetch(`${API_BASE}${path}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    }).then(handleResponse);
}

function handleResponse(res) {
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        throw new Error('Session expired. Please log in again.');
    }
    if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error || 'Something went wrong'); });
    }
    return res.status === 204 ? null : res.json();
}