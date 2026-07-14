const MyOrders = {
    _statuses: {
        pendiente: { label: 'Pendiente', color: '#856404', bg: '#fff3cd', icon: '⏳' },
        confirmado: { label: 'Confirmado', color: '#004085', bg: '#cce5ff', icon: '✅' },
        en_proceso: { label: 'En Proceso', color: '#155724', bg: '#d4edda', icon: '🔄' },
        enviado: { label: 'Enviado', color: '#563d7c', bg: '#e2d5f1', icon: '🚚' },
        entregado: { label: 'Entregado', color: '#155724', bg: '#d4edda', icon: '📦' },
        cancelado: { label: 'Cancelado', color: '#721c24', bg: '#f8d7da', icon: '❌' }
    },

    open() {
        const user = Auth.getUser();
        if (!user) {
            Auth.openModal();
            return;
        }
        this._inject();
        this._render();
        new bootstrap.Modal(document.getElementById('myOrdersModal')).show();
    },

    _inject() {
        if (document.getElementById('myOrdersModal')) return;
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="modal fade" id="myOrdersModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content" style="border-radius:12px;border:none;">
              <div class="modal-header border-0 pb-0">
                <h5 style="font-family:'Playfair Display',serif;color:#4d3e35;">Mis Pedidos</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body" id="myOrders-body" style="max-height:70vh;overflow-y:auto;"></div>
            </div>
          </div>
        </div>`;
        Array.from(div.children).forEach(c => document.body.appendChild(c));
    },

    _render() {
        const user = Auth.getUser();
        const el = document.getElementById('myOrders-body');
        const orders = Auth.getOrders().filter(o => o.usuario_id === user.id).sort((a, b) => b.id - a.id);

        if (!orders.length) {
            el.innerHTML = `
            <div class="text-center py-5">
                <div style="font-size:3rem;margin-bottom:12px;">📦</div>
                <p class="text-muted" style="font-size:0.95rem;">Aún no tienes pedidos</p>
                <small class="text-muted">Explora nuestro catálogo y realiza tu primer pedido</small>
            </div>`;
            return;
        }

        el.innerHTML = orders.map(o => {
            const st = this._statuses[o.estado] || this._statuses.pendiente;
            const canCancel = ['pendiente', 'confirmado'].includes(o.estado);
            const items = (o.items || []).map(i => `<div style="font-size:0.85rem;color:#6b5c50;">• ${i.nombre} <span style="color:#9c8470;">S/ ${Number(i.precio || 0).toFixed(2)}</span></div>`).join('');

            const timeline = this._buildTimeline(o.estado);

            return `
            <div class="order-card">
              <div class="order-card-header">
                <div>
                  <strong style="color:#4d3e35;">Pedido #${o.id}</strong>
                  <span style="color:#9c8470;font-size:0.8rem;margin-left:8px;">${o.fecha || '—'}</span>
                </div>
                <span class="order-status-badge" style="background:${st.bg};color:${st.color};">
                  ${st.icon} ${st.label}
                </span>
              </div>
              <div class="order-card-body">
                ${items}
                ${o.direccion ? `<div style="font-size:0.8rem;color:#9c8470;margin-top:8px;">📍 ${o.direccion}</div>` : ''}
                ${o.fechaEvento ? `<div style="font-size:0.8rem;color:#9c8470;">📅 Evento: ${o.fechaEvento}</div>` : ''}
              </div>
              <div class="order-card-footer">
                <div class="order-total">S/ ${Number(o.total || 0).toFixed(2)}</div>
                <div class="order-actions">
                  ${canCancel ? `<button class="order-btn-cancel" onclick="MyOrders._cancelOrder(${o.id})">Cancelar pedido</button>` : ''}
                </div>
              </div>
              <div class="order-timeline">${timeline}</div>
            </div>`;
        }).join('');
    },

    _buildTimeline(currentStatus) {
        const steps = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado'];
        const currentIdx = steps.indexOf(currentStatus);
        const isCancelled = currentStatus === 'cancelado';

        if (isCancelled) {
            return `<div class="timeline-cancelled">❌ Este pedido fue cancelado</div>`;
        }

        return `<div class="timeline-steps">
            ${steps.map((s, i) => {
                const st = this._statuses[s];
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return `<div class="timeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
                    <div class="timeline-dot" style="${done ? 'background:' + st.color + ';border-color:' + st.color : ''}">${done ? '✓' : ''}</div>
                    <span>${st.label}</span>
                </div>`;
            }).join('<div class="timeline-line"></div>')}
        </div>`;
    },

    _cancelOrder(id) {
        const order = Auth.getOrderById(id);
        if (!order) return;
        if (!confirm('¿Estás seguro de que deseas cancelar el pedido #' + id + '?')) return;

        const result = Auth.updateOrder(id, { estado: 'cancelado' });
        if (result.ok) {
            this._render();
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = 'Pedido #' + id + ' cancelado';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        }
    }
};
