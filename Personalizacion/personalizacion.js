// Estado de la cotización
const state = {
    step: 1,
    pisos: { valor: 2, precio: 150 },
    sabor: { valor: 'Por definir', precio: 0 },
    relleno: { valor: 'Por definir', precio: 0 },
    decoracion: { valor: 'Por definir', precio: 0 }
};

// Diccionario de colores para el efecto 3D
const flavorColors = {
    'Vainilla':   { edge: '#e8dfd3', light: '#ffffff', dark: '#d8caba' },
    'Chocolate':  { edge: '#5c3a21', light: '#825330', dark: '#4a2c16' },
    'Red Velvet': { edge: '#8a1f26', light: '#b52b33', dark: '#66151b' }
};

document.addEventListener('DOMContentLoaded', () => {
    drawCake(); // Dibuja la torta inicial de 2 pisos
    updateSummary();
});

/* --- LÓGICA DE NAVEGACIÓN (PASOS) --- */
function changeStep(direction) {
    const totalSteps = 3;
    
    // Ocultar paso actual
    document.getElementById(`step-${state.step}`).classList.add('d-none');
    document.getElementById(`indicator-${state.step}`).classList.remove('active');
    
    // Actualizar variable de paso
    state.step += direction;
    
    // Mostrar nuevo paso
    document.getElementById(`step-${state.step}`).classList.remove('d-none');
    document.getElementById(`indicator-${state.step}`).classList.add('active');
    
    // Controlar botones
    document.getElementById('btn-prev').style.visibility = state.step === 1 ? 'hidden' : 'visible';
    
    const btnNext = document.getElementById('btn-next');
    if (state.step === totalSteps) {
        btnNext.textContent = 'Añadir al Carrito';
        btnNext.classList.add('bg-success'); // Cambia color si quieres al final
    } else {
        btnNext.textContent = 'Siguiente →';
        btnNext.classList.remove('bg-success');
    }
}

/* --- LÓGICA DE SELECCIÓN --- */
function handleSelection(element) {
    // Quitar la clase active a los hermanos
    const siblings = element.closest('.row').querySelectorAll('.option-card');
    siblings.forEach(el => el.classList.remove('active'));
    // Poner active al clickeado
    element.classList.add('active');
}

function selectFloor(cantidad, precio, element) {
    handleSelection(element);
    state.pisos = { valor: cantidad, precio: precio };
    document.getElementById('prev-pisos').textContent = `${cantidad} pisos`;
    drawCake();
    updateSummary();
}

function selectFlavor(sabor, precio, element) {
    handleSelection(element);
    state.sabor = { valor: sabor, precio: precio };
    document.getElementById('prev-sabor').textContent = sabor;
    updateSummary();

    // LÓGICA DE CAMBIO DE COLOR
    // Buscamos los colores del sabor seleccionado (si no existe, usa Vainilla por defecto)
    const colores = flavorColors[sabor] || flavorColors['Vainilla'];
    const container = document.getElementById('cake-tiers');
    
    // Inyectamos las variables de CSS en tiempo real
    container.style.setProperty('--cake-color-edge', colores.edge);
    container.style.setProperty('--cake-color-light', colores.light);
    container.style.setProperty('--cake-color-dark', colores.dark);
}

function selectFill(selectElement) {
    const values = selectElement.value.split('|'); // value="precio|Nombre"
    state.relleno = { valor: values[1], precio: parseFloat(values[0]) };
    document.getElementById('prev-relleno').textContent = values[1];
    updateSummary();
}

function selectDeco(estilo, precio, element) {
    handleSelection(element);
    state.decoracion = { valor: estilo, precio: precio };
    document.getElementById('prev-decoracion').textContent = estilo;
    updateSummary();
}

/* --- LÓGICA DE VISTA PREVIA (DIBUJAR PASTEL) --- */
function drawCake() {
    const container = document.getElementById('cake-tiers');
    container.innerHTML = ''; // Limpiar torta actual
    
    // Configuraciones de tamaño para cada piso (de arriba hacia abajo)
    const tierSizes = [
        { width: '80px', height: '60px' },  // Piso 4 (El más pequeño)
        { width: '120px', height: '65px' }, // Piso 3
        { width: '160px', height: '70px' }, // Piso 2
        { width: '200px', height: '75px' }  // Piso 1 (Base)
    ];

    // Si elige 2 pisos, usamos los dos últimos tamaños. Si elige 4, usamos todos.
    const startingIndex = 4 - state.pisos.valor; 

    for (let i = startingIndex; i < 4; i++) {
        const tier = document.createElement('div');
        tier.className = 'cake-tier';
        tier.style.width = tierSizes[i].width;
        tier.style.height = tierSizes[i].height;
        container.appendChild(tier);
    }
}

/* --- LÓGICA DE PRECIOS --- */
function updateSummary() {
    document.getElementById('sum-pisos').textContent = `S/ ${state.pisos.precio.toFixed(2)}`;
    document.getElementById('sum-sabor').textContent = `S/ ${state.sabor.precio.toFixed(2)}`;
    document.getElementById('sum-relleno').textContent = `S/ ${state.relleno.precio.toFixed(2)}`;
    document.getElementById('sum-decoracion').textContent = `S/ ${state.decoracion.precio.toFixed(2)}`;

    const total = state.pisos.precio + state.sabor.precio + state.relleno.precio + state.decoracion.precio;
    document.getElementById('sum-total').textContent = `S/ ${total.toFixed(2)}`;
}