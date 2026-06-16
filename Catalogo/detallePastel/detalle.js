// 1. Base de datos simulada (Idealmente esto lo exportas de tu script principal)
const catalogoTortas = [
    {
        id: "1",
        nombre: "Elegancia Blanca",
        descripcion: "Clásico pastel de vainilla con relleno de frutos rojos y cobertura de fondant suizo. Destacando sus características principales, ingredientes y estilo. Ideal para bodas elegantes y celebraciones especiales.",
        precio: 450.00,
        imagen: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600",
        sabores: ["Vainilla", "Frutos Rojos", "Fondant"]
    },
    {
        id: "2",
        nombre: "Romance Rústico",
        descripcion: "Naked cake de zanahoria con frosting de queso crema y detalles florales naturales.",
        precio: 382.00,
        imagen: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&q=80&w=600",
        sabores: ["Chocolate Belga", "Cerezas", "Ganache Oscuro"]
    },
    {
        id: "3",
        nombre: "Encanto Botánico",
        descripcion: "Elegante combinación de bizcocho al desnudo y crema texturizada, coronada con un arreglo floral silvestre..",
        precio: 850.00,
        imagen: "../img/Botanica.jpg",
        sabores: ["Zanahoria Especiada", "Queso Crema", "Nueces Tostadas"]
    },
    {
        id: "4",
        nombre: "Cascada de Rosas",
        descripcion: "Majestuoso pastel de 4 pisos con cascada de rosas de azúcar hechas a mano.",
        precio: 1200.00,
        imagen: "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=600",
        sabores: ["Red Velvet", "Frambuesa", "Crema de Vainilla"]
    },
    {
        id: "5",
        nombre: "Boho Dulzura",
        descripcion: "Un diseño rústico de cuatro pisos con acabado semi-naked y drip cake. Su toque distintivo y cálido lo aportan las mini donas espolvoreadas y las ramas de eucalipto fresco.",
        precio: 480.00,
        imagen: "../img/BohoDulzura.jpg",
        sabores: ["Vainilla con Canela", "Manjar", "Canela"]
    },
    {
        id: "6",
        nombre: "Ilusión Floral",
        descripcion: "Diseño de vanguardia con efecto flotante. Destaca por su cámara central transparente que encapsula lirios blancos, contrastando con la pureza del acabado liso y bordes de perlas.",
        precio: 650.00,
        imagen: "../img/IlusionFloral.jpg",
        sabores: ["Limón", "Almendras", "Ganache de Maracuyá"]
    },
    // ... Agrega el resto de tus tortas aquí
];

// Reseñas simuladas (Podrías asociarlas por ID en un proyecto más grande)
const reseñasDemo = [
    { nombre: "María F.", texto: "¡Absolutamente delicioso y hermoso!", estrellas: "★ ★ ★ ★ ★" },
    { nombre: "Carlos R.", texto: "La torta superó nuestras expectativas. El sabor y la decoración fueron perfectos para nuestra boda.", estrellas: "★ ★ ★ ★ ★" },
    { nombre: "Lucía P.", texto: "Excelente servicio y una torta espectacular. Todos nuestros invitados quedaron encantados.", estrellas: "★ ★ ★ ★ ★" }
];

document.addEventListener('DOMContentLoaded', () => {
    // 2. Obtener el ID de la torta desde la URL (ej: detalle.html?id=d1)
    const urlParams = new URLSearchParams(window.location.search);
    const cakeId = urlParams.get('id') || "d1"; // Por defecto carga "d1" si no hay ID para pruebas

    // Buscar la torta en el arreglo
    const tortaSeleccionada = catalogoTortas.find(t => t.id === cakeId);

    if (tortaSeleccionada) {
        // 3. Inyectar los datos en el HTML
        document.getElementById('detail-image').src = tortaSeleccionada.imagen;
        document.getElementById('detail-title').textContent = tortaSeleccionada.nombre;
        document.getElementById('detail-desc').textContent = tortaSeleccionada.descripcion;
        document.getElementById('detail-price').textContent = `S/ ${tortaSeleccionada.precio.toFixed(2)}`;

        // Inyectar etiquetas de sabores
        const flavorContainer = document.getElementById('detail-flavors');
        flavorContainer.innerHTML = '';
        tortaSeleccionada.sabores.forEach(sabor => {
            flavorContainer.innerHTML += `<span class="flavor-tag">${sabor}</span>`;
        });
    }

    // 4. Renderizar las reseñas
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';
    
    reseñasDemo.forEach(reseña => {
        const initial = reseña.nombre.charAt(0); // Primera letra para el avatar
        reviewsContainer.innerHTML += `
            <div class="review-card d-flex gap-3">
                <div class="avatar-placeholder flex-shrink-0">${initial}</div>
                <div class="w-100">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h5 class="mb-0 fs-6 fw-bold" style="color: var(--brown);">${reseña.nombre}</h5>
                        <span class="text-gold" style="letter-spacing: 1px; font-size: 0.9rem;">${reseña.estrellas}</span>
                    </div>
                    <p class="mb-0 text-muted" style="font-size: 0.9rem;">${reseña.texto}</p>
                </div>
            </div>
        `;
    });
});