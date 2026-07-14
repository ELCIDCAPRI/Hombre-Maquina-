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

    async _loadDashboard() {
        const [usuarios, pedidos, resenas, contactos] = await Promise.all([
            this._query('usuarios'),
            this._query('pedidos'),
            this._query('resenas'),
            this._query('contactos')
        ]);

        const totalIngresos = pedidos.reduce((s, p) => s + (p.total || 0), 0);
        const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
        const本月 = new Date().getMonth();
        const pedidosMes = pedidos.filter(p => new Date(p.fecha_creacion || p.created_at).getMonth() ===本月).length;

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

    async _query(table) {
        const { data, error } = await supabaseClient
            .from(table)
            .select('*')
            .order('id', { ascending: false })
            .limit(50);
        if (error) {
            console.error('Error querying ' + table + ':', error);
            return [];
        }
        return data || [];
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
                <td>${p.usuario_id || '—'}</td>
                <td><span class="badge-status badge-${p.estado}">${p.estado}</span></td>
                <td>S/ ${Number(p.total || 0).toFixed(2)}</td>
                <td>${this._formatDate(p.fecha_creacion || p.created_at)}</td>
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
                <td>${u.correo || u.email || '—'}</td>
                <td><span class="badge-role">${u.rol || 'Cliente'}</span></td>
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
                <td class="resena-text">${(r.texto || '').substring(0, 60)}...</td>
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
                <td class="resena-text">${(c.mensaje || '').substring(0, 60)}...</td>
            </tr>
        `).join('');
    },

    switchSection(section) {
        this._activeSection = section;
        document.querySelectorAll('.admin-section').forEach(el => el.classList.add('d-none'));
        document.getElementById('section-' + section).classList.remove('d-none');
        document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
    },

    _formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
