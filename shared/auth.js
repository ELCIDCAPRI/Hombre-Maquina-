const Auth = {
    _key: 'ts_auth',
    _usersKey: 'ts_users',

    _hash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h |= 0;
        }
        return 'h' + Math.abs(h);
    },

    _getUsers() {
        return JSON.parse(localStorage.getItem(this._usersKey) || '[]');
    },

    _saveUsers(users) {
        localStorage.setItem(this._usersKey, JSON.stringify(users));
    },

    init() {
        if (this._getUsers().length === 0) {
            this._saveUsers([{
                id: 'a1',
                nombre: 'Administrador',
                email: 'admin@tallerdesabores.pe',
                password: this._hash('admin123'),
                rol: 'admin'
            }]);
        }
    },

    register(nombre, email, password) {
        const trimmed = email.trim().toLowerCase();
        if (this._getUsers().find(u => u.email === trimmed)) {
            return { ok: false, error: 'Este correo ya está registrado' };
        }
        const users = this._getUsers();
        users.push({
            id: 'u' + Date.now(),
            nombre: nombre.trim(),
            email: trimmed,
            password: this._hash(password),
            rol: 'cliente'
        });
        this._saveUsers(users);
        return { ok: true };
    },

    login(email, password) {
        const user = this._getUsers().find(u => u.email === email.trim().toLowerCase() && u.password === this._hash(password));
        if (!user) return { ok: false, error: 'Correo o contraseña incorrectos' };
        const session = { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
        localStorage.setItem(this._key, JSON.stringify(session));
        this._notify();
        return { ok: true, user: session };
    },

    logout() {
        localStorage.removeItem(this._key);
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

    getAllUsers() {
        return this._getUsers().map(u => ({
            id: u.id,
            nombre: u.nombre,
            email: u.email,
            rol: u.rol,
            password: undefined
        }));
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

    _handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        const result = this.login(email, password);
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

    _handleRegister(event) {
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
        const result = this.register(nombre, email, password);
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
        const el = document.getElementById('adminModal');
        if (el && bootstrap.Modal) {
            bootstrap.Modal.getOrCreateInstance(el).show();
            if (typeof Cart !== 'undefined' && Cart.getOrders) {
                this._loadAdminData();
            }
        }
    },

    _loadAdminData() {
        const orders = Cart.getOrders ? Cart.getOrders() : [];
        const ordersList = document.getElementById('admin-orders-list');
        if (!ordersList) return;
        if (orders.length === 0) {
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
        const users = this.getAllUsers();
        const usersList = document.getElementById('admin-users-list');
        if (!usersList) return;
        usersList.innerHTML = users.map(u => `
            <div class="border-bottom mb-2 pb-2 d-flex justify-content-between align-items-center" style="border-color:#f0e9df!important;">
                <div><strong>${u.nombre}</strong><div class="text-muted small">${u.email}</div></div>
                <span class="badge" style="background-color:${u.rol==='admin'?'var(--gold)':'#e2dcd5'};color:${u.rol==='admin'?'white':'var(--brown)'};">${u.rol}</span>
            </div>
        `).join('');
    },

    _switchTab(tab) {
        const trigger = document.getElementById(tab === 'register' ? 'register-tab' : 'login-tab');
        if (trigger && bootstrap.Tab) {
            bootstrap.Tab.getOrCreateInstance(trigger).show();
        }
    }
};

Auth.init();
document.addEventListener('DOMContentLoaded', () => {
    Auth._injectModals();
    Auth._updateUI();
});
