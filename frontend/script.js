document.addEventListener('DOMContentLoaded', async () => {
    const featuredGrid = document.getElementById('featured-grid');
    const reviewsGrid = document.getElementById('reviews-grid');

    try {
        const featured = await API.get('/productos/featured');
        featured.forEach(torta => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="card h-100 featured-card">
                    <div class="featured-img-wrapper">
                        <img src="${torta.image || torta.imagen}" alt="${torta.name || torta.nombre}" loading="lazy">
                    </div>
                    <div class="card-body text-center p-4 d-flex flex-column justify-content-center">
                        <h4 style="font-family: 'Cormorant Garamond', serif; color: var(--brown); font-size: 1.4rem;" class="mb-2">
                            ${torta.name || torta.nombre}
                        </h4>
                        <p class="card-text text-muted mb-0" style="font-size: 0.9rem; line-height: 1.6;">
                            ${torta.description || torta.descripcion}
                        </p>
                    </div>
                </div>
            `;
            featuredGrid.appendChild(col);
        });
    } catch(e) {
        console.error('Error al cargar destacados:', e);
        const fallback = [
            { nombre: "Elegancia Clásica", descripcion: "Diseño minimalista con buttercream de merengue suizo y sutiles toques de pan de oro.", imagen: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600" },
            { nombre: "Romance Rústico", descripcion: "Estilo rústico semi-naked decorado con delicadas flores de estación naturales.", imagen: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&q=80&w=600" },
            { nombre: "Encanto Botánico", descripcion: "Elegante combinación de bizcocho al desnudo y crema texturizada, coronada con un arreglo floral silvestre.", imagen: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=600" }
        ];
        fallback.forEach(torta => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="card h-100 featured-card">
                    <div class="featured-img-wrapper">
                        <img src="${torta.imagen}" alt="${torta.nombre}" loading="lazy">
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

    try {
        const reviews = await API.get('/resenas');
        reviews.forEach(r => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="card h-100 border-0 p-4 text-center" style="background: #fdfbf7;">
                    <div style="color: var(--gold); font-size: 1.5rem; letter-spacing: 4px;">${r.estrellas || '★★★★★'}</div>
                    <p class="text-muted my-3" style="font-style: italic; font-size: 0.95rem; line-height: 1.6;">"${r.texto}"</p>
                    <h6 class="mb-0" style="font-family: 'Playfair Display', serif; color: var(--brown);">${r.nombre}</h6>
                </div>
            `;
            reviewsGrid.appendChild(col);
        });
    } catch(e) {
        console.error('Error al cargar reseñas:', e);
        const fallbackReviews = [
            { nombre: "María F.", texto: "¡Absolutamente delicioso y hermoso! Superó todas nuestras expectativas. La torta fue la estrella de nuestra boda.", estrellas: "★★★★★" },
            { nombre: "Carlos R.", texto: "El sabor y la decoración fueron perfectos para nuestra boda. El equipo de Taller de Sabores entendió exactamente lo que queríamos.", estrellas: "★★★★★" },
            { nombre: "Lucía P.", texto: "Excelente servicio y una torta espectacular. Todos nuestros invitados quedaron encantados. Muy recomendados.", estrellas: "★★★★★" }
        ];
        fallbackReviews.forEach(r => {
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
