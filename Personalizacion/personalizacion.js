const state = {
    step: 1,
    pisos: { valor: 2, precio: 150 },
    sabor: { valor: 'Por definir', precio: 0 },
    relleno: { valor: 'Por definir', precio: 0 },
    decoracion: { valor: 'Por definir', precio: 0 }
};

document.addEventListener('DOMContentLoaded', () => {
    Cake3D.init('cake-3d-container');
    updateSummary();
    setupAuthListeners();
});

function setupAuthListeners() {
    window.addEventListener('auth-change', () => {
        const user = Auth.getUser();
        if (user && user.rol === 'admin') {
            const adminBtn = document.querySelector('.auth-admin-link');
            if (adminBtn) adminBtn.style.display = '';
        }
    });
}

function changeStep(direction) {
    const totalSteps = 3;

    if (state.step === totalSteps && direction === 1) {
        addToCart();
        return;
    }

    document.getElementById(`step-${state.step}`).classList.add('d-none');
    const oldIndicator = document.getElementById(`indicator-${state.step}`);
    oldIndicator.classList.remove('active');
    oldIndicator.setAttribute('aria-selected', 'false');
    oldIndicator.setAttribute('tabindex', '-1');

    state.step += direction;

    document.getElementById(`step-${state.step}`).classList.remove('d-none');
    const newIndicator = document.getElementById(`indicator-${state.step}`);
    newIndicator.classList.add('active');
    newIndicator.setAttribute('aria-selected', 'true');
    newIndicator.setAttribute('tabindex', '0');
    newIndicator.focus();

    document.getElementById('btn-prev').style.visibility = state.step === 1 ? 'hidden' : 'visible';
    document.getElementById('btn-prev').setAttribute('aria-hidden', state.step === 1);

    const btnNext = document.getElementById('btn-next');
    if (state.step === totalSteps) {
        btnNext.textContent = 'Añadir al Carrito';
        btnNext.setAttribute('aria-label', 'Añadir al carrito');
    } else {
        btnNext.textContent = 'Siguiente →';
        btnNext.setAttribute('aria-label', 'Siguiente paso');
    }
}

function addToCart() {
    const nombre = `Torta Personalizada (${state.pisos.valor} pisos)`;
    const precio = state.pisos.precio + state.sabor.precio + state.relleno.precio + state.decoracion.precio;
    const detalles = `${state.sabor.valor} · ${state.relleno.valor} · ${state.decoracion.valor}`;

    Cart.addItem({ nombre, precio, detalles });
    showToast('✓ Torta personalizada añadida al carrito');
}

function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

function handleSelection(element) {
    const row = element.closest('.row') || element.closest('[role="radiogroup"]');
    if (row) {
        row.querySelectorAll('.option-card').forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-checked', 'false');
        });
    }
    element.classList.add('active');
    element.setAttribute('aria-checked', 'true');
}

function selectFloor(cantidad, precio, element) {
    handleSelection(element);
    state.pisos = { valor: cantidad, precio: precio };
    document.getElementById('prev-pisos').textContent = `${cantidad} pisos`;
    Cake3D.updateTiers(cantidad);
    updateSummary();
}

function selectFlavor(sabor, precio, element) {
    handleSelection(element);
    state.sabor = { valor: sabor, precio: precio };
    document.getElementById('prev-sabor').textContent = sabor;
    Cake3D.updateFlavor(sabor);
    updateSummary();
}

function selectFill(selectElement) {
    const values = selectElement.value.split('|');
    state.relleno = { valor: values[1], precio: parseFloat(values[0]) };
    document.getElementById('prev-relleno').textContent = values[1];
    updateSummary();
}

function selectDeco(estilo, precio, element) {
    handleSelection(element);
    state.decoracion = { valor: estilo, precio: precio };
    document.getElementById('prev-decoracion').textContent = estilo;
    Cake3D.updateDecoration(estilo);
    updateSummary();
}

function updateSummary() {
    document.getElementById('sum-pisos').textContent = `S/ ${state.pisos.precio.toFixed(2)}`;
    document.getElementById('sum-sabor').textContent = `S/ ${state.sabor.precio.toFixed(2)}`;
    document.getElementById('sum-relleno').textContent = `S/ ${state.relleno.precio.toFixed(2)}`;
    document.getElementById('sum-decoracion').textContent = `S/ ${state.decoracion.precio.toFixed(2)}`;

    const total = state.pisos.precio + state.sabor.precio + state.relleno.precio + state.decoracion.precio;
    document.getElementById('sum-total').textContent = `S/ ${total.toFixed(2)}`;
}


