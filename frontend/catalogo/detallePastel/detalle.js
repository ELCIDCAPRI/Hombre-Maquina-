document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cakeId = urlParams.get('id') || "1";

    try {
        const cake = await API.get('/productos/' + cakeId);
        document.getElementById('detail-image').src = cake.image || cake.imagen || '';
        document.getElementById('detail-image').alt = cake.name || cake.nombre || '';
        document.getElementById('detail-title').textContent = cake.name || cake.nombre || '';
        document.getElementById('detail-desc').textContent = cake.description || cake.descripcion || '';
        document.getElementById('detail-price').textContent = `S/ ${(cake.price || cake.precio || 0).toFixed(2)}`;

        const sabores = cake.sabores || [];
        const flavorContainer = document.getElementById('detail-flavors');
        flavorContainer.innerHTML = '';
        sabores.forEach(sabor => {
            flavorContainer.innerHTML += `<span class="flavor-tag">${sabor}</span>`;
        });
    } catch(e) {
        console.error('Error al cargar producto:', e);
    }

    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';
    try {
        const reviews = await API.get('/resenas');
        reviews.forEach(reseña => {
            const initial = (reseña.nombre || 'U').charAt(0);
            reviewsContainer.innerHTML += `
                <div class="review-card d-flex gap-3">
                    <div class="avatar-placeholder flex-shrink-0">${initial}</div>
                    <div class="w-100">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h5 class="mb-0 fs-6 fw-bold" style="color: var(--brown);">${reseña.nombre}</h5>
                            <span class="text-gold" style="letter-spacing: 1px; font-size: 0.9rem;">${reseña.estrellas || '★★★★★'}</span>
                        </div>
                        <p class="mb-0 text-muted" style="font-size: 0.9rem;">${reseña.texto}</p>
                    </div>
                </div>
            `;
        });
    } catch(e) {
        console.error('Error al cargar reseñas:', e);
        const demoReviews = [
            { nombre: "María F.", texto: "¡Absolutamente delicioso y hermoso! Superó todas nuestras expectativas.", estrellas: "★ ★ ★ ★ ★" },
            { nombre: "Carlos R.", texto: "La torta superó nuestras expectativas. El sabor y la decoración fueron perfectos para nuestra boda.", estrellas: "★ ★ ★ ★ ★" },
            { nombre: "Lucía P.", texto: "Excelente servicio y una torta espectacular. Todos nuestros invitados quedaron encantados.", estrellas: "★ ★ ★ ★ ★" },
            { nombre: "Andrés G.", texto: "La personalización fue increíble. Lograron exactamente lo que soñábamos.", estrellas: "★ ★ ★ ★ ★" }
        ];
        demoReviews.forEach(reseña => {
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
    }
});
