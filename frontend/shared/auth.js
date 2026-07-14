const Auth = {
    _key: 'ts_auth',

    async register(nombre, email, password) {
        try {
            await API.post('/auth/register', { nombre: nombre.trim(), email: email.trim().toLowerCase(), password });
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message || 'Error al registrar' };
        }
    },

    async login(email, password) {
        try {
            const data = await API.post('/auth/login', { email: email.trim().toLowerCase(), password });
            if (data.token) API.setToken(data.token);
            const session = { id: data.user.id, nombre: data.user.nombre, email: data.user.email, rol: data.user.rol };
            localStorage.setItem(this._key, JSON.stringify(session));
            this._notify();
            return { ok: true, user: session };
        } catch (e) {
            return { ok: false, error: e.message || 'Correo o contraseña incorrectos' };
        }
    },

    logout() {
        localStorage.removeItem(this._key);
        API.clearToken();
        this._notify();
    },

    getUser() {
        return JSON.parse(localStorage.getItem(this._key) || 'null');
    },

    isAdmin() {
        const u = this.getUser();
        return u && u.rol === 'admin';
    },

    isLoggedIn() {
        return !!this.getUser();
    },

    _notify() {
        window.dispatchEvent(new CustomEvent('auth-change', { detail: this.getUser() }));
        this._updateUI();
    },

    _updateUI() {
        const user = this.getUser();
        document.querySelectorAll('.auth-user-name').forEach(el => {
            el.textContent = user ? user.nombre : '';
        });
        document.querySelectorAll('.auth-logged-in').forEach(el => {
            el.classList.toggle('d-none', !user);
        });
        document.querySelectorAll('.auth-logged-out').forEach(el => {
            el.classList.toggle('d-none', !!user);
        });
        document.querySelectorAll('.auth-admin-link').forEach(el => {
            el.classList.toggle('d-none', !this.isAdmin());
        });
    },

    async getAllUsers() {
        try {
            return await API.get('/auth/users');
        } catch (e) {
            return [];
        }
    },

    _injectModals() {
        if (!document.getElementById('authModal')) {
            const div = document.createElement('div');
            div.innerHTML = `
            <div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalTitle" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content" style="border-radius:8px;border:none;">
                  <div class="modal-header border-0 pb-0">
                    <ul class="nav nav-pills w-100 justify-content-center" id="authTabs" role="tablist">
                      <li class="nav-item" role="presentation">
                        <button class="nav-link auth-tab active" id="login-tab" data-bs-toggle="pill" data-bs-target="#loginForm" type="button" role="tab" aria-controls="loginForm" aria-selected="true">Iniciar Sesión</button>
                      </li>
                      <li class="nav-item" role="presentation">
                        <button class="nav-link auth-tab" id="register-tab" data-bs-toggle="pill" data-bs-target="#registerForm" type="button" role="tab" aria-controls="registerForm" aria-selected="false">Registrarse</button>
                      </li>
                    </ul>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                  </div>
                  <div class="modal-body px-4 py-3">
                    <div class="tab-content">
                      <div class="tab-pane fade show active" id="loginForm" role="tabpanel" aria-labelledby="login-tab">
                        <form onsubmit="Auth._handleLogin(event)">
                          <div class="mb-3">
                            <label for="login-email" class="form-label text-muted small">Correo electrónico</label>
                            <input type="email" class="form-control custom-input" id="login-email" required autocomplete="email">
                          </div>
                          <div class="mb-3">
                            <label for="login-password" class="form-label text-muted small">Contraseña</label>
                            <input type="password" class="form-control custom-input" id="login-password" required autocomplete="current-password" minlength="6">
                          </div>
                          <div id="login-error" class="text-danger small mb-2 d-none" role="alert"></div>
                          <button type="submit" class="btn-primary-custom w-100 shadow-sm" style="padding:12px 24px;">ENTRAR</button>
                        </form>
                        <p class="text-center text-muted small mt-3 mb-0">¿No tienes cuenta? <a href="#" onclick="Auth._switchTab('register');return false;" style="color:var(--gold);">Regístrate</a></p>
                      </div>
                      <div class="tab-pane fade" id="registerForm" role="tabpanel" aria-labelledby="register-tab">
                        <form onsubmit="Auth._handleRegister(event)">
                          <div class="mb-3">
                            <label for="reg-name" class="form-label text-muted small">Nombre completo</label>
                            <input type="text" class="form-control custom-input" id="reg-name" required autocomplete="name">
                          </div>
                          <div class="mb-3">
                            <label for="reg-email" class="form-label text-muted small">Correo electrónico</label>
                            <input type="email" class="form-control custom-input" id="reg-email" required autocomplete="email">
                          </div>
                          <div class="mb-3">
                            <label for="reg-password" class="form-label text-muted small">Contraseña (mín. 6 caracteres)</label>
                            <input type="password" class="form-control custom-input" id="reg-password" required autocomplete="new-password" minlength="6">
                          </div>
                          <div id="register-error" class="text-danger small mb-2 d-none" role="alert"></div>
                          <div id="register-success" class="text-success small mb-2 d-none" role="alert"></div>
                          <button type="submit" class="btn-primary-custom w-100 shadow-sm" style="padding:12px 24px;">REGISTRARSE</button>
                        </form>
                        <p class="text-center text-muted small mt-3 mb-0">¿Ya tienes cuenta? <a href="#" onclick="Auth._switchTab('login');return false;" style="color:var(--gold);">Inicia sesión</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal fade" id="adminModal" tabindex="-1" aria-labelledby="adminModalTitle" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content" style="border-radius:8px;border:none;">
                  <div class="modal-header border-0">
                    <h5 class="mb-0" id="adminModalTitle" style="font-family:'Playfair Display',serif;color:var(--brown);">Panel de Administración</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                  </div>
                  <div class="modal-body px-4 py-3">
                    <ul class="nav nav-tabs mb-3" id="adminTabs" role="tablist" style="border-color:#f0e9df;">
                      <li class="nav-item" role="presentation">
                        <button class="nav-link auth-tab active" id="orders-tab" data-bs-toggle="tab" data-bs-target="#adminOrders" type="button" role="tab" aria-controls="adminOrders" aria-selected="true">Pedidos</button>
                      </li>
                      <li class="nav-item" role="presentation">
                        <button class="nav-link auth-tab" id="users-tab" data-bs-toggle="tab" data-bs-target="#adminUsers" type="button" role="tab" aria-controls="adminUsers" aria-selected="false">Usuarios</button>
                      </li>
                    </ul>
                    <div class="tab-content">
                      <div class="tab-pane fade show active" id="adminOrders" role="tabpanel" aria-labelledby="orders-tab">
                        <div id="admin-orders-list"><p class="text-muted text-center py-3">Cargando pedidos...</p></div>
                      </div>
                      <div class="tab-pane fade" id="adminUsers" role="tabpanel" aria-labelledby="users-tab">
                        <div id="admin-users-list"><p class="text-muted text-center py-3">Cargando usuarios...</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
            Array.from(div.children).forEach(child => document.body.appendChild(child));
        }
    },

    async _handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        const result = await this.login(email, password);
        if (result.ok) {
            try { bootstrap.Modal.getInstance(document.getElementById('authModal')).hide(); } catch(e) {}
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
            errorEl.classList.add('d-none');
            const toast = document.getElementById('toast');
            if (toast) { toast.textContent = '✓ Bienvenido, ' + result.user.nombre; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
        } else {
            errorEl.textContent = result.error;
            errorEl.classList.remove('d-none');
        }
    },

    async _handleRegister(event) {
        event.preventDefault();
        const nombre = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const errorEl = document.getElementById('register-error');
        const successEl = document.getElementById('register-success');
        if (password.length < 6) {
            errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres';
            errorEl.classList.remove('d-none');
            successEl.classList.add('d-none');
            return;
        }
        const result = await this.register(nombre, email, password);
        if (result.ok) {
            errorEl.classList.add('d-none');
            successEl.textContent = '✓ Registro exitoso. Ahora puedes iniciar sesión.';
            successEl.classList.remove('d-none');
            document.getElementById('reg-name').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-password').value = '';
            setTimeout(() => this._switchTab('login'), 1200);
        } else {
            successEl.classList.add('d-none');
            errorEl.textContent = result.error;
            errorEl.classList.remove('d-none');
        }
    },

    openModal() {
        const el = document.getElementById('authModal');
        if (el && bootstrap.Modal) bootstrap.Modal.getOrCreateInstance(el).show();
    },

    openAdmin() {
        window.location.href = '/admin/admin.html';
    },

    async _loadAdminData() {
        const ordersList = document.getElementById('admin-orders-list');
        const usersList = document.getElementById('admin-users-list');

        if (ordersList) {
            try {
                const orders = await API.get('/pedidos/all');
                if (!orders || orders.length === 0) {
                    ordersList.innerHTML = '<p class="text-muted text-center py-3">No hay pedidos registrados</p>';
                } else {
                    ordersList.innerHTML = orders.reverse().map(o => `
                        <div class="border-bottom mb-2 pb-2" style="border-color:#f0e9df!important;">
                            <div class="d-flex justify-content-between">
                                <strong>${o.cliente}</strong>
                                <span class="text-muted small">${new Date(o.fecha).toLocaleDateString('es-PE')}</span>
                            </div>
                            <div class="text-muted small">${o.email} ${o.telefono ? '· ' + o.telefono : ''}</div>
                            ${o.direccion ? '<div class="text-muted small">📍 ' + o.direccion + '</div>' : ''}
                            ${o.fechaEvento ? '<div class="text-muted small">📅 Evento: ' + new Date(o.fechaEvento + 'T12:00:00').toLocaleDateString('es-PE') + '</div>' : ''}
                            ${o.notas ? '<div class="text-muted small" style="font-style:italic;">📝 ' + o.notas + '</div>' : ''}
                            <div class="small mt-1">${o.items.map(i => i.nombre).join(', ')}</div>
                            <div style="color:var(--gold);font-weight:bold;">S/ ${Number(o.total).toFixed(2)}</div>
                        </div>
                    `).join('');
                }
            } catch (e) {
                ordersList.innerHTML = '<p class="text-muted text-center py-3">Error al cargar pedidos</p>';
            }
        }

        if (usersList) {
            try {
                const users = await API.get('/auth/users');
                usersList.innerHTML = users.map(u => `
                    <div class="border-bottom mb-2 pb-2 d-flex justify-content-between align-items-center" style="border-color:#f0e9df!important;">
                        <div><strong>${u.nombre}</strong><div class="text-muted small">${u.email}</div></div>
                        <span class="badge" style="background-color:${u.rol==='admin'?'var(--gold)':'#e2dcd5'};color:${u.rol==='admin'?'white':'var(--brown)'};">${u.rol}</span>
                    </div>
                `).join('');
            } catch (e) {
                usersList.innerHTML = '<p class="text-muted text-center py-3">Error al cargar usuarios</p>';
            }
        }
    },

    _switchTab(tab) {
        const trigger = document.getElementById(tab === 'register' ? 'register-tab' : 'login-tab');
        if (trigger && bootstrap.Tab) {
            bootstrap.Tab.getOrCreateInstance(trigger).show();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Auth._injectModals();
    Auth._updateUI();
});
