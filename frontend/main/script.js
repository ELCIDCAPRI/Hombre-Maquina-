async function cargarDestacadas() {
    const featuredGrid = document.getElementById('featured-grid');
    if (!featuredGrid) return;

    const { data, error } = await supabaseClient
        .from('tortas')
        .select('*')
        .eq('bestseller', true)
        .eq('disponible', true);

    if (error) {
        console.error('Error al cargar destacadas:', error);
        return;
    }

    featuredGrid.innerHTML = '';
    data.forEach(torta => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="card h-100 featured-card">
                <div class="featured-img-wrapper">
                    <a href="Catalogo/detallePastel/detalle.html?id=${torta.id}">
                        <img src="${torta.imagen}" alt="${torta.nombre}" loading="lazy">
                    </a>
                </div>
                <div class="card-body text-center p-4 d-flex flex-column justify-content-center">
                    <h4 style="font-family: 'Cormorant Garamond', serif; color: var(--brown); font-size: 1.4rem;" class="mb-2">
                        ${torta.nombre}
                    </h4>
                    <p class="card-text text-muted mb-0" style="font-size: 0.9rem; line-height: 1.6;">
                        ${torta.descripcion}
                    </p>
                </div>
            </div>
        `;
        featuredGrid.appendChild(col);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDestacadas();

    // Reviews
    const reseñas = [
        { nombre: "María F.", texto: "¡Absolutamente delicioso y hermoso! Superó todas nuestras expectativas. La torta fue la estrella de nuestra boda.", estrellas: "★★★★★" },
        { nombre: "Carlos R.", texto: "El sabor y la decoración fueron perfectos para nuestra boda. El equipo de Taller de Sabores entendió exactamente lo que queríamos.", estrellas: "★★★★★" },
        { nombre: "Lucía P.", texto: "Excelente servicio y una torta espectacular. Todos nuestros invitados quedaron encantados. Muy recomendados.", estrellas: "★★★★★" }
    ];
    const reviewsGrid = document.getElementById('reviews-grid');
    if (reviewsGrid) {
        reseñas.forEach(r => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="card h-100 border-0 p-4 text-center" style="background: #fdfbf7;">
                    <div style="color: var(--gold); font-size: 1.5rem; letter-spacing: 4px;">${r.estrellas}</div>
                    <p class="text-muted my-3" style="font-style: italic; font-size: 0.95rem; line-height: 1.6;">"${r.texto}"</p>
                    <h6 class="mb-0" style="font-family: 'Playfair Display', serif; color: var(--brown);">${r.nombre}</h6>
                </div>
            `;
            reviewsGrid.appendChild(col);
        });
    }
});

function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}