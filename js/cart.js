const STORAGE_KEY = "cart";
const ORDER_STORAGE_KEY = "octarian-last-order";
const SHIPPING_COST = 50000;

function getCart() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatCurrency(value) {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

function imagePath(image) {
    if (!image) return "";
    return image.startsWith("gambar/") && !window.location.pathname.endsWith("index.html")
        ? "../../" + image
        : image;
}

function getCartCount() {
    return getCart().reduce((total, item) => total + (item.quantity || 0), 0);
}

function updateBadge() {
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = getCartCount();
}

function addToCart(product) {
    if (!product || !product.id) return;

    const cart = getCart();
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    updateBadge();
    renderCart();
    renderCheckout();
}

function addFromElement(element) {
    const card = element && element.closest ? element.closest(".card") : null;
    if (!card) return;

    const title = card.querySelector(".card-title")?.textContent.trim();
    const priceText = Array.from(card.querySelectorAll("p")).map((item) => item.textContent).find((text) => text.includes("Rp"));
    const image = card.querySelector("img")?.getAttribute("src");
    const price = Number((priceText || "").replace(/[^0-9]/g, ""));

    if (!title || !price || !image) return;

    addToCart({
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        name: title,
        price,
        image
    });
}

function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    item.quantity += delta;
    saveCart(cart.filter((cartItem) => cartItem.quantity > 0));
    updateBadge();
    renderCart();
    renderCheckout();
}

function clearCart() {
    saveCart([]);
    updateBadge();
    renderCart();
    renderCheckout();
}

function cartSubtotal(cart) {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function renderCart() {
    const container = document.getElementById("cart-items-dynamic-container");
    const totalItems = document.getElementById("cart-total-items-count");
    const totalPrice = document.getElementById("cart-total-price-sum");
    if (!container) return;

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 border border-secondary rounded-4 bg-dark">
                <i class="fas fa-shopping-bag fa-3x text-secondary mb-3"></i>
                <h4 class="text-light">Keranjang Anda masih kosong</h4>
                <p class="text-secondary">Pilih produk untuk mulai berbelanja.</p>
            </div>`;
        if (totalItems) totalItems.textContent = "0";
        if (totalPrice) totalPrice.textContent = formatCurrency(0);
        return;
    }

    container.innerHTML = cart.map((item) => {
        const subtotal = item.price * item.quantity;
        return `
            <div class="card border-secondary bg-dark text-light mb-3">
                <div class="row g-0 align-items-center">
                    <div class="col-md-3">
                        <img src="${imagePath(item.image)}" class="img-fluid rounded-start h-100" alt="${item.name}" style="object-fit: cover; min-height: 140px;">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    <h5 class="card-title mb-1">${item.name}</h5>
                                    <p class="text-secondary mb-2">${formatCurrency(item.price)} / item</p>
                                </div>
                                <button class="btn btn-sm btn-outline-danger" onclick="changeQty('${item.id}', -${item.quantity})" aria-label="Hapus ${item.name}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div class="d-flex align-items-center gap-2">
                                    <button class="btn btn-sm btn-outline-light" onclick="changeQty('${item.id}', -1)">-</button>
                                    <span class="fw-bold px-2">${item.quantity}</span>
                                    <button class="btn btn-sm btn-outline-light" onclick="changeQty('${item.id}', 1)">+</button>
                                </div>
                                <div class="fw-bold text-danger">${formatCurrency(subtotal)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }).join("");

    if (totalItems) totalItems.textContent = getCartCount();
    if (totalPrice) totalPrice.textContent = formatCurrency(cartSubtotal(cart));
}

function renderCheckout() {
    const container = document.getElementById("checkout-order-items-container");
    const subtotalEl = document.getElementById("checkout-subtotal");
    const discountEl = document.getElementById("checkout-discount");
    const shippingEl = document.getElementById("checkout-shipping");
    const grandTotalEl = document.getElementById("checkout-grandtotal");
    if (!container) return;

    const cart = getCart();
    const subtotal = cartSubtotal(cart);
    const shipping = cart.length ? SHIPPING_COST : 0;
    const total = subtotal + shipping;

    container.innerHTML = cart.length ? cart.map((item) => `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
            <div>
                <div class="fw-semibold">${item.name}</div>
                <small class="text-muted">${item.quantity} x ${formatCurrency(item.price)}</small>
            </div>
            <strong>${formatCurrency(item.price * item.quantity)}</strong>
        </div>`).join("") : "<p class=\"text-muted mb-0\">Belum ada produk di keranjang.</p>";

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (discountEl) discountEl.textContent = "- " + formatCurrency(0);
    if (shippingEl) shippingEl.textContent = formatCurrency(shipping);
    if (grandTotalEl) grandTotalEl.textContent = formatCurrency(total);
}

function createOrder(customer) {
    const cart = getCart();
    if (!cart.length) return null;

    const order = {
        id: "ORD-" + Date.now().toString().slice(-8),
        invoice: "INV-" + new Date().getFullYear() + "-" + Date.now().toString().slice(-6),
        date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
        customer: customer || {},
        items: cart,
        subtotal: cartSubtotal(cart),
        shipping: SHIPPING_COST,
        total: cartSubtotal(cart) + SHIPPING_COST,
        status: "Menunggu Pembayaran"
    };
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
    return order;
}

window.changeQty = changeQty;
window.clearCart = clearCart;
window.OctarianCart = { addToCart, addFromElement, clearCart, changeQuantity: changeQty, getCartCount, renderCart, renderCheckoutSummary: renderCheckout, createOrder };

document.addEventListener("DOMContentLoaded", () => {
    updateBadge();
    renderCart();
    renderCheckout();
});
