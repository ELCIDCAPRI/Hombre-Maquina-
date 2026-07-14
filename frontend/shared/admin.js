const Admin = {
    _code: '123',
    _key: 'ts_admin_session',
    _activeSection: 'dashboard',
    _chartFilter: 'semana',

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

        this._renderChart(this._chartFilter);
        this._renderPedidos(pedidos);
        this._renderUsuarios(usuarios);
        this._renderResenas(resenas);
        this._renderContactos(contactos);
    },

    // ===================== CHART =====================

    _renderChart(filter) {
        this._chartFilter = filter;
        document.querySelectorAll('.chart-filter').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));

        const pedidos = Auth.getOrders();
        const now = new Date();
        let labels = [];
        let counts = [];

        if (filter === 'semana') {
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                labels.push(days[d.getDay()]);
                const dateStr = d.toISOString().split('T')[0];
                counts.push(pedidos.filter(p => p.fecha === dateStr).length);
            }
        } else if (filter === 'mes') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                labels.push(i);
                const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                counts.push(pedidos.filter(p => p.fecha === dateStr).length);
            }
        } else if (filter === 'trimestre') {
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const startMonth = now.getMonth() - 2 < 0 ? now.getMonth() - 2 + 12 : now.getMonth() - 2;
            const startYear = now.getMonth() - 2 < 0 ? now.getFullYear() - 1 : now.getFullYear();
            for (let i = 0; i < 3; i++) {
                const m = (startMonth + i) % 12;
                const y = startMonth + i >= 12 ? startYear + 1 : startYear;
                labels.push(months[m] + ' ' + String(y).slice(-2));
                counts.push(pedidos.filter(p => {
                    const pd = new Date(p.fecha);
                    return pd.getMonth() === m && pd.getFullYear() === y;
                }).length);
            }
        } else {
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            for (let m = 0; m < 12; m++) {
                labels.push(months[m]);
                counts.push(pedidos.filter(p => {
                    const pd = new Date(p.fecha);
                    return pd.getMonth() === m && pd.getFullYear() === now.getFullYear();
                }).length);
            }
        }

        const max = Math.max(...counts, 1);
        const container = document.getElementById('chart-bars');
        container.innerHTML = labels.map((label, i) => {
            const height = Math.round((counts[i] / max) * 100);
            return `<div class="chart-col">
                <div class="chart-bar" style="height:${height}%">
                    <span class="chart-bar-value">${counts[i]}</span>
                </div>
                <span class="chart-bar-label">${label}</span>
            </div>`;
        }).join('');
    },

    // ===================== PEDIDOS =====================

    _renderPedidos(pedidos) {
        const el = document.getElementById('table-pedidos-body');
        if (!pedidos.length) {
            el.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay pedidos</td></tr>';
            return;
        }
        el.innerHTML = pedidos.map(p => {
            const statusOptions = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado']
                .map(s => `<option value="${s}" ${p.estado === s ? 'selected' : ''}>${s}</option>`).join('');
            return `<tr>
                <td>#${p.id}</td>
                <td>${p.cliente || '—'}</td>
                <td>${p.email || '—'}</td>
                <td>
                    <select class="status-select status-${p.estado}" onchange="Admin._updateOrderStatus(${p.id}, this.value)">
                        ${statusOptions}
                    </select>
                </td>
                <td>S/ ${Number(p.total || 0).toFixed(2)}</td>
                <td>${p.fecha || '—'}</td>
                <td>
                    <button class="btn-action btn-action-view" onclick="Admin._viewOrder(${p.id})" title="Ver detalle">👁</button>
                </td>
            </tr>`;
        }).join('');
    },

    _updateOrderStatus(id, newStatus) {
        const result = Auth.updateOrder(id, { estado: newStatus });
        if (result.ok) {
            this._toast('Estado actualizado a "' + newStatus + '"');
            this._loadDashboard();
        } else {
            this._toast('Error: ' + result.error, true);
        }
    },

    _viewOrder(id) {
        const order = Auth.getOrderById(id);
        if (!order) return;
        let items = (order.items || []).map(i => `${i.nombre} x${i.cantidad || 1} — S/ ${Number(i.precio || 0).toFixed(2)}`).join('\n');
        alert(
            `Pedido #${order.id}\n\n` +
            `Cliente: ${order.cliente || '—'}\n` +
            `Email: ${order.email || '—'}\n` +
            `Teléfono: ${order.telefono || '—'}\n` +
            `Dirección: ${order.direccion || '—'}\n` +
            `Estado: ${order.estado}\n` +
            `Fecha: ${order.fecha || '—'}\n\n` +
            `Productos:\n${items || '(sin detalle)'}\n\n` +
            `Total: S/ ${Number(order.total || 0).toFixed(2)}`
        );
    },

    // ===================== USUARIOS =====================

    _renderUsuarios(usuarios) {
        const el = document.getElementById('table-usuarios-body');
        if (!usuarios.length) {
            el.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay usuarios</td></tr>';
            return;
        }
        el.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.nombre || '—'}</td>
                <td>${u.email || '—'}</td>
                <td><code style="font-size:0.8rem;">${u.password || '—'}</code></td>
                <td><span class="badge-role ${u.rol === 'admin' ? 'badge-admin' : ''}">${u.rol}</span></td>
                <td>
                    <button class="btn-action btn-action-edit" onclick="Admin.showEditUser(${u.id})" title="Editar">✏️</button>
                    <button class="btn-action btn-action-delete" onclick="Admin._confirmDeleteUser(${u.id}, '${(u.nombre || '').replace(/'/g, "\\'")}')" title="Eliminar">🗑</button>
                </td>
            </tr>
        `).join('');
    },

    showCreateUser() {
        document.getElementById('create-user-form').classList.remove('d-none');
        document.getElementById('create-user-name').value = '';
        document.getElementById('create-user-email').value = '';
        document.getElementById('create-user-pass').value = '';
        document.getElementById('create-user-role').value = 'cliente';
        document.getElementById('create-user-error').classList.add('d-none');
        document.getElementById('create-user-success').classList.add('d-none');
    },

    hideCreateUser() {
        document.getElementById('create-user-form').classList.add('d-none');
    },

    _handleCreateUser(event) {
        event.preventDefault();
        const nombre = document.getElementById('create-user-name').value.trim();
        const email = document.getElementById('create-user-email').value.trim();
        const pass = document.getElementById('create-user-pass').value.trim();
        const rol = document.getElementById('create-user-role').value;
        const errorEl = document.getElementById('create-user-error');
        const successEl = document.getElementById('create-user-success');

        const result = Auth.createUser(nombre, email, pass, rol);
        if (result.ok) {
            successEl.textContent = 'Usuario "' + nombre + '" creado.';
            successEl.classList.remove('d-none');
            errorEl.classList.add('d-none');
            this._renderUsuarios(Auth.getAllUsers());
            this._loadDashboard();
            setTimeout(() => this.hideCreateUser(), 1500);
        } else {
            successEl.classList.add('d-none');
            errorEl.textContent = result.error;
            errorEl.classList.remove('d-none');
        }
    },

    showEditUser(id) {
        const user = Auth.getUserById(id);
        if (!user) return;
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-user-name').value = user.nombre || '';
        document.getElementById('edit-user-email').value = user.email || '';
        document.getElementById('edit-user-pass').value = user.password || '';
        document.getElementById('edit-user-role').value = user.rol || 'cliente';
        document.getElementById('edit-user-error').classList.add('d-none');
        new bootstrap.Modal(document.getElementById('editUserModal')).show();
    },

    _handleEditUser(event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('edit-user-id').value);
        const nombre = document.getElementById('edit-user-name').value.trim();
        const email = document.getElementById('edit-user-email').value.trim();
        const pass = document.getElementById('edit-user-pass').value.trim();
        const rol = document.getElementById('edit-user-role').value;
        const errorEl = document.getElementById('edit-user-error');

        const result = Auth.updateUser(id, { nombre, email, password: pass, rol });
        if (result.ok) {
            bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            this._renderUsuarios(Auth.getAllUsers());
            this._loadDashboard();
            this._toast('Usuario actualizado');
        } else {
            errorEl.textContent = result.error;
            errorEl.classList.remove('d-none');
        }
    },

    _confirmDeleteUser(id, nombre) {
        document.getElementById('confirm-delete-title').textContent = '¿Eliminar usuario?';
        document.getElementById('confirm-delete-msg').textContent = `"${nombre}" será eliminado permanentemente.`;
        document.getElementById('confirm-delete-error').classList.add('d-none');
        document.getElementById('confirm-delete-btn').onclick = () => {
            Auth.deleteUser(id);
            bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
            this._renderUsuarios(Auth.getAllUsers());
            this._loadDashboard();
            this._toast('Usuario eliminado');
        };
        new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
    },

    // ===================== RESEÑAS =====================

    _renderResenas(resenas) {
        const el = document.getElementById('table-resenas-body');
        if (!resenas.length) {
            el.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No hay reseñas</td></tr>';
            return;
        }
        el.innerHTML = resenas.map(r => `
            <tr>
                <td>${r.id}</td>
                <td>${r.nombre || '—'}</td>
                <td><span class="resena-stars">${'★'.repeat(r.calificacion || 0)}${'☆'.repeat(5 - (r.calificacion || 0))}</span></td>
                <td class="resena-text">${(r.texto || '').substring(0, 80)}${r.texto && r.texto.length > 80 ? '...' : ''}</td>
                <td>${r.fecha || '—'}</td>
            </tr>
        `).join('');
    },

    // ===================== CONTACTOS =====================

    _renderContactos(contactos) {
        const el = document.getElementById('table-contactos-body');
        if (!contactos.length) {
            el.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No hay contactos</td></tr>';
            return;
        }
        el.innerHTML = contactos.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.nombre || '—'}</td>
                <td>${c.email || '—'}</td>
                <td class="resena-text">${(c.mensaje || '').substring(0, 80)}${c.mensaje && c.mensaje.length > 80 ? '...' : ''}</td>
                <td>${c.leido ? '<span class="badge-status badge-confirmado">Leído</span>' : '<span class="badge-status badge-pendiente">Nuevo</span>'}</td>
            </tr>
        `).join('');
    },

    // ===================== NAVIGATION =====================

    switchSection(section) {
        this._activeSection = section;
        document.querySelectorAll('.admin-section').forEach(el => el.classList.add('d-none'));
        document.getElementById('section-' + section).classList.remove('d-none');
        document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
        const link = document.querySelector(`[data-section="${section}"]`);
        if (link) link.classList.add('active');
    },

    // ===================== TOAST =====================

    _toast(msg, isError) {
        const el = document.getElementById('admin-toast');
        if (!el) return;
        el.textContent = msg;
        el.className = 'admin-toast show' + (isError ? ' admin-toast-error' : '');
        setTimeout(() => el.classList.remove('show'), 2500);
    }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
