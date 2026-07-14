let cakes = [];

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
                    <img src="${cake.image || cake.imagen}" class="card-img-top w-100" alt="${cake.name || cake.nombre}" loading="lazy">
                </div>
                <div class="card-body d-flex flex-column text-center p-4">
                    <h5 class="card-title">${cake.name || cake.nombre}</h5>
                    <p class="card-text text-muted mb-4 flex-grow-1">${cake.description || cake.descripcion}</p>
                    <div class="price-tag mb-3">S/ ${(cake.price || cake.precio || 0).toFixed(2)}</div>
                    <a href="/catalogo/detallePastel/detalle.html?id=${cake.id}" class="btn btn-detalle mt-auto mx-auto w-100" style="text-decoration: none; display: flex; justify-content: center; align-items: center;">
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
            (c.name || c.nombre || '').toLowerCase().includes(term) ||
            (c.description || c.descripcion || '').toLowerCase().includes(term)
        );
    }
    if (styleVal !== 'all') filtered = filtered.filter(c => c.style === styleVal);
    if (sizeVal !== 'all') filtered = filtered.filter(c => c.size === sizeVal);
    if (priceVal !== 'all') {
        filtered = filtered.filter(c => {
            const price = c.price || c.precio || 0;
            if (priceVal === 'low') return price <= 500;
            if (priceVal === 'mid') return price > 500 && price <= 1000;
            if (priceVal === 'high') return price > 1000;
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
        .filter(c => (c.name || c.nombre || '').toLowerCase().includes(term) || (c.description || c.descripcion || '').toLowerCase().includes(term))
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
            <span class="suggestion-name">${c.name || c.nombre}</span>
            <span class="suggestion-price">S/ ${(c.price || c.precio || 0).toFixed(2)}</span>
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
                <span class="suggestion-name">${c.name || c.nombre}</span>
                <span class="suggestion-price">S/ ${(c.price || c.precio || 0).toFixed(2)}</span>
            </div>
        `).join('')}
    `;
    suggestionsEl.classList.add('show');
    suggestionsVisible = true;
}

function selectSuggestion(id) {
    const cake = cakes.find(c => c.id === id);
    if (!cake) return;
    searchInput.value = cake.name || cake.nombre;
    searchTerm = cake.name || cake.nombre;
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
            selectSuggestion(first.dataset.id);
        }
    }
});

suggestionsEl.addEventListener('click', function (e) {
    const item = e.target.closest('.suggestion-item');
    if (item) {
        selectSuggestion(item.dataset.id);
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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        cakes = await API.get('/productos');
    } catch(e) {
        console.error('Error al cargar productos:', e);
    }
    renderCakes(cakes);
});
