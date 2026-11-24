/* HINA — checkout demo: validasi, voucher, pesanan simulasi. */
var ORDERS_KEY = "hina_orders";
var LAST_ORDER_KEY = "hina_last_order";

function renderCheckout() {
  var box = document.getElementById("checkoutItems");
  if (!box) return;
  var items = loadCart();
  if (!items.length) { location.href = "keranjang.html"; return; }
  box.innerHTML = items.map(function (it) {
    return "<li>" + it.name + " — " + it.size + " × " + it.qty + " <span>" + formatRp(it.price * it.qty) + "</span></li>";
  }).join("");
  var sub = cartSubtotal(items), disc = voucherDiscount(sub);
  var sum = document.getElementById("checkoutSummary");
  if (sum) sum.innerHTML =
    '<div class="drawer-row"><span>Subtotal</span><span>' + formatRp(sub) + "</span></div>" +
    (disc ? '<div class="drawer-row"><span>Voucher HINA10</span><span>−' + formatRp(disc) + "</span></div>" : "") +
    '<div class="drawer-row drawer-total"><span>Total</span><span>' + formatRp(sub - disc) + "</span></div>";
  var vInput = document.getElementById("voucherInput");
  if (vInput && getVoucher()) vInput.value = getVoucher();
}

function initCheckout() {
  var form = document.getElementById("checkoutForm");
  if (!form) return;
  renderCheckout();
  var apply = document.getElementById("applyVoucher");
  if (apply) apply.addEventListener("click", function () {
    var code = document.getElementById("voucherInput").value.trim().toUpperCase();
    var msg = document.getElementById("voucherMsg");
    if (code === "HINA10") {
      setVoucher("HINA10");
      msg.textContent = "Voucher aktif: diskon 10%.";
    } else {
      setVoucher("");
      msg.textContent = "Kode voucher tidak dikenal.";
    }
    renderCheckout();
    if (typeof renderDrawer === "function") renderDrawer();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (f) {
      var bad = !f.value.trim() || (f.type === "email" && f.value.indexOf("@") === -1);
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    var err = document.getElementById("checkoutError");
    if (!ok) { err.textContent = "Lengkapi dulu data pengiriman yang wajib diisi."; return; }
    err.textContent = "";
    var items = loadCart();
    var sub = cartSubtotal(items), disc = voucherDiscount(sub);
    var orders = [];
    try { orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch (ex) { orders = []; }
    var order = {
      id: "HNA-2026-" + (2481 + orders.length * 7 + Math.floor(Math.random() * 90)),
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      items: items,
      subtotal: sub,
      discount: disc,
      total: sub - disc,
      customer: {
        name: document.getElementById("coName").value.trim(),
        email: document.getElementById("coEmail").value.trim(),
        phone: document.getElementById("coPhone").value.trim(),
        address: document.getElementById("coAddress").value.trim(),
        city: document.getElementById("coCity").value.trim(),
        zip: document.getElementById("coZip").value.trim()
      },
      payment: (form.querySelector("input[name='pay']:checked") || {}).value || "Transfer Bank"
    };
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    saveCart([]);
    setVoucher("");
    location.href = "order-success.html";
  });
}

function initSuccess() {
  var box = document.getElementById("successDetail");
  if (!box) return;
  var order = null;
  try { order = JSON.parse(localStorage.getItem(LAST_ORDER_KEY)); } catch (e) { order = null; }
  if (!order) {
    box.innerHTML = "<p>Belum ada pesanan terakhir. <a href='koleksi.html'>Lihat koleksi</a></p>";
    return;
  }
  box.innerHTML =
    '<p class="success-id">Nomor pesanan: <strong>' + order.id + "</strong></p>" +
    "<ul>" + order.items.map(function (it) {
      return "<li>" + it.name + " — " + it.size + " × " + it.qty + " <span>" + formatRp(it.price * it.qty) + "</span></li>";
    }).join("") + "</ul>" +
    (order.discount ? '<div class="drawer-row"><span>Diskon HINA10</span><span>−' + formatRp(order.discount) + "</span></div>" : "") +
    '<div class="drawer-row drawer-total"><span>Total</span><span>' + formatRp(order.total) + "</span></div>" +
    "<p>Dikirim ke: " + order.customer.name + ", " + order.customer.address + ", " +
    order.customer.city + " " + order.customer.zip + "<br>Metode pembayaran: " + order.payment +
    " (simulasi — tidak ada pembayaran nyata).</p>";
}

document.addEventListener("DOMContentLoaded", function () {
  initCheckout();
  initSuccess();
});
