/* HINA — keranjang belanja demo (localStorage). */
var CART_KEY = "hina_cart";
var VOUCHER_KEY = "hina_voucher";

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}
function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateBadges(items);
}
function cartCount(items) {
  return items.reduce(function (a, it) { return a + it.qty; }, 0);
}
function cartSubtotal(items) {
  return items.reduce(function (a, it) { return a + it.price * it.qty; }, 0);
}
function updateBadges(items) {
  items = items || loadCart();
  var n = cartCount(items);
  document.querySelectorAll(".cart-badge").forEach(function (b) {
    b.textContent = n;
    b.style.display = n > 0 ? "inline-flex" : "none";
  });
}
function addToCart(product, size, qty) {
  var items = loadCart();
  var found = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === product.id && items[i].size === size) { found = items[i]; break; }
  }
  if (found) found.qty += qty;
  else items.push({ id: product.id, slug: product.slug, name: product.name, size: size, qty: qty, price: basePrice(product) });
  saveCart(items);
  showToast(product.name + " (" + size + ") × " + qty + " masuk keranjang.");
  renderDrawer();
  openDrawer();
}
function setQty(idx, qty) {
  var items = loadCart();
  if (qty <= 0) items.splice(idx, 1); else items[idx].qty = qty;
  saveCart(items);
  renderDrawer();
  if (typeof renderCartPage === "function") renderCartPage();
  if (typeof renderCheckout === "function") renderCheckout();
}
function getVoucher() { return localStorage.getItem(VOUCHER_KEY) || ""; }
function setVoucher(code) {
  if (code) localStorage.setItem(VOUCHER_KEY, code);
  else localStorage.removeItem(VOUCHER_KEY);
}
function voucherDiscount(subtotal) {
  return getVoucher() === "HINA10" ? Math.round(subtotal * 0.10) : 0;
}

/* ---------- Drawer keranjang ---------- */
function drawerHTML() {
  return '<div class="drawer-overlay" id="drawerOverlay"></div>' +
    '<aside class="cart-drawer" id="cartDrawer" aria-label="Keranjang belanja">' +
    '<div class="drawer-head"><span>Keranjang Kamu</span>' +
    '<button class="drawer-close" id="drawerClose" aria-label="Tutup keranjang">×</button></div>' +
    '<div class="drawer-items" id="drawerItems"></div>' +
    '<div class="drawer-foot" id="drawerFoot"></div></aside>';
}
function renderDrawer() {
  var box = document.getElementById("drawerItems");
  var foot = document.getElementById("drawerFoot");
  if (!box || !foot) return;
  var items = loadCart();
  if (!items.length) {
    box.innerHTML = '<p class="drawer-empty">Keranjangmu masih kosong.</p>';
    foot.innerHTML = '<a class="btn btn-dark" href="koleksi.html">Lihat Koleksi</a>';
    return;
  }
  box.innerHTML = items.map(function (it, i) {
    var p = getProduct(it.id);
    return '<div class="drawer-item">' +
      '<div class="drawer-thumb" style="' + (p ? spriteStyle(p.id) : "") + '" role="img" aria-label="' + it.name + '"></div>' +
      '<div class="drawer-info"><strong>' + it.name + '</strong>' +
      '<span>Ukuran ' + it.size + '</span><span>' + formatRp(it.price) + '</span>' +
      '<div class="qty-row"><button data-act="dec" data-i="' + i + '">−</button><span>' + it.qty + '</span>' +
      '<button data-act="inc" data-i="' + i + '">+</button>' +
      '<button class="qty-remove" data-act="del" data-i="' + i + '">Hapus</button></div></div>' +
      '<div class="drawer-line">' + formatRp(it.price * it.qty) + '</div></div>';
  }).join("");
  var sub = cartSubtotal(items), disc = voucherDiscount(sub);
  foot.innerHTML = '<div class="drawer-row"><span>Subtotal</span><span>' + formatRp(sub) + '</span></div>' +
    (disc ? '<div class="drawer-row"><span>Voucher HINA10</span><span>−' + formatRp(disc) + '</span></div>' : "") +
    '<div class="drawer-row drawer-total"><span>Total</span><span>' + formatRp(sub - disc) + '</span></div>' +
    '<a class="btn btn-dark" href="checkout.html">Checkout</a>' +
    '<a class="btn btn-ghost" href="keranjang.html">Lihat Keranjang</a>';
}
function openDrawer() {
  var d = document.getElementById("cartDrawer"), o = document.getElementById("drawerOverlay");
  if (d) d.classList.add("open"); if (o) o.classList.add("show");
}
function closeDrawer() {
  var d = document.getElementById("cartDrawer"), o = document.getElementById("drawerOverlay");
  if (d) d.classList.remove("open"); if (o) o.classList.remove("show");
}
function initDrawer() {
  if (!document.getElementById("cartDrawer")) {
    var wrap = document.createElement("div");
    wrap.innerHTML = drawerHTML();
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }
  renderDrawer();
  updateBadges();
  var close = document.getElementById("drawerClose");
  var overlay = document.getElementById("drawerOverlay");
  if (close) close.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);
  var items = document.getElementById("drawerItems");
  if (items) items.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var i = parseInt(btn.getAttribute("data-i"), 10);
    var cart = loadCart();
    if (!cart[i]) return;
    if (btn.getAttribute("data-act") === "inc") setQty(i, cart[i].qty + 1);
    else if (btn.getAttribute("data-act") === "dec") setQty(i, cart[i].qty - 1);
    else if (btn.getAttribute("data-act") === "del") setQty(i, 0);
  });
  document.querySelectorAll("[data-open-cart]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); renderDrawer(); openDrawer(); });
  });
}

/* ---------- Toast ---------- */
function showToast(msg) {
  var t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast"; t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove("show"); }, 2600);
}

document.addEventListener("DOMContentLoaded", initDrawer);
