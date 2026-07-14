const Admin = {
  currentSection: 'dashboard',

  async init() {
    if (!Auth.isAdmin()) {
      window.location.href = '/';
      return;
    }
    const user = Auth.getUser();
    document.getElementById('adminUserName').textContent = user.nombre;

    document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchSection(link.dataset.section);
      });
    });

    await this.loadDashboard();
  },

  switchSection(section) {
    this.currentSection = section;
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-link[data-section]').forEach(l => l.classList.remove('active'));

    const sec = document.getElementById('sec-' + section);
    if (sec) sec.classList.add('active');

    const link = document.querySelector(`.sidebar-link[data-section="${section}"]`);
    if (link) link.classList.add('active');

    const titles = {
      dashboard: 'Dashboard',
      productos: 'Productos',
      categorias: 'Categorías',
      pedidos: 'Pedidos',
      usuarios: 'Usuarios',
      resenas: 'Reseñas',
      contactos: 'Contactos',
    };
    document.getElementById('sectionTitle').textContent = titles[section] || section;

    const loaders = {
      dashboard: () => this.loadDashboard(),
      productos: () => this.loadProductos(),
      categorias: () => this.loadCategorias(),
      pedidos: () => this.loadPedidos(),
      usuarios: () => this.loadUsuarios(),
      resenas: () => this.loadResenas(),
      contactos: () => this.loadContactos(),
    };
    if (loaders[section]) loaders[section]();
  },

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  },

  logout() {
    Auth.logout();
    window.location.href = '/';
  },

  // ─── DASHBOARD ──────────────────────────────────────────────
  async loadDashboard() {
    try {
      const data = await API.get('/stats/dashboard');
      const d = data.dashboard;

      document.getElementById('dashboardCards').innerHTML = `
        <div class="col-6 col-md-3"><div class="dashboard-stat success">
          <div class="stat-icon">💰</div>
          <div class="stat-value">S/ ${d.ingresosMes.toLocaleString()}</div>
          <div class="stat-label">Ingresos (30d)</div>
        </div></div>
        <div class="col-6 col-md-3"><div class="dashboard-stat info">
          <div class="stat-icon">📦</div>
          <div class="stat-value">${d.pedidosMes}</div>
          <div class="stat-label">Pedidos (30d)</div>
        </div></div>
        <div class="col-6 col-md-3"><div class="dashboard-stat warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-value">${d.pedidosPendientes}</div>
          <div class="stat-label">Pendientes</div>
        </div></div>
        <div class="col-6 col-md-3"><div class="dashboard-stat danger">
          <div class="stat-icon">⚠️</div>
          <div class="stat-value">${d.stockBajo}</div>
          <div class="stat-label">Stock Bajo</div>
        </div></div>
      `;

      document.getElementById('chartEstados').innerHTML = `
        <div class="d-flex flex-column gap-2 mt-2">
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge-admin pendiente">Pendiente</span>
            <span>${d.pedidosPendientes}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="small text-muted">Productos</span><span>${d.productos}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="small text-muted">Usuarios</span><span>${d.usuarios}</span>
          </div>
        </div>
      `;

      document.getElementById('chartResumen').innerHTML = `
        <div class="d-flex flex-column gap-2 mt-2">
          <div class="d-flex justify-content-between">
            <span class="small text-muted">Reseñas</span><span>${d.resenasTotal} (${d.resenasPromedio} ⭐)</span>
          </div>
          <div class="d-flex justify-content-between">
            <span class="small text-muted">Contactos sin leer</span><span class="stock-low">${d.contactosNoLeidos}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span class="small text-muted">Ingresos totales</span><span>S/ ${d.ingresosTotales.toLocaleString()}</span>
          </div>
        </div>
      `;
    } catch (e) {
      console.error('Error dashboard:', e);
    }
  },

  // ─── PRODUCTOS ──────────────────────────────────────────────
  async loadProductos() {
    try {
      const data = await API.get('/productos');
      const rows = document.getElementById('productosTable');
      if (!data.productos || data.productos.length === 0) {
        rows.innerHTML = '<tr><td colspan="8" class="empty-state">No hay productos</td></tr>';
        return;
      }
      rows.innerHTML = data.productos.map(p => `
        <tr>
          <td>${p.id}</td>
          <td><strong>${p.nombre}</strong></td>
          <td>${p.estilo}</td>
          <td>${p.tamaño}</td>
          <td>S/ ${Number(p.precio).toFixed(2)}</td>
          <td class="${p.stock <= 3 ? 'stock-low' : 'stock-ok'}">${p.stock}</td>
          <td>${p.categoria_nombre || '-'}</td>
          <td>
            <button class="btn-action" onclick="Admin.editProduct(${p.id})">✏️</button>
            <button class="btn-action danger" onclick="Admin.deleteProduct(${p.id}, '${p.nombre.replace(/'/g, "\\'")}')">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loadProductos:', e);
    }
  },

  async showProductForm(product = null) {
    const categorias = await API.get('/categorias');
    const catOpts = (categorias.categorias || []).map(c =>
      `<option value="${c.id}" ${product && product.categoria_id == c.id ? 'selected' : ''}>${c.nombre}</option>`
    ).join('');

    document.getElementById('adminModalContent').innerHTML = `
      <div class="modal-body-form">
        <h5>${product ? 'Editar Producto' : 'Nuevo Producto'}</h5>
        <form onsubmit="Admin.saveProduct(event, ${product ? product.id : 'null'})">
          <div class="mb-3">
            <label>Nombre</label>
            <input type="text" class="form-control" name="nombre" required value="${product ? product.nombre : ''}">
          </div>
          <div class="mb-3">
            <label>Descripción</label>
            <textarea class="form-control" name="descripcion" rows="3" required>${product ? product.descripcion : ''}</textarea>
          </div>
          <div class="row mb-3">
            <div class="col">
              <label>Precio (S/)</label>
              <input type="number" class="form-control" name="precio" step="0.01" min="0" required value="${product ? product.precio : ''}">
            </div>
            <div class="col">
              <label>Stock</label>
              <input type="number" class="form-control" name="stock" min="0" required value="${product ? product.stock : '0'}">
            </div>
          </div>
          <div class="row mb-3">
            <div class="col">
              <label>Estilo</label>
              <input type="text" class="form-control" name="estilo" required value="${product ? product.estilo : ''}">
            </div>
            <div class="col">
              <label>Tamaño</label>
              <select class="form-select" name="tamaño" required>
                <option value="pequeno" ${product && product.tamaño === 'pequeno' ? 'selected' : ''}>Pequeño</option>
                <option value="mediano" ${product && product.tamaño === 'mediano' ? 'selected' : ''}>Mediano</option>
                <option value="grande" ${product && product.tamaño === 'grande' ? 'selected' : ''}>Grande</option>
              </select>
            </div>
          </div>
          <div class="mb-3">
            <label>URL Imagen</label>
            <input type="url" class="form-control" name="imagen_url" required value="${product ? product.imagen_url : ''}">
          </div>
          <div class="mb-3">
            <label>Categoría</label>
            <select class="form-select" name="categoria_id">
              <option value="">Sin categoría</option>
              ${catOpts}
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn-primary-admin">${product ? 'Guardar Cambios' : 'Crear Producto'}</button>
          </div>
        </form>
      </div>
    `;
    new bootstrap.Modal(document.getElementById('adminModal')).show();
  },

  async editProduct(id) {
    const data = await API.get('/productos/' + id);
    this.showProductForm(data.producto);
  },

  async saveProduct(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = {
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      precio: parseFloat(form.precio.value),
      stock: parseInt(form.stock.value),
      estilo: form.estilo.value,
      tamaño: form.tamaño.value,
      imagen_url: form.imagen_url.value,
      categoria_id: form.categoria_id.value ? parseInt(form.categoria_id.value) : null,
    };

    try {
      if (id) {
        await API.put('/productos/' + id, body);
        this.toast('Producto actualizado');
      } else {
        await API.post('/productos', body);
        this.toast('Producto creado');
      }
      bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
      this.loadProductos();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  async deleteProduct(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await API.delete('/productos/' + id);
      this.toast('Producto eliminado');
      this.loadProductos();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  // ─── CATEGORÍAS ─────────────────────────────────────────────
  async loadCategorias() {
    try {
      const data = await API.get('/categorias');
      const rows = document.getElementById('categoriasTable');
      if (!data.categorias || data.categorias.length === 0) {
        rows.innerHTML = '<tr><td colspan="4" class="empty-state">No hay categorías</td></tr>';
        return;
      }
      rows.innerHTML = data.categorias.map(c => `
        <tr>
          <td>${c.id}</td>
          <td><strong>${c.nombre}</strong></td>
          <td>${c.slug}</td>
          <td>
            <button class="btn-action" onclick="Admin.editCategory(${c.id}, '${c.nombre.replace(/'/g, "\\'")}', '${c.slug}')">✏️</button>
            <button class="btn-action danger" onclick="Admin.deleteCategory(${c.id}, '${c.nombre.replace(/'/g, "\\'")}')">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loadCategorias:', e);
    }
  },

  showCategoryForm(cat = null) {
    document.getElementById('adminModalContent').innerHTML = `
      <div class="modal-body-form">
        <h5>${cat ? 'Editar Categoría' : 'Nueva Categoría'}</h5>
        <form onsubmit="Admin.saveCategory(event, ${cat ? cat.id : 'null'})">
          <div class="mb-3">
            <label>Nombre</label>
            <input type="text" class="form-control" name="nombre" required value="${cat ? cat.nombre : ''}">
          </div>
          <div class="mb-3">
            <label>Slug</label>
            <input type="text" class="form-control" name="slug" required value="${cat ? cat.slug : ''}">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn-primary-admin">${cat ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    `;
    new bootstrap.Modal(document.getElementById('adminModal')).show();
  },

  editCategory(id, nombre, slug) {
    this.showCategoryForm({ id, nombre, slug });
  },

  async saveCategory(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = { nombre: form.nombre.value, slug: form.slug.value };

    try {
      if (id) {
        await API.put('/categorias/' + id, body);
        this.toast('Categoría actualizada');
      } else {
        await API.post('/categorias', body);
        this.toast('Categoría creada');
      }
      bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
      this.loadCategorias();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  async deleteCategory(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await API.delete('/categorias/' + id);
      this.toast('Categoría eliminada');
      this.loadCategorias();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  // ─── PEDIDOS ────────────────────────────────────────────────
  async loadPedidos() {
    try {
      const data = await API.get('/pedidos/all');
      const rows = document.getElementById('pedidosTable');
      if (!data.pedidos || data.pedidos.length === 0) {
        rows.innerHTML = '<tr><td colspan="8" class="empty-state">No hay pedidos</td></tr>';
        return;
      }
      rows.innerHTML = data.pedidos.map(p => {
        const items = (p.items || []).map(i => i.nombre).join(', ');
        return `
        <tr>
          <td>${p.id}</td>
          <td><strong>${p.usuario_nombre || 'Anónimo'}</strong></td>
          <td>${p.usuario_email || '-'}</td>
          <td>${items || '-'}</td>
          <td>S/ ${Number(p.total).toFixed(2)}</td>
          <td>
            <select class="form-select form-select-sm" style="width:auto;min-width:120px;" onchange="Admin.updatePedidoEstado(${p.id}, this.value)">
              ${['pendiente','confirmado','en_proceso','enviado','entregado','cancelado'].map(e =>
                `<option value="${e}" ${p.estado === e ? 'selected' : ''}>${e.replace('_', ' ')}</option>`
              ).join('')}
            </select>
          </td>
          <td>${new Date(p.fecha_creacion).toLocaleDateString('es-PE')}</td>
          <td>
            <button class="btn-action danger" onclick="Admin.deletePedido(${p.id})">🗑️</button>
          </td>
        </tr>`;
      }).join('');
    } catch (e) {
      console.error('Error loadPedidos:', e);
    }
  },

  async updatePedidoEstado(id, estado) {
    try {
      await API.patch('/pedidos/' + id + '/estado', { estado });
      this.toast('Estado actualizado a "' + estado.replace('_', ' ') + '"');
    } catch (e) {
      this.toast('Error: ' + e.message);
      this.loadPedidos();
    }
  },

  async deletePedido(id) {
    if (!confirm('¿Eliminar este pedido? Se restaurará el stock.')) return;
    try {
      await API.delete('/pedidos/' + id);
      this.toast('Pedido eliminado');
      this.loadPedidos();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  // ─── USUARIOS ───────────────────────────────────────────────
  async loadUsuarios() {
    try {
      const data = await API.get('/auth/users');
      const rows = document.getElementById('usuariosTable');
      if (!data.users || data.users.length === 0) {
        rows.innerHTML = '<tr><td colspan="6" class="empty-state">No hay usuarios</td></tr>';
        return;
      }
      rows.innerHTML = data.users.map(u => `
        <tr>
          <td>${u.id}</td>
          <td><strong>${u.nombre}</strong></td>
          <td>${u.email}</td>
          <td><span class="badge-admin ${u.rol}">${u.rol}</span></td>
          <td>${new Date(u.creado_en).toLocaleDateString('es-PE')}</td>
          <td>
            <button class="btn-action" onclick="Admin.editUser(${u.id}, '${u.nombre.replace(/'/g, "\\'")}', '${u.email}', '${u.rol}')">✏️</button>
            <button class="btn-action danger" onclick="Admin.deleteUser(${u.id}, '${u.nombre.replace(/'/g, "\\'")}')">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loadUsuarios:', e);
    }
  },

  showUserForm(user = null) {
    document.getElementById('adminModalContent').innerHTML = `
      <div class="modal-body-form">
        <h5>${user ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
        <form onsubmit="Admin.saveUser(event, ${user ? user.id : 'null'})">
          <div class="mb-3">
            <label>Nombre</label>
            <input type="text" class="form-control" name="nombre" required value="${user ? user.nombre : ''}">
          </div>
          <div class="mb-3">
            <label>Email</label>
            <input type="email" class="form-control" name="email" required value="${user ? user.email : ''}">
          </div>
          <div class="mb-3">
            <label>${user ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label>
            <input type="password" class="form-control" name="password" ${user ? '' : 'required minlength="6"'}>
          </div>
          <div class="mb-3">
            <label>Rol</label>
            <select class="form-select" name="rol" required>
              <option value="cliente" ${user && user.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
              <option value="admin" ${user && user.rol === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn-primary-admin">${user ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    `;
    new bootstrap.Modal(document.getElementById('adminModal')).show();
  },

  editUser(id, nombre, email, rol) {
    this.showUserForm({ id, nombre, email, rol });
  },

  async saveUser(e, id) {
    e.preventDefault();
    const form = e.target;
    const body = {
      nombre: form.nombre.value,
      email: form.email.value,
      rol: form.rol.value,
    };
    if (form.password.value) body.password = form.password.value;

    try {
      if (id) {
        await API.put('/auth/users/' + id, body);
        this.toast('Usuario actualizado');
      } else {
        if (!body.password) { this.toast('La contraseña es obligatoria'); return; }
        await API.post('/auth/users', body);
        this.toast('Usuario creado');
      }
      bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
      this.loadUsuarios();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  async deleteUser(id, nombre) {
    if (!confirm(`¿Eliminar al usuario "${nombre}"?`)) return;
    try {
      await API.delete('/auth/users/' + id);
      this.toast('Usuario eliminado');
      this.loadUsuarios();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  // ─── RESEÑAS ────────────────────────────────────────────────
  async loadResenas() {
    try {
      const data = await API.get('/resenas');
      const rows = document.getElementById('resenasTable');
      if (!data.resenas || data.resenas.length === 0) {
        rows.innerHTML = '<tr><td colspan="6" class="empty-state">No hay reseñas</td></tr>';
        return;
      }
      rows.innerHTML = data.resenas.map(r => `
        <tr>
          <td>${r.id}</td>
          <td><strong>${r.nombre}</strong></td>
          <td>${r.texto.substring(0, 60)}${r.texto.length > 60 ? '...' : ''}</td>
          <td class="stars">${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}</td>
          <td>${new Date(r.creado_en).toLocaleDateString('es-PE')}</td>
          <td>
            <button class="btn-action danger" onclick="Admin.deleteResena(${r.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loadResenas:', e);
    }
  },

  async deleteResena(id) {
    if (!confirm('¿Eliminar esta reseña?')) return;
    try {
      await API.delete('/resenas/' + id);
      this.toast('Reseña eliminada');
      this.loadResenas();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  // ─── CONTACTOS ──────────────────────────────────────────────
  async loadContactos() {
    try {
      const data = await API.get('/contactos');
      const rows = document.getElementById('contactosTable');
      if (!data.contactos || data.contactos.length === 0) {
        rows.innerHTML = '<tr><td colspan="7" class="empty-state">No hay contactos</td></tr>';
        return;
      }
      rows.innerHTML = data.contactos.map(c => `
        <tr>
          <td>${c.id}</td>
          <td><strong>${c.nombre}</strong></td>
          <td>${c.email}</td>
          <td>${c.mensaje.substring(0, 50)}${c.mensaje.length > 50 ? '...' : ''}</td>
          <td>
            <button class="btn-action" onclick="Admin.toggleLeido(${c.id})">
              <span class="badge-admin ${c.leido ? 'leido' : 'no-leido'}">${c.leido ? 'Leído' : 'Sin leer'}</span>
            </button>
          </td>
          <td>${new Date(c.creado_en).toLocaleDateString('es-PE')}</td>
          <td>
            <button class="btn-action danger" onclick="Admin.deleteContacto(${c.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loadContactos:', e);
    }
  },

  async toggleLeido(id) {
    try {
      await API.patch('/contactos/' + id + '/leido');
      this.toast('Estado actualizado');
      this.loadContactos();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },

  async deleteContacto(id) {
    if (!confirm('¿Eliminar este contacto?')) return;
    try {
      await API.delete('/contactos/' + id);
      this.toast('Contacto eliminado');
      this.loadContactos();
    } catch (e) {
      this.toast('Error: ' + e.message);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
