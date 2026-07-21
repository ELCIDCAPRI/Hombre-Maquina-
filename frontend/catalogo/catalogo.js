const cakes = [
    { id: 1,  name: "Elegancia Blanca",     description: "Clásico pastel de vainilla con relleno de frutos rojos y cobertura de fondant suizo. Tres pisos impecables con detalles en encaje comestible.",                                  price: 450.00,  style: "clasico", size: "mediano", image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600" },
    { id: 2,  name: "Romance Rústico",       description: "Naked cake de zanahoria con frosting de queso crema y detalles florales naturales. Ideal para bodas al aire libre o estilo boho.",                                          price: 380.00,  style: "rustico", size: "pequeno", image: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&q=80&w=600" },
    { id: 3,  name: "Encanto Botánico",      description: "Elegante combinación de bizcocho al desnudo y crema texturizada, coronada con un arreglo floral silvestre de temporada.",                                                  price: 850.00,  style: "rustico", size: "grande",  image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=600" },
    { id: 4,  name: "Cascada de Rosas",      description: "Majestuoso pastel de 4 pisos con cascada de rosas de azúcar hechas a mano. Acabado en fondant satinado con detalles en pan de oro.",                                      price: 1200.00, style: "clasico", size: "grande",  image: "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=600" },
    { id: 5,  name: "Boho Dulzura",          description: "Diseño rústico de cuatro pisos con acabado semi-naked y drip cake de caramelo. Decorado con mini donas espolvoreadas y eucalipto fresco.",                                 price: 720.00,  style: "rustico", size: "grande",  image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=600" },
    { id: 6,  name: "Ilusión Floral",        description: "Diseño de vanguardia con efecto flotante. Cámara central transparente que encapsula lirios blancos con acabado liso y bordes de perlas.",                                  price: 650.00,  style: "moderno", size: "mediano", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600" },
    { id: 7,  name: "Delicia de Chocolate",  description: "Pastel de chocolate belga con relleno de ganache oscuro y frambuesas frescas. Cobertura de espejo brillante con decoración en oro comestible.",                           price: 890.00,  style: "moderno", size: "mediano", image: "https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&q=80&w=600" },
    { id: 8,  name: "Primavera Floral",      description: "Pastel primaveral de 3 pisos con buttercream de vainilla y flores frescas de estación. Toques sutiles de limón y arándanos.",                                              price: 560.00,  style: "rustico", size: "mediano", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600" },
    { id: 9,  name: "Lujo Dorado",           description: "Espectacular pastel de 5 pisos con aplicaciones de pan de oro 24k, perlas comestibles y flores de azúcar hiperrealistas. Máxima elegancia.",                              price: 2500.00, style: "clasico", size: "grande",  image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=600" },
    { id: 10, name: "Mini Aventura",         description: "Pastel pequeño de 2 pisos con diseño geométrico moderno. Relleno de crema de maracuyá y mango. Perfecto para bodas íntimas.",                                              price: 290.00,  style: "moderno", size: "pequeno", image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&q=80&w=600" },
    { id: 11, name: "Bosque Encantado",      description: "Pastel temático con aspecto de tronco de árbol, decorado con hongos de merengue, musgo comestible y flores del bosque.",                                                  price: 1100.00, style: "rustico", size: "grande",  image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600" },
    { id: 12, name: "Marfil Atemporal",      description: "Diseño clásico de 4 pisos con encaje real comestible, perlas y delicadas flores en pasta de goma. El epítome de la elegancia tradicional.",                               price: 1800.00, style: "clasico", size: "grande",  image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=600" }
];

const grid = document.getElementById('catalog-grid');
const searchInput = document.getElementById('filter-busqueda');
const searchClear = document.getElementById('search-clear');
const suggestionsEl = document.getElementById('suggestions-dropdown');
const filterStyle = document.getElementById('filter-estilo');
const filterSize = document.getElementById('filter-tamano');
const filterPrice = document.getElementById('filter-precio');
let searchTerm = '';
let suggestionsVisible = false;

function renderCakes(cakesToRender) {
    grid.innerHTML = '';
    if (cakesToRender.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No se encontraron pasteles con esos filtros.</p></div>';
        return;
    }
    cakesToRender.forEach(cake => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 cake-card">
                <div class="card-img-wrapper">
                    <img src="${cake.image}" class="card-img-top w-100" alt="${cake.name}" loading="lazy">
                </div>
                <div class="card-body d-flex flex-column text-center p-4">
                    <h5 class="card-title">${cake.name}</h5>
                    <p class="card-text text-muted mb-4 flex-grow-1">${cake.description}</p>
                    <div class="price-tag mb-3">S/ ${cake.price.toFixed(2)}</div>
                    <a href="../Catalogo/detallePastel/detalle.html?id=${cake.id}" class="btn btn-detalle mt-auto mx-auto w-100" style="text-decoration: none; display: flex; justify-content: center; align-items: center;">
                        Ver detalle
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

function applyFilters() {
    let filtered = cakes;
    const styleVal = filterStyle.value;
    const sizeVal = filterSize.value;
    const priceVal = filterPrice.value;

    if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.description.toLowerCase().includes(term)
        );
    }
    if (styleVal !== 'all') filtered = filtered.filter(c => c.style === styleVal);
    if (sizeVal !== 'all') filtered = filtered.filter(c => c.size === sizeVal);
    if (priceVal !== 'all') {
        filtered = filtered.filter(c => {
            if (priceVal === 'low') return c.price <= 500;
            if (priceVal === 'mid') return c.price > 500 && c.price <= 1000;
            if (priceVal === 'high') return c.price > 1000;
            return true;
        });
    }
    renderCakes(filtered);
    searchClear.style.display = searchTerm.trim() ? 'flex' : 'none';
}

function getSuggestions(query) {
    if (!query.trim()) return [];
    const term = query.trim().toLowerCase();
    return cakes
        .filter(c => c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term))
        .slice(0, 5);
}

function renderSuggestions(query) {
    const results = getSuggestions(query);
    if (results.length === 0 || !query.trim()) {
        suggestionsEl.classList.remove('show');
        suggestionsVisible = false;
        return;
    }
    suggestionsEl.innerHTML = results.map(c => `
        <div class="suggestion-item" data-id="${c.id}">
            <span class="suggestion-name">${c.name}</span>
            <span class="suggestion-price">S/ ${c.price.toFixed(2)}</span>
        </div>
    `).join('');
    suggestionsEl.classList.add('show');
    suggestionsVisible = true;
}

function showPopularSuggestions() {
    const popular = cakes.slice(0, 3);
    suggestionsEl.innerHTML = `
        <div class="suggestion-header">🍰 Populares</div>
        ${popular.map(c => `
            <div class="suggestion-item" data-id="${c.id}">
                <span class="suggestion-name">${c.name}</span>
                <span class="suggestion-price">S/ ${c.price.toFixed(2)}</span>
            </div>
        `).join('')}
    `;
    suggestionsEl.classList.add('show');
    suggestionsVisible = true;
}

function selectSuggestion(id) {
    const cake = cakes.find(c => c.id === id);
    if (!cake) return;
    searchInput.value = cake.name;
    searchTerm = cake.name;
    suggestionsEl.classList.remove('show');
    suggestionsVisible = false;
    applyFilters();
}

filterStyle.addEventListener('change', applyFilters);
filterSize.addEventListener('change', applyFilters);
filterPrice.addEventListener('change', applyFilters);

searchInput.addEventListener('input', function () {
    searchTerm = this.value;
    if (this.value.trim()) {
        renderSuggestions(this.value);
    } else {
        suggestionsEl.classList.remove('show');
        suggestionsVisible = false;
    }
    applyFilters();
});

searchInput.addEventListener('focus', function () {
    if (!this.value.trim()) {
        showPopularSuggestions();
    } else {
        renderSuggestions(this.value);
    }
});

searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        suggestionsEl.classList.remove('show');
        suggestionsVisible = false;
    }
    if (e.key === 'Enter' && suggestionsVisible) {
        const first = suggestionsEl.querySelector('.suggestion-item');
        if (first) {
            selectSuggestion(parseInt(first.dataset.id));
        }
    }
});

suggestionsEl.addEventListener('click', function (e) {
    const item = e.target.closest('.suggestion-item');
    if (item) {
        selectSuggestion(parseInt(item.dataset.id));
    }
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('#search-wrapper')) {
        suggestionsEl.classList.remove('show');
        suggestionsVisible = false;
    }
});

searchClear.addEventListener('click', function () {
    searchInput.value = '';
    searchTerm = '';
    searchClear.style.display = 'none';
    suggestionsEl.classList.remove('show');
    suggestionsVisible = false;
    applyFilters();
    searchInput.focus();
});

document.addEventListener('DOMContentLoaded', () => renderCakes(cakes));
