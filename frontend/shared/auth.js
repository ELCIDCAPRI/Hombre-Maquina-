const Auth = {
    _key: 'ts_auth',
    _usersKey: 'ts_users',
    _ordersKey: 'ts_orders',
    _reviewsKey: 'ts_reviews',
    _contactsKey: 'ts_contacts',

    _seedUsers: [
        { id: 1, nombre: 'Administrador', email: 'admin@gmail.com', password: 'admin123', rol: 'admin' },
        { id: 2, nombre: 'Maria Lopez', email: 'maria@gmail.com', password: 'maria123', rol: 'cliente' },
        { id: 3, nombre: 'Carlos Rodriguez', email: 'carlos@gmail.com', password: 'carlos123', rol: 'cliente' },
        { id: 4, nombre: 'Ana Garcia', email: 'ana@gmail.com', password: 'ana123', rol: 'cliente' },
        { id: 5, nombre: 'Pedro Sanchez', email: 'pedro@gmail.com', password: 'pedro123', rol: 'cliente' },
        { id: 6, nombre: 'Lucia Fernandez', email: 'lucia@gmail.com', password: 'lucia123', rol: 'cliente' },
        { id: 7, nombre: 'Miguel Torres', email: 'miguel@gmail.com', password: 'miguel123', rol: 'cliente' },
        { id: 8, nombre: 'Sofia Ramirez', email: 'sofia@gmail.com', password: 'sofia123', rol: 'cliente' }
    ],

    _seedOrders: [
        { id: 1, usuario_id: 2, items: [{nombre:'Elegancia Blanca', precio:450}], total: 450, estado: 'entregado', fecha: '2026-06-01', cliente: 'Maria Lopez', email: 'maria@gmail.com', telefono: '999111222', direccion: 'Av. Javier Prado 123, San Isidro' },
        { id: 2, usuario_id: 3, items: [{nombre:'Cascada de Rosas', precio:1200}], total: 1200, estado: 'entregado', fecha: '2026-06-10', cliente: 'Carlos Rodriguez', email: 'carlos@gmail.com', telefono: '988222333', direccion: 'Jr. de la Unión 456, Cercado' },
        { id: 3, usuario_id: 4, items: [{nombre:'Encanto Botanico', precio:850}], total: 850, estado: 'confirmado', fecha: '2026-07-01', cliente: 'Ana Garcia', email: 'ana@gmail.com', telefono: '977333444', direccion: 'Calle Los Olivos 789, Miraflores' },
        { id: 4, usuario_id: 5, items: [{nombre:'Delicia de Chocolate', precio:890}], total: 890, estado: 'pendiente', fecha: '2026-07-10', cliente: 'Pedro Sanchez', email: 'pedro@gmail.com', telefono: '966444555', direccion: 'Av. La Marina 321, San Miguel' },
        { id: 5, usuario_id: 6, items: [{nombre:'Romance Rustico', precio:380},{nombre:'Ilusion Floral', precio:650}], total: 1030, estado: 'en_proceso', fecha: '2026-07-12', cliente: 'Lucia Fernandez', email: 'lucia@gmail.com', telefono: '955555666', direccion: 'Calle Belen 654, Breña' },
        { id: 6, usuario_id: 2, items: [{nombre:'Lujo Dorado', precio:2500}], total: 2500, estado: 'enviado', fecha: '2026-07-13', cliente: 'Maria Lopez', email: 'maria@gmail.com', telefono: '999111222', direccion: 'Av. Javier Prado 123, San Isidro' },
        { id: 7, usuario_id: 7, items: [{nombre:'Boho Dulzura', precio:720}], total: 720, estado: 'pendiente', fecha: '2026-07-14', cliente: 'Miguel Torres', email: 'miguel@gmail.com', telefono: '944666777', direccion: 'Jr. Carabaya 987, Cercado' }
    ],

    _seedReviews: [
        { id: 1, usuario_id: 2, nombre: 'Maria Lopez', texto: 'El pastel Encanto Botanico fue ESPECTACULAR. Todos los invitados quedaron encantados.', calificacion: 5, fecha: '2026-06-05' },
        { id: 2, usuario_id: 3, nombre: 'Carlos Rodriguez', texto: 'La Cascada de Rosas supero todas nuestras expectativas. El pan de oro le dio elegancia.', calificacion: 5, fecha: '2026-06-15' },
        { id: 3, usuario_id: 4, nombre: 'Ana Garcia', texto: 'El pastel fue perfecto para nuestro aniversario. Fondant suizo delicioso.', calificacion: 5, fecha: '2026-07-02' },
        { id: 4, usuario_id: 5, nombre: 'Pedro Sanchez', texto: 'Buen pastel, bonita presentación. El tiempo de entrega fue un poco largo.', calificacion: 4, fecha: '2026-07-11' },
        { id: 5, usuario_id: 6, nombre: 'Lucia Fernandez', texto: 'La Ilusion Floral es una obra de arte. Servicio excepcional.', calificacion: 5, fecha: '2026-07-13' }
    ],

    _seedContacts: [
        { id: 1, nombre: 'Andrea Morales', email: 'andrea@gmail.com', mensaje: 'Hola, me gustaria hacer un pedido para mi boda en septiembre.', leido: true, fecha: '2026-06-20' },
        { id: 2, nombre: 'Roberto Diaz', email: 'roberto@gmail.com', mensaje: 'Necesito informacion sobre precios para un pastel de 3 pisos.', leido: true, fecha: '2026-06-25' },
        { id: 3, nombre: 'Camila Vargas', email: 'camila@gmail.com', mensaje: 'Es posible hacer un pastel personalizado?', leido: false, fecha: '2026-07-01' },
        { id: 4, nombre: 'Jorge Castillo', email: 'jorge@gmail.com', mensaje: 'Pedido urgente para este fin de semana. 50 personas.', leido: false, fecha: '2026-07-10' },
        { id: 5, nombre: 'Fernando Reyes', email: 'fernando@gmail.com', mensaje: 'Tienen opciones sin gluten?', leido: false, fecha: '2026-07-13' }
    ],

    init() {
        const seed = (key, data) => {
            const raw = localStorage.getItem(key);
            let arr = [];
            try { arr = JSON.parse(raw); } catch(e) {}
            if (!raw || !Array.isArray(arr) || arr.length === 0) {
                localStorage.setItem(key, JSON.stringify(data));
            }
        };
        seed(this._usersKey, this._seedUsers);
        seed(this._ordersKey, this._seedOrders);
        seed(this._reviewsKey, this._seedReviews);
        seed(this._contactsKey, this._seedContacts);
    },

    _getUsers() {
        return JSON.parse(localStorage.getItem(this._usersKey) || '[]');
    },

    _saveUsers(users) {
        localStorage.setItem(this._usersKey, JSON.stringify(users));
    },

    async register(nombre, email, password) {
        const trimmed = email.trim().toLowerCase();
        const users = this._getUsers();
        if (users.find(u => u.email === trimmed)) {
            return { ok: false, error: 'Este correo ya está registrado' };
        }
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            nombre: nombre.trim(), email: trimmed, password: password, rol: 'cliente'
        };
        users.push(newUser);
        this._saveUsers(users);
        return { ok: true, user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, rol: newUser.rol } };
    },

    async login(email, password) {
        const trimmed = email.trim().toLowerCase();
        const users = this._getUsers();
        const user = users.find(u => u.email === trimmed && u.password === password);
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

    // --- CRUD Users ---

    createUser(nombre, email, password, rol) {
        const trimmed = email.trim().toLowerCase();
        const users = this._getUsers();
        if (users.find(u => u.email === trimmed)) {
            return { ok: false, error: 'Este correo ya existe' };
        }
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            nombre: nombre.trim(), email: trimmed, password: password, rol: rol || 'cliente'
        };
        users.push(newUser);
        this._saveUsers(users);
        return { ok: true, user: newUser };
    },

    updateUser(id, data) {
        const users = this._getUsers();
        const user = users.find(u => u.id === id);
        if (!user) return { ok: false, error: 'Usuario no encontrado' };
        if (data.email) {
            const trimmed = data.email.trim().toLowerCase();
            const exists = users.find(u => u.email === trimmed && u.id !== id);
            if (exists) return { ok: false, error: 'El correo ya está en uso' };
            user.email = trimmed;
        }
        if (data.nombre) user.nombre = data.nombre.trim();
        if (data.password) user.password = data.password;
        if (data.rol) user.rol = data.rol;
        this._saveUsers(users);
        return { ok: true, user: user };
    },

    deleteUser(id) {
        const users = this._getUsers().filter(u => u.id !== id);
        this._saveUsers(users);
    },

    getAllUsers() {
        return this._getUsers().map(u => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, password: u.password }));
    },

    getUserById(id) {
        return this._getUsers().find(u => u.id === id) || null;
    },

    createAdmin(nombre, email, password) {
        return this.createUser(nombre, email, password, 'admin');
    },

    updateUserRole(id, newRole) {
        const users = this._getUsers();
        const user = users.find(u => u.id === id);
        if (user) { user.rol = newRole; this._saveUsers(users); }
    },

    // --- Orders ---

    getOrders() {
        return JSON.parse(localStorage.getItem(this._ordersKey) || '[]');
    },

    getOrderById(id) {
        return this.getOrders().find(o => o.id === id) || null;
    },

    updateOrder(id, data) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === id);
        if (!order) return { ok: false, error: 'Pedido no encontrado' };
        if (data.estado) order.estado = data.estado;
        if (data.total !== undefined) order.total = data.total;
        if (data.cliente) order.cliente = data.cliente;
        if (data.telefono) order.telefono = data.telefono;
        if (data.direccion) order.direccion = data.direccion;
        if (data.notas !== undefined) order.notas = data.notas;
        localStorage.setItem(this._ordersKey, JSON.stringify(orders));
        return { ok: true, order: order };
    },

    // --- Reviews ---

    getReviews() {
        return JSON.parse(localStorage.getItem(this._reviewsKey) || '[]');
    },

    // --- Contacts ---

    getContacts() {
        return JSON.parse(localStorage.getItem(this._contactsKey) || '[]');
    },

    markContactRead(id) {
        const contacts = this.getContacts();
        const c = contacts.find(x => x.id === id);
        if (c) { c.leido = true; localStorage.setItem(this._contactsKey, JSON.stringify(contacts)); }
    },

    deleteContact(id) {
        const contacts = this.getContacts().filter(x => x.id !== id);
        localStorage.setItem(this._contactsKey, JSON.stringify(contacts));
    },

    // --- UI ---

    _notify() {
        window.dispatchEvent(new CustomEvent('auth-change', { detail: this.getUser() }));
        this._updateUI();
    },

    _updateUI() {
        const user = this.getUser();
        document.querySelectorAll('.auth-user-name').forEach(el => { el.textContent = user ? user.nombre : ''; });
        document.querySelectorAll('.auth-logged-in').forEach(el => { el.classList.toggle('d-none', !user); });
        document.querySelectorAll('.auth-logged-out').forEach(el => { el.classList.toggle('d-none', !!user); });
        document.querySelectorAll('.auth-admin-link').forEach(el => { el.classList.toggle('d-none', !this.isAdmin()); });
    },

    _injectModals() {
        if (document.getElementById('authModal')) return;
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="modal fade" id="authModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content" style="border-radius:8px;border:none;">
              <div class="modal-header border-0 pb-0">
                <ul class="nav nav-pills w-100 justify-content-center" id="authTabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link auth-tab active" id="login-tab" data-bs-toggle="pill" data-bs-target="#loginForm" type="button" role="tab">Iniciar Sesión</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link auth-tab" id="register-tab" data-bs-toggle="pill" data-bs-target="#registerForm" type="button" role="tab">Registrarse</button>
                  </li>
                </ul>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body px-4 py-3">
                <div class="tab-content">
                  <div class="tab-pane fade show active" id="loginForm" role="tabpanel">
                    <form onsubmit="Auth._handleLogin(event)">
                      <div class="mb-3">
                        <label class="form-label text-muted small">Correo electrónico</label>
                        <input type="email" class="form-control custom-input" id="login-email" required>
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-muted small">Contraseña</label>
                        <input type="password" class="form-control custom-input" id="login-password" required>
                      </div>
                      <div id="login-error" class="text-danger small mb-2 d-none"></div>
                      <button type="submit" class="btn-primary-custom w-100 shadow-sm" style="padding:12px 24px;">ENTRAR</button>
                    </form>
                    <p class="text-center text-muted small mt-3 mb-0">¿No tienes cuenta? <a href="#" onclick="Auth._switchTab('register');return false;" style="color:var(--gold);">Regístrate</a></p>
                  </div>
                  <div class="tab-pane fade" id="registerForm" role="tabpanel">
                    <form onsubmit="Auth._handleRegister(event)">
                      <div class="mb-3">
                        <label class="form-label text-muted small">Nombre completo</label>
                        <input type="text" class="form-control custom-input" id="reg-name" required>
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-muted small">Correo electrónico</label>
                        <input type="email" class="form-control custom-input" id="reg-email" required>
                      </div>
                      <div class="mb-3">
                        <label class="form-label text-muted small">Contraseña</label>
                        <input type="password" class="form-control custom-input" id="reg-password" required minlength="4">
                      </div>
                      <div id="register-error" class="text-danger small mb-2 d-none"></div>
                      <div id="register-success" class="text-success small mb-2 d-none"></div>
                      <button type="submit" class="btn-primary-custom w-100 shadow-sm" style="padding:12px 24px;">REGISTRARSE</button>
                    </form>
                    <p class="text-center text-muted small mt-3 mb-0">¿Ya tienes cuenta? <a href="#" onclick="Auth._switchTab('login');return false;" style="color:var(--gold);">Inicia sesión</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
        Array.from(div.children).forEach(child => document.body.appendChild(child));
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
            if (toast) { toast.textContent = 'Bienvenido, ' + result.user.nombre; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
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
        const result = await this.register(nombre, email, password);
        if (result.ok) {
            errorEl.classList.add('d-none');
            successEl.textContent = 'Registro exitoso. Ahora puedes iniciar sesión.';
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

    _switchTab(tab) {
        const trigger = document.getElementById(tab === 'register' ? 'register-tab' : 'login-tab');
        if (trigger && bootstrap.Tab) bootstrap.Tab.getOrCreateInstance(trigger).show();
    }
};

Auth.init();
document.addEventListener('DOMContentLoaded', () => {
    Auth._injectModals();
    Auth._updateUI();
});
