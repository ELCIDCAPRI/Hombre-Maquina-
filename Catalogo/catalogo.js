// Base de datos simulada
const cakes = [
    {
        id: 1,
        name: "Elegancia Blanca",
        description: "Clásico pastel de vainilla con relleno de frutos rojos y cobertura de fondant suizo.",
        price: 450.00,
        style: "clasico",
        size: "mediano",
        image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 2,
        name: "Romance Rústico",
        description: "Naked cake de zanahoria con frosting de queso crema y detalles florales naturales.",
        price: 380.00,
        style: "rustico",
        size: "pequeno",
        image: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 3,
        name: "Encanto Botánico",
        description: "Elegante combinación de bizcocho al desnudo y crema texturizada, coronada con un arreglo floral silvestre.",
        price: 850.00,
        style: "rustico",
        size: "grande",
        image: "../Catalogo/img/Botanica.jpg"
    },
    {
        id: 4,
        name: "Cascada de Rosas",
        description: "Majestuoso pastel de 4 pisos con cascada de rosas de azúcar hechas a mano.",
        price: 1200.00,
        style: "clasico",
        size: "grande",
        image: "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 5,
        name: "Boho Dulzura",
        description: "Un diseño rústico de cuatro pisos con acabado semi-naked y drip cake. Su toque distintivo y cálido lo aportan las mini donas espolvoreadas y las ramas de eucalipto fresco.",
        price: 720.00,
        style: "rustico",
        size: "grande",
        image: "../Catalogo/img/BohoDulzura.jpg"
    },
    {
        id: 6,
        name: "Ilusión Floral",
        description: "Diseño de vanguardia con efecto flotante. Destaca por su cámara central transparente que encapsula lirios blancos, contrastando con la pureza del acabado liso y bordes de perlas.",
        price: 650.00,
        style: "moderno",
        size: "mediano",
        image: "../Catalogo/img/IlusionFloral.jpg"
    }
];

// Referencias al DOM
const grid = document.getElementById('catalog-grid');
const filterStyle = document.getElementById('filter-estilo');
const filterSize = document.getElementById('filter-tamano');
const filterPrice = document.getElementById('filter-precio');

// Función para renderizar las tarjetas
function renderCakes(cakesToRender) {
    grid.innerHTML = '';
    
    if(cakesToRender.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No se encontraron pasteles con esos filtros.</p></div>';
        return;
    }

    cakesToRender.forEach(cake => {
        const col = document.createElement('div');
        col.className = 'col';
        
        // Uso de template literals para inyectar los datos en el HTML
        col.innerHTML = `
            <div class="card h-100 cake-card">
                <div class="card-img-wrapper">
                    <img src="${cake.image}" class="card-img-top w-100" alt="${cake.name}">
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

// Función central de filtrado
function applyFilters() {
    let filtered = cakes;

    const styleVal = filterStyle.value;
    const sizeVal = filterSize.value;
    const priceVal = filterPrice.value;

    if (styleVal !== 'all') {
        filtered = filtered.filter(c => c.style === styleVal);
    }
    
    if (sizeVal !== 'all') {
        filtered = filtered.filter(c => c.size === sizeVal);
    }
    
    if (priceVal !== 'all') {
        filtered = filtered.filter(c => {
            if (priceVal === 'low') return c.price <= 500;
            if (priceVal === 'mid') return c.price > 500 && c.price <= 1000;
            if (priceVal === 'high') return c.price > 1000;
            return true;
        });
    }

    renderCakes(filtered);
}

// Escuchar cambios en los selectores
filterStyle.addEventListener('change', applyFilters);
filterSize.addEventListener('change', applyFilters);
filterPrice.addEventListener('change', applyFilters);

// Render inicial al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderCakes(cakes);
});