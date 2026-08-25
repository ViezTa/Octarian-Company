const pembayaran = document.getElementById("pembayaran");
const paymentSections = {
    cc: document.getElementById("payment-cc"),
    bank: document.getElementById("payment-bank"),
    cod: document.getElementById("payment-cod"),
    ewallet: document.getElementById("payment-ewallet"),
};

function hideAllPaymentSections() {
    Object.values(paymentSections).forEach((section) => {
        if (section) {
            section.classList.add("d-none");
        }
    });
}

function showPaymentSection(method) {
    hideAllPaymentSections();
    const section = paymentSections[method];
    if (section) {
        section.classList.remove("d-none");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    hideAllPaymentSections();

    if (pembayaran) {
        pembayaran.addEventListener("change", (event) => {
            showPaymentSection(event.target.value);
        });
    }
});
