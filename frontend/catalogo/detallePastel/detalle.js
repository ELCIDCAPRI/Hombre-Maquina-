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
        sabores: ["Zanahoria", "Queso Crema", "Nueces"]
    },
    {
        id: "3",
        nombre: "Encanto Botánico",
        descripcion: "Elegante combinación de bizcocho al desnudo y crema texturizada, coronada con un arreglo floral silvestre.",
        precio: 850.00,
        imagen: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=600",
        sabores: ["Vainilla", "Crema Floral", "Frutos del Bosque"]
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
        imagen: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=600",
        sabores: ["Vainilla", "Manjar", "Canela"]
    },
    {
        id: "6",
        nombre: "Ilusión Floral",
        descripcion: "Diseño de vanguardia con efecto flotante. Destaca por su cámara central transparente que encapsula lirios blancos, contrastando con la pureza del acabado liso y bordes de perlas.",
        precio: 650.00,
        imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600",
        sabores: ["Limón", "Almendras", "Maracuyá"]
    },
    {
        id: "7",
        nombre: "Delicia de Chocolate",
        descripcion: "Pastel de chocolate belga con relleno de ganache oscuro y frambuesas frescas. Cobertura de espejo brillante con decoración en oro comestible.",
        precio: 890.00,
        imagen: "https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&q=80&w=600",
        sabores: ["Chocolate Belga", "Ganache", "Frambuesa"]
    },
    {
        id: "8",
        nombre: "Primavera Floral",
        descripcion: "Pastel primaveral de 3 pisos con buttercream de vainilla y flores frescas de estación.",
        precio: 560.00,
        imagen: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600",
        sabores: ["Vainilla", "Limón", "Arándanos"]
    },
    {
        id: "9",
        nombre: "Lujo Dorado",
        descripcion: "Espectacular pastel con aplicaciones de pan de oro 24k, perlas comestibles y flores de azúcar hiperrealistas.",
        precio: 2500.00,
        imagen: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=600",
        sabores: ["Vainilla", "Dulce de Leche", "Oro Comestible"]
    },
    {
        id: "10",
        nombre: "Mini Aventura",
        descripcion: "Pastel pequeño de 2 pisos con diseño geométrico moderno. Relleno de crema de maracuyá y mango. Perfecto para bodas íntimas.",
        precio: 290.00,
        imagen: "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&q=80&w=600",
        sabores: ["Maracuyá", "Mango", "Crema Ligera"]
    },
    {
        id: "11",
        nombre: "Bosque Encantado",
        descripcion: "Pastel temático con aspecto de tronco de árbol, decorado con hongos de merengue, musgo comestible y flores del bosque.",
        precio: 1100.00,
        imagen: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600",
        sabores: ["Chocolate", "Avellanas", "Merengue"]
    },
    {
        id: "12",
        nombre: "Marfil Atemporal",
        descripcion: "Diseño clásico de 4 pisos con encaje real comestible, perlas y delicadas flores en pasta de goma.",
        precio: 1800.00,
        imagen: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=600",
        sabores: ["Vainilla", "Crema de Mantequilla", "Flor de Azahar"]
    }
];

const reseñasDemo = [
    { nombre: "María F.", texto: "¡Absolutamente delicioso y hermoso! Superó todas nuestras expectativas.", estrellas: "★ ★ ★ ★ ★" },
    { nombre: "Carlos R.", texto: "La torta superó nuestras expectativas. El sabor y la decoración fueron perfectos para nuestra boda.", estrellas: "★ ★ ★ ★ ★" },
    { nombre: "Lucía P.", texto: "Excelente servicio y una torta espectacular. Todos nuestros invitados quedaron encantados.", estrellas: "★ ★ ★ ★ ★" },
    { nombre: "Andrés G.", texto: "La personalización fue increíble. Lograron exactamente lo que soñábamos.", estrellas: "★ ★ ★ ★ ★" }
];

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cakeId = urlParams.get('id') || "1";
    const tortaSeleccionada = catalogoTortas.find(t => t.id === cakeId);

    if (tortaSeleccionada) {
        document.getElementById('detail-image').src = tortaSeleccionada.imagen;
        document.getElementById('detail-image').alt = tortaSeleccionada.nombre;
        document.getElementById('detail-title').textContent = tortaSeleccionada.nombre;
        document.getElementById('detail-desc').textContent = tortaSeleccionada.descripcion;
        document.getElementById('detail-price').textContent = `S/ ${tortaSeleccionada.precio.toFixed(2)}`;

        const flavorContainer = document.getElementById('detail-flavors');
        flavorContainer.innerHTML = '';
        tortaSeleccionada.sabores.forEach(sabor => {
            flavorContainer.innerHTML += `<span class="flavor-tag">${sabor}</span>`;
        });
    }

    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';
    reseñasDemo.forEach(reseña => {
        const initial = reseña.nombre.charAt(0);
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
