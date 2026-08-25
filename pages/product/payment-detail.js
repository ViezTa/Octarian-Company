document.addEventListener("DOMContentLoaded", () => {
    const backLink = document.querySelector(".payment-detail-header a.btn-outline-danger");
    if (backLink) backLink.textContent = "← Kembali ke Pesanan";

    const order = JSON.parse(localStorage.getItem("octarian-last-order") || "null");
    if (!order) return;

    const currency = (value) => "Rp " + Number(value || 0).toLocaleString("id-ID");
    document.getElementById("payment-invoice").textContent = "Invoice " + order.invoice;

    document.getElementById("payment-info-grid").innerHTML = [
        ["Order ID", order.id],
        ["Tanggal Pesanan", order.date],
        ["Nama Pembeli", order.customer.name],
        ["Email", order.customer.email],
        ["Alamat Pengiriman", order.customer.address],
        ["Metode Pembayaran", order.customer.paymentMethod]
    ].map(([label, value]) => `
        <div class="payment-info-field">
            <span class="payment-info-field__label">${label}</span>
            <strong class="payment-info-field__value">${value}</strong>
        </div>`).join("");

    document.getElementById("payment-product-list").innerHTML = order.items.map((item) => `
        <div class="payment-product-row">
            <img src="../../${item.image}" alt="${item.name}">
            <div>
                <strong>${item.name}</strong>
                <span class="text-muted">${item.quantity} x ${currency(item.price)}</span>
            </div>
            <strong>${currency(item.price * item.quantity)}</strong>
        </div>`).join("");

    document.getElementById("payment-subtotal").textContent = currency(order.subtotal);
    document.getElementById("payment-shipping").textContent = currency(order.shipping);
    document.getElementById("payment-total").textContent = currency(order.total);
});
