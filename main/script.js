// ESTADO
let cartItems = [];

// Arreglo con solo las 3 tortas destacadas
const tortasDestacadas = [
    {
        id: "d1",
        nombre: "Elegancia Clásica",
        descripcion: "Diseño minimalista con buttercream de merengue suizo y sutiles toques de pan de oro.",
        imagen: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "d2",
        nombre: "Romance Rústico",
        descripcion: "Estilo rústico semi-naked decorado con delicadas flores de estación naturales.",
        imagen: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "d3",
        nombre: "Encanto Botánico",
        descripcion: "Elegante combinación de bizcocho al desnudo y crema texturizada, coronada con un arreglo floral silvestre.",
        imagen: "../main/img/Botanica.jpg"
    }
];

// Esperar a que el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
    const featuredGrid = document.getElementById('featured-grid');

    // Inyectar las 3 tortas en el HTML
    if (featuredGrid) {
        tortasDestacadas.forEach(torta => {
            const col = document.createElement('div');
            col.className = 'col-md-4'; // 3 columnas en desktop
            
            col.innerHTML = `
                <div class="card h-100 featured-card">
                    <div class="featured-img-wrapper">
                        <img src="${torta.imagen}" alt="${torta.nombre}">
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
});

// CARRITO
function addToCart(nombre, precio){
  cartItems.push({
    nombre,
    precio
  });

  updateCart();

  showToast("Producto agregado");
}

function updateCart(){
  document.getElementById('cartCount').textContent =
    cartItems.length;

}

// TOAST
function showToast(msg){
  const toast = document.getElementById('toast');

  toast.textContent = msg;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);

}

// MENU MOBILE
function toggleMobileMenu(){
  alert("Menú móvil");
}
