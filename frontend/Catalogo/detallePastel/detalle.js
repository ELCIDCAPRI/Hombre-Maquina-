const reseñasDemo = [
    { nombre: "María F.", texto: "¡Absolutamente delicioso y hermoso! Superó todas nuestras expectativas.", estrellas: "★ ★ ★ ★ ★" },
    { nombre: "Carlos R.", texto: "La torta superó nuestras expectativas. El sabor y la decoración fueron perfectos para nuestra boda.", estrellas: "★ ★ ★ ★ ★" },
    { nombre: "Lucía P.", texto: "Excelente servicio y una torta espectacular. Todos nuestros invitados quedaron encantados.", estrellas: "★ ★ ★ ★ ★" },
    { nombre: "Andrés G.", texto: "La personalización fue increíble. Lograron exactamente lo que soñábamos.", estrellas: "★ ★ ★ ★ ★" }
];

let tortaActual = null; // guardamos la torta cargada para usarla en "Añadir al carrito"

async function cargarTortaDesdeSupabase(id) {
    const { data, error } = await supabaseClient
        .from('tortas')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error al cargar la torta:', error);
        document.getElementById('detail-title').textContent = 'Torta no encontrada';
        document.getElementById('detail-desc').textContent = 'No pudimos encontrar esta torta. Vuelve al catálogo e intenta de nuevo.';
        return;
    }

    tortaActual = data;

    document.getElementById('detail-image').src = data.imagen;
    document.getElementById('detail-image').alt = data.nombre;
    document.getElementById('detail-title').textContent = data.nombre;
    document.getElementById('detail-desc').textContent = data.descripcion;
    document.getElementById('detail-price').textContent = `S/ ${Number(data.precio_base).toFixed(2)}`;

    // Ya no tenemos columna "sabores" en Supabase, así que ocultamos esa sección por ahora
    const flavorContainer = document.getElementById('detail-flavors');
    if (flavorContainer) flavorContainer.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cakeId = urlParams.get('id');

    if (cakeId) {
        cargarTortaDesdeSupabase(cakeId);
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

function agregarAlCarrito() {
    if (!tortaActual) return;
    Cart.addItem({
        tortaId: tortaActual.id, // uuid real de Supabase, lo vamos a necesitar para guardar el pedido
        nombre: tortaActual.nombre,
        precio: tortaActual.precio_base,
        imagen: tortaActual.imagen
    });
}