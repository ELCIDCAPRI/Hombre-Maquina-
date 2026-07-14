const Cart = {
    _key: 'ts_cart',
    _ordersKey: 'ts_orders',

    getItems() {
        return JSON.parse(localStorage.getItem(this._key) || '[]');
    },

    addItem(item) {
        const items = this.getItems();
        const cartId = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
        items.push({ ...item, cartId });
        localStorage.setItem(this._key, JSON.stringify(items));
        this._notify();
        this._toast('✓ Añadido al carrito');
    },

    removeItem(cartId) {
        const items = this.getItems().filter(i => i.cartId !== cartId);
        localStorage.setItem(this._key, JSON.stringify(items));
        this._notify();
    },

    clear() {
        localStorage.removeItem(this._key);
        this._notify();
    },

    getCount() {
        return this.getItems().length;
    },

    checkout() {
        const items = this.getItems();
        if (items.length === 0) return;

        const user = typeof Auth !== 'undefined' && Auth.getUser ? Auth.getUser() : null;
        if (!user) {
            this._toast('🔒 Debes iniciar sesión para realizar el pedido');
            if (typeof Auth !== 'undefined' && Auth.openModal) {
                Auth.openModal();
            }
            return;
        }

        this._showCheckoutForm(user);
    },

    _showCheckoutForm(user) {
        this._injectCheckoutModal();
        document.getElementById('checkout-nombre').value = user.nombre || '';
        document.getElementById('checkout-email').value = user.email || '';
        document.getElementById('checkout-telefono').value = '';
        document.getElementById('checkout-direccion').value = '';
        document.getElementById('checkout-fecha').value = '';
        document.getElementById('checkout-notas').value = '';
        document.getElementById('checkout-error').classList.add('d-none');

        const modal = document.getElementById('checkoutModal');
        if (bootstrap && bootstrap.Modal) {
            bootstrap.Modal.getOrCreateInstance(modal).show();
        }
    },

    _injectCheckoutModal() {
        if (document.getElementById('checkoutModal')) return;

        const div = document.createElement('div');
        div.innerHTML = `
        <div class="modal fade" id="checkoutModal" tabindex="-1" aria-labelledby="checkoutModalTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-md">
            <div class="modal-content" style="border-radius:8px;border:none;">
              <div class="modal-header border-0 pb-0">
                <h5 class="mb-0" id="checkoutModalTitle" style="font-family:'Playfair Display',serif;color:var(--brown);">💍 Datos de Entrega</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body px-4 py-3">
                <form id="checkout-form" onsubmit="Cart._handleCheckout(event)">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label text-muted small">Nombre completo</label>
                      <input type="text" class="form-control" id="checkout-nombre" readonly style="background:#f8f6f3;cursor:not-allowed;">
                    </div>
                    <div class="col-12">
                      <label class="form-label text-muted small">Correo electrónico</label>
                      <input type="email" class="form-control" id="checkout-email" readonly style="background:#f8f6f3;cursor:not-allowed;">
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label text-muted small">Teléfono <span class="text-danger">*</span></label>
                      <input type="tel" class="form-control" id="checkout-telefono" required placeholder="999 888 777" autocomplete="tel">
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label text-muted small">Fecha del evento <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" id="checkout-fecha" required>
                    </div>
                    <div class="col-12">
                      <label class="form-label text-muted small">Dirección de entrega <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="checkout-direccion" required placeholder="Calle, número, distrito, referencia">
                    </div>
                    <div class="col-12">
                      <label class="form-label text-muted small">Notas adicionales</label>
                      <textarea class="form-control" id="checkout-notas" rows="2" placeholder="Alérgenos, horario preferido, etc."></textarea>
                    </div>
                  </div>
                  <div id="checkout-error" class="text-danger small mb-2 d-none" role="alert"></div>
                  <button type="submit" class="btn-primary-custom w-100 shadow-sm mt-3" style="padding:12px 24px;">
                    ✅ CONFIRMAR PEDIDO
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>`;
        Array.from(div.children).forEach(child => document.body.appendChild(child));
    },

    async _handleCheckout(event) {
        event.preventDefault();
        const items = this.getItems();
        if (items.length === 0) return;

        const nombre = document.getElementById('checkout-nombre').value.trim();
        const email = document.getElementById('checkout-email').value.trim();
        const telefono = document.getElementById('checkout-telefono').value.trim();
        const direccion = document.getElementById('checkout-direccion').value.trim();
        const fechaEvento = document.getElementById('checkout-fecha').value;
        const notas = document.getElementById('checkout-notas').value.trim();

        if (!telefono || !direccion || !fechaEvento) {
            document.getElementById('checkout-error').textContent = 'Completa todos los campos obligatorios.';
            document.getElementById('checkout-error').classList.remove('d-none');
            return;
        }

        const total = items.reduce((s, i) => s + (i.precio || 0), 0);

        try {
            await API.post('/pedidos', {
                items: items.map(i => ({ pastel_id: i.pastel_id || i.id || null, nombre: i.nombre, precio: i.precio, cantidad: 1 })),
                total,
                cliente: nombre,
                email,
                telefono,
                direccion,
                fechaEvento,
                notas
            });
        } catch (e) {
            document.getElementById('checkout-error').textContent = 'Error al enviar el pedido. Intenta de nuevo.';
            document.getElementById('checkout-error').classList.remove('d-none');
            return;
        }

        if (bootstrap && bootstrap.Modal) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            if (modal) modal.hide();
        }

        this.clear();
        this.closePanel();
        this._showCelebration();
    },

    getOrders() {
        return JSON.parse(localStorage.getItem(this._ordersKey) || '[]');
    },

    _notify() {
        const count = this.getCount();
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
        window.dispatchEvent(new CustomEvent('cart-update', { detail: { count } }));
        if (document.getElementById('cart-items')) this._renderPanel();
    },

    _toast(msg) {
        const el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
    },

    togglePanel() {
        const panel = document.getElementById('cart-panel');
        const overlay = document.getElementById('cart-overlay');
        if (panel) {
            const show = !panel.classList.contains('show');
            panel.classList.toggle('show', show);
            if (overlay) overlay.classList.toggle('show', show);
            if (show) this._renderPanel();
        }
    },

    closePanel() {
        const panel = document.getElementById('cart-panel');
        const overlay = document.getElementById('cart-overlay');
        if (panel) panel.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    },

    _renderPanel() {
        const container = document.getElementById('cart-items');
        if (!container) return;
        const items = this.getItems();
        const total = items.reduce((s, i) => s + (i.precio || 0), 0);
        if (items.length === 0) {
            container.innerHTML = '<div class="cart-empty text-center py-5"><p class="text-muted mb-1">Tu carrito está vacío</p><small class="text-muted">Explora nuestro catálogo y personaliza tu torta ideal</small></div>';
            document.getElementById('cart-total').textContent = 'S/ 0.00';
            return;
        }
        container.innerHTML = items.map(item => `
            <div class="cart-item d-flex justify-content-between align-items-center py-2 px-3 border-bottom" style="border-color: #f0e9df !important;">
                <div>
                    <div class="fw-medium" style="font-size: 0.9rem;">${item.nombre}</div>
                    <div class="text-muted" style="font-size: 0.8rem;">S/ ${Number(item.precio).toFixed(2)}</div>
                </div>
                <button class="btn btn-sm border-0 text-muted p-1" onclick="Cart.removeItem('${item.cartId}')" aria-label="Eliminar">✕</button>
            </div>
        `).join('');
        document.getElementById('cart-total').textContent = `S/ ${total.toFixed(2)}`;
    },

    _showCelebration() {
        this._injectCelebrationStyles();
        const existing = document.getElementById('celebration-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'celebration-overlay';
        overlay.innerHTML = `
            <div class="celebration-icons" aria-hidden="true">
                <span class="celeb-icon" style="--i:0;">💍</span>
                <span class="celeb-icon" style="--i:1;">🎂</span>
                <span class="celeb-icon" style="--i:2;">✨</span>
                <span class="celeb-icon" style="--i:3;">❤️</span>
                <span class="celeb-icon" style="--i:4;">🥂</span>
                <span class="celeb-icon" style="--i:5;">💐</span>
                <span class="celeb-icon" style="--i:6;">🎉</span>
                <span class="celeb-icon" style="--i:7;">⭐</span>
            </div>
            <div class="celebration-card">
                <div class="celebration-emoji">🎉</div>
                <h2 class="celebration-title">¡Pedido Confirmado!</h2>
                <p class="celebration-text">Gracias por confiar en <strong>Taller de Sabores</strong>.<br>Te enviaremos la confirmación a tu correo.</p>
                <div class="celebration-divider"></div>
                <p class="celebration-small">Redirigiendo...</p>
            </div>
        `;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => overlay.classList.add('show'));

        const close = () => {
            overlay.classList.remove('show');
            setTimeout(() => { if (overlay.parentElement) overlay.remove(); }, 500);
        };

        setTimeout(close, 4500);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.classList.contains('celebration-card')) {
                close();
            }
        });
    },

    _injectCelebrationStyles() {
        if (document.getElementById('celebration-style')) return;
        const style = document.createElement('style');
        style.id = 'celebration-style';
        style.textContent = `
            #celebration-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                background: rgba(253, 248, 242, 0.92);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
            }
            #celebration-overlay.show {
                opacity: 1;
                pointer-events: auto;
            }
            .celebration-icons {
                position: absolute;
                inset: 0;
                overflow: hidden;
                pointer-events: none;
            }
            .celeb-icon {
                position: absolute;
                font-size: 1.8rem;
                opacity: 0;
                animation: celebFloat 4s ease-in-out infinite;
                animation-delay: calc(var(--i) * 0.3s);
            }
            .celeb-icon:nth-child(1)  { left: 10%; top: 20%; }
            .celeb-icon:nth-child(2)  { left: 85%; top: 15%; }
            .celeb-icon:nth-child(3)  { left: 20%; top: 70%; }
            .celeb-icon:nth-child(4)  { left: 75%; top: 75%; }
            .celeb-icon:nth-child(5)  { left: 50%; top: 10%; }
            .celeb-icon:nth-child(6)  { left: 5%;  top: 50%; }
            .celeb-icon:nth-child(7)  { left: 90%; top: 50%; }
            .celeb-icon:nth-child(8)  { left: 40%; top: 85%; }
            @keyframes celebFloat {
                0%   { transform: translateY(0) scale(0.8); opacity: 0; }
                20%  { opacity: 0.6; }
                50%  { transform: translateY(-30px) scale(1.1); opacity: 0.8; }
                80%  { opacity: 0.6; }
                100% { transform: translateY(0) scale(0.8); opacity: 0; }
            }
            .celebration-card {
                background: white;
                border-radius: 20px;
                padding: 48px 40px 36px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(77, 62, 53, 0.15);
                border: 1px solid #f0e9df;
                max-width: 400px;
                width: 90%;
                transform: scale(0.8);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                z-index: 2;
            }
            #celebration-overlay.show .celebration-card {
                transform: scale(1);
                opacity: 1;
            }
            .celebration-emoji {
                font-size: 3.5rem;
                margin-bottom: 12px;
            }
            .celebration-title {
                font-family: 'Playfair Display', serif;
                color: var(--brown, #4d3e35);
                font-size: 1.8rem;
                margin-bottom: 8px;
            }
            .celebration-text {
                color: #9c8470;
                font-size: 0.95rem;
                line-height: 1.6;
                margin-bottom: 16px;
            }
            .celebration-text strong {
                color: var(--brown, #4d3e35);
            }
            .celebration-divider {
                width: 40px;
                height: 2px;
                background: var(--gold, #bda57b);
                margin: 0 auto 12px;
                border-radius: 2px;
            }
            .celebration-small {
                font-size: 0.75rem;
                color: #c5b8a8;
                margin: 0;
            }
            @media (max-width: 576px) {
                .celebration-card {
                    padding: 32px 24px 28px;
                }
                .celebration-title { font-size: 1.4rem; }
                .celebration-emoji { font-size: 2.5rem; }
                .celeb-icon { font-size: 1.3rem; }
            }
        `;
        document.head.appendChild(style);
    }
};

document.addEventListener('DOMContentLoaded', () => Cart._notify());
