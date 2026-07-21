const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://taller-de-sabores-api.onrender.com/api';

const api = {
    async get(path) {
        const headers = {};
        const token = this.getToken();
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch(API_BASE + path, { headers });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(err.message || 'Error en la solicitud');
        }
        return res.json();
    },

    async post(path, body) {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch(API_BASE + path, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(err.message || 'Error en la solicitud');
        }
        return res.json();
    },

    async patch(path, body) {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch(API_BASE + path, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(err.message || 'Error en la solicitud');
        }
        return res.json();
    },

    getToken() {
        return localStorage.getItem('ts_token');
    },

    setToken(token) {
        localStorage.setItem('ts_token', token);
    },

    clearToken() {
        localStorage.removeItem('ts_token');
    }
};

const API = api;
