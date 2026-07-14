const Admin = {
    _code: '123',
    _key: 'ts_admin_session',
    _activeSection: 'dashboard',

    init() {
        if (this._isAuthenticated()) {
            this._showDashboard();
        } else {
            this._showLogin();
        }
    },

    _isAuthenticated() {
        return sessionStorage.getItem(this._key) === '1';
    },

    authenticate(code) {
        if (code === this._code) {
            sessionStorage.setItem(this._key, '1');
            this._showDashboard();
            return true;
        }
        return false;
    },

    logout() {
        sessionStorage.removeItem(this._key);
        this._showLogin();
    },

    _showLogin() {
        document.getElementById('admin-login').classList.remove('d-none');
        document.getElementById('admin-dashboard').classList.add('d-none');
        document.getElementById('admin-code-input').value = '';
        document.getElementById('admin-code-error').classList.add('d-none');
    },

    _showDashboard() {
        document.getElementById('admin-login').classList.add('d-none');
        document.getElementById('admin-dashboard').classList.remove('d-none');
        this._loadDashboard();
    },

    _loadDashboard() {
        const usuarios = Auth.getAllUsers();
        const pedidos = Auth.getOrders();
        const resenas = Auth.getReviews();
        const contactos = Auth.getContacts();

        const totalIngresos = pedidos.reduce((s, p) => s + (p.total || 0), 0);
        const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;

        document.getElementById('stat-usuarios').textContent = usuarios.length;
        document.getElementById('stat-pedidos').textContent = pedidos.length;
        document.getElementById('stat-resenas').textContent = resenas.length;
        document.getElementById('stat-contactos').textContent = contactos.length;
        document.getElementById('stat-ingresos').textContent = 'S/ ' + totalIngresos.toFixed(2);
        document.getElementById('stat-pendientes').textContent = pedidosPendientes;

        this._renderPedidos(pedidos);
        this._renderUsuarios(usuarios);
        this._renderResenas(resenas);
        this._renderContactos(contactos);
    },

    _renderPedidos(pedidos) {
        const el = document.getElementById('table-pedidos-body');
        if (!pedidos.length) {
            el.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No hay pedidos</td></tr>';
            return;
        }
        el.innerHTML = pedidos.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td>${p.cliente || '—'}</td>
                <td><span class="badge-status badge-${p.estado}">${p.estado}</span></td>
                <td>S/ ${Number(p.total || 0).toFixed(2)}</td>
                <td>${p.fecha || '—'}</td>
            </tr>
        `).join('');
    },

    _renderUsuarios(usuarios) {
        const el = document.getElementById('table-usuarios-body');
        if (!usuarios.length) {
            el.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay usuarios</td></tr>';
            return;
        }
        el.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.nombre || '—'}</td>
                <td>${u.email || '—'}</td>
                <td><span class="badge-role ${u.rol === 'admin' ? 'badge-admin' : ''}">${u.rol}</span></td>
            </tr>
        `).join('');
    },

    _renderResenas(resenas) {
        const el = document.getElementById('table-resenas-body');
        if (!resenas.length) {
            el.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay reseñas</td></tr>';
            return;
        }
        el.innerHTML = resenas.map(r => `
            <tr>
                <td>${r.id}</td>
                <td>${r.nombre || '—'}</td>
                <td>${'★'.repeat(r.calificacion || 0)}${'☆'.repeat(5 - (r.calificacion || 0))}</td>
                <td class="resena-text">${(r.texto || '').substring(0, 60)}${r.texto && r.texto.length > 60 ? '...' : ''}</td>
            </tr>
        `).join('');
    },

    _renderContactos(contactos) {
        const el = document.getElementById('table-contactos-body');
        if (!contactos.length) {
            el.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay contactos</td></tr>';
            return;
        }
        el.innerHTML = contactos.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.nombre || '—'}</td>
                <td>${c.email || '—'}</td>
                <td class="resena-text">${(c.mensaje || '').substring(0, 60)}${c.mensaje && c.mensaje.length > 60 ? '...' : ''}</td>
            </tr>
        `).join('');
    },

    switchSection(section) {
        this._activeSection = section;
        document.querySelectorAll('.admin-section').forEach(el => el.classList.add('d-none'));
        document.getElementById('section-' + section).classList.remove('d-none');
        document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
        const link = document.querySelector(`[data-section="${section}"]`);
        if (link) link.classList.add('active');
    },

    showCreateAdmin() {
        document.getElementById('create-admin-form').classList.toggle('d-none');
        document.getElementById('create-admin-name').value = '';
        document.getElementById('create-admin-email').value = '';
        document.getElementById('create-admin-pass').value = '';
        document.getElementById('create-admin-error').classList.add('d-none');
        document.getElementById('create-admin-success').classList.add('d-none');
    },

    _handleCreateAdmin(event) {
        event.preventDefault();
        const nombre = document.getElementById('create-admin-name').value.trim();
        const email = document.getElementById('create-admin-email').value.trim();
        const pass = document.getElementById('create-admin-pass').value.trim();
        const errorEl = document.getElementById('create-admin-error');
        const successEl = document.getElementById('create-admin-success');

        if (!nombre || !email || !pass) {
            errorEl.textContent = 'Completa todos los campos.';
            errorEl.classList.remove('d-none');
            return;
        }

        const result = Auth.createAdmin(nombre, email, pass);
        if (result.ok) {
            successEl.textContent = 'Administrador "' + nombre + '" creado correctamente.';
            successEl.classList.remove('d-none');
            errorEl.classList.add('d-none');
            document.getElementById('create-admin-name').value = '';
            document.getElementById('create-admin-email').value = '';
            document.getElementById('create-admin-pass').value = '';
            this._renderUsuarios(Auth.getAllUsers());
            this._loadDashboard();
        } else {
            successEl.classList.add('d-none');
            errorEl.textContent = result.error;
            errorEl.classList.remove('d-none');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
