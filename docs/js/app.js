/* HINA — logika katalog, modal produk, dan halaman-halaman demo. */

/* ---------- Kartu produk ---------- */
function productCard(p) {
  var out = p.stock <= 0;
  var badges = "";
  if (p.badge) badges = '<span class="card-badge' + (p.badge === "Baru" ? " badge-new" : "") + '">' + p.badge.toUpperCase() + "</span>";
  if (out) badges = '<span class="card-badge badge-out">HABIS</span>';
  var price = p.promoPrice
    ? '<span class="price-old">' + formatRp(p.price) + '</span> <span class="price-promo">' + formatRp(p.promoPrice) + "</span>"
    : "<span>" + formatRp(p.price) + "</span>";
  return '<article class="product-card" data-slug="' + p.slug + '">' +
    '<button class="card-media" data-quick="' + p.slug + '" aria-label="Lihat ' + p.name + '">' +
      '<span class="card-img" style="' + spriteStyle(p.id) + '"></span>' + badges + "</button>" +
    '<div class="card-body">' +
      '<div class="card-stars">' + starRow(p.rating) + ' <span>' + String(p.rating).replace(".", ",") + "</span></div>" +
      "<h3>" + p.name + "</h3>" +
      '<p class="card-desc">' + p.desc + "</p>" +
      '<div class="card-price">' + price + "</div>" +
      '<div class="card-actions">' +
        '<button class="btn btn-small" data-quick="' + p.slug + '">Lihat Cepat</button>' +
        '<button class="btn btn-small btn-dark" data-add="' + p.slug + '"' + (out ? " disabled" : "") + '>' + (out ? "Stok Habis" : "Tambah") + "</button>" +
      "</div></div></article>";
}
function bindCardButtons(scope) {
  scope.querySelectorAll("[data-quick]").forEach(function (el) {
    el.addEventListener("click", function () { openModal(el.getAttribute("data-quick")); });
  });
  scope.querySelectorAll("[data-add]").forEach(function (el) {
    el.addEventListener("click", function () {
      var p = getProduct(el.getAttribute("data-add"));
      if (p && p.stock > 0) addToCart(p, p.sizes[1] || p.sizes[0], 1);
    });
  });
}

/* ---------- Beranda: produk unggulan ---------- */
function renderFeatured() {
  var grid = document.getElementById("featuredGrid");
  if (!grid) return;
  var ids = [1, 4, 7, 9];
  grid.innerHTML = ids.map(function (id) { return productCard(getProduct(id)); }).join("");
  bindCardButtons(grid);
}

/* ---------- Koleksi: filter / cari / urut / muat lagi ---------- */
var shopState = { cat: "semua", q: "", sort: "unggulan", shown: 8 };
function filteredProducts() {
  var list = PRODUCTS.filter(function (p) {
    if (shopState.cat !== "semua" && p.category !== shopState.cat) return false;
    if (shopState.q && p.name.toLowerCase().indexOf(shopState.q) === -1 &&
        p.desc.toLowerCase().indexOf(shopState.q) === -1) return false;
    return true;
  });
  if (shopState.sort === "murah") list.sort(function (a, b) { return basePrice(a) - basePrice(b); });
  else if (shopState.sort === "mahal") list.sort(function (a, b) { return basePrice(b) - basePrice(a); });
  else if (shopState.sort === "terbaru") list.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id; });
  return list;
}
function renderShop() {
  var grid = document.getElementById("shopGrid");
  if (!grid) return;
  var list = filteredProducts();
  var visible = list.slice(0, shopState.shown);
  grid.innerHTML = visible.length
    ? visible.map(productCard).join("")
    : '<p class="shop-empty">Tidak ada produk yang cocok dengan pencarianmu.</p>';
  bindCardButtons(grid);
  var info = document.getElementById("shopInfo");
  if (info) info.textContent = "Menampilkan " + visible.length + " dari " + list.length + " produk";
  var more = document.getElementById("loadMore");
  if (more) more.style.display = list.length > shopState.shown ? "" : "none";
}
function initShop() {
  var grid = document.getElementById("shopGrid");
  if (!grid) return;
  var params = new URLSearchParams(location.search);
  if (params.get("cat")) shopState.cat = params.get("cat");
  var chips = document.getElementById("filterChips");
  if (chips) {
    chips.innerHTML = CATEGORIES.map(function (c) {
      return '<button class="chip' + (shopState.cat === c.id ? " active" : "") + '" data-cat="' + c.id + '">' + c.label + "</button>";
    }).join("");
    chips.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cat]");
      if (!btn) return;
      shopState.cat = btn.getAttribute("data-cat");
      shopState.shown = 8;
      chips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === btn); });
      renderShop();
    });
  }
  var search = document.getElementById("shopSearch");
  if (search) search.addEventListener("input", function () {
    shopState.q = search.value.trim().toLowerCase(); shopState.shown = 8; renderShop();
  });
  var sort = document.getElementById("shopSort");
  if (sort) sort.addEventListener("change", function () { shopState.sort = sort.value; renderShop(); });
  var more = document.getElementById("loadMore");
  if (more) more.addEventListener("click", function () { shopState.shown += 8; renderShop(); });
  renderShop();
  if (params.get("product")) openModal(params.get("product"));
}

/* ---------- Modal detail produk (tiga tab) ---------- */
var modalState = { product: null, size: null, qty: 1, tab: 1 };
function ensureModal() {
  if (document.getElementById("productModal")) return;
  var wrap = document.createElement("div");
  wrap.innerHTML =
    '<div class="modal-overlay" id="modalOverlay"></div>' +
    '<div class="modal" id="productModal" role="dialog" aria-modal="true">' +
      '<button class="modal-close" id="modalClose" aria-label="Tutup">×</button>' +
      '<div class="modal-media">' +
        '<div class="modal-tabs" id="modalTabs">' +
          '<button data-tab="1" class="active">01 / Di Gantungan</button>' +
          '<button data-tab="2">02 / Kain</button>' +
          '<button data-tab="3">03 / Detail</button></div>' +
        '<div class="modal-box" id="modalBox">' +
          '<div class="modal-layer" data-layer="1"></div>' +
          '<div class="modal-layer" data-layer="2"></div>' +
          '<div class="modal-layer" data-layer="3"></div></div>' +
        '<p class="modal-caption" id="modalCaption"></p></div>' +
      '<div class="modal-info" id="modalInfo"></div>' +
    '</div>';
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", closeModal);
  document.getElementById("modalTabs").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-tab]");
    if (btn) setModalTab(parseInt(btn.getAttribute("data-tab"), 10));
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
}
var MODAL_CAPTIONS = {
  1: "Digantung pada gantungan kayu kecil.",
  2: "Lembut disentuh, dicuci agar nyaman.",
  3: "Sentuhan kecil, dijahit agar awet."
};
function setModalTab(tab) {
  modalState.tab = tab;
  var p = modalState.product;
  if (!p) return;
  document.querySelectorAll("#modalTabs [data-tab]").forEach(function (b) {
    b.classList.toggle("active", parseInt(b.getAttribute("data-tab"), 10) === tab);
  });
  document.querySelectorAll("#modalBox .modal-layer").forEach(function (layer) {
    var n = parseInt(layer.getAttribute("data-layer"), 10);
    layer.classList.toggle("active", n === tab);
    if (n === tab) {
      var style = n === 1 ? hangerStyle(p.id) : n === 2 ? fabricStyle(p.id) : detailStyle(p.id);
      layer.setAttribute("style", style);
    }
  });
  document.getElementById("modalCaption").textContent = MODAL_CAPTIONS[tab];
}
function openModal(slug) {
  var p = getProduct(slug);
  if (!p) return;
  ensureModal();
  modalState.product = p;
  modalState.size = p.sizes[1] || p.sizes[0];
  modalState.qty = 1;
  var info = document.getElementById("modalInfo");
  var out = p.stock <= 0;
  info.innerHTML =
    '<div class="card-stars">' + starRow(p.rating) + " <span>" + String(p.rating).replace(".", ",") + "</span></div>" +
    "<h3>" + p.name + "</h3>" +
    '<p class="modal-desc">' + p.desc + "</p>" +
    '<div class="modal-price">' + (p.promoPrice
      ? '<span class="price-old">' + formatRp(p.price) + '</span> <span class="price-promo">' + formatRp(p.promoPrice) + "</span>"
      : formatRp(p.price)) + "</div>" +
    '<div class="modal-spec"><span>Bahan</span><strong>' + p.material + "</strong></div>" +
    '<div class="modal-spec"><span>Warna</span><strong>' + p.colour + "</strong></div>" +
    '<div class="modal-spec"><span>Stok</span><strong>' + (out ? "Habis" : p.stock + " tersedia") + "</strong></div>" +
    '<label class="modal-label">Ukuran</label>' +
    '<div class="size-row" id="modalSizes">' + p.sizes.map(function (s) {
      return '<button class="size-chip' + (s === modalState.size ? " active" : "") + '" data-size="' + s + '">' + s + "</button>";
    }).join("") + "</div>" +
    '<label class="modal-label">Jumlah</label>' +
    '<div class="qty-row qty-big"><button id="modalDec">−</button><span id="modalQty">1</span><button id="modalInc">+</button></div>' +
    '<button class="btn btn-dark btn-block" id="modalAdd"' + (out ? " disabled" : "") + '>' + (out ? "Stok Habis" : "Tambah ke Keranjang") + "</button>" +
    '<div class="modal-rec"><h4>Mungkin kamu suka</h4><div class="rec-row" id="modalRec"></div></div>';
  var recs = PRODUCTS.filter(function (r) { return r.id !== p.id && r.category === p.category; }).slice(0, 3);
  if (recs.length < 3) recs = recs.concat(PRODUCTS.filter(function (r) { return r.id !== p.id && recs.indexOf(r) === -1; })).slice(0, 3);
  document.getElementById("modalRec").innerHTML = recs.map(function (r) {
    return '<button class="rec-item" data-rec="' + r.slug + '">' +
      '<span class="rec-thumb" style="' + spriteStyle(r.id) + '"></span>' +
      "<span>" + r.name + "</span><span>" + formatRp(basePrice(r)) + "</span></button>";
  }).join("");
  info.querySelectorAll("[data-rec]").forEach(function (el) {
    el.addEventListener("click", function () { openModal(el.getAttribute("data-rec")); });
  });
  info.querySelectorAll("[data-size]").forEach(function (el) {
    el.addEventListener("click", function () {
      modalState.size = el.getAttribute("data-size");
      info.querySelectorAll("[data-size]").forEach(function (c) { c.classList.toggle("active", c === el); });
    });
  });
  document.getElementById("modalDec").addEventListener("click", function () {
    modalState.qty = Math.max(1, modalState.qty - 1);
    document.getElementById("modalQty").textContent = modalState.qty;
  });
  document.getElementById("modalInc").addEventListener("click", function () {
    modalState.qty += 1;
    document.getElementById("modalQty").textContent = modalState.qty;
  });
  var add = document.getElementById("modalAdd");
  if (add) add.addEventListener("click", function () {
    addToCart(modalState.product, modalState.size, modalState.qty);
    closeModal();
  });
  setModalTab(1);
  document.getElementById("productModal").classList.add("open");
  document.getElementById("modalOverlay").classList.add("show");
}
function closeModal() {
  var m = document.getElementById("productModal"), o = document.getElementById("modalOverlay");
  if (m) m.classList.remove("open");
  if (o) o.classList.remove("show");
}

/* ---------- Halaman keranjang ---------- */
function renderCartPage() {
  var box = document.getElementById("cartPageItems");
  if (!box) return;
  var items = loadCart();
  var summary = document.getElementById("cartPageSummary");
  if (!items.length) {
    box.innerHTML = '<p class="shop-empty">Keranjangmu masih kosong. <a href="koleksi.html">Lihat koleksi</a></p>';
    if (summary) summary.innerHTML = "";
    return;
  }
  box.innerHTML = items.map(function (it, i) {
    var p = getProduct(it.id);
    return '<div class="cart-line">' +
      '<div class="cart-thumb" style="' + (p ? spriteStyle(p.id) : "") + '"></div>' +
      '<div class="cart-line-info"><strong>' + it.name + "</strong><span>Ukuran " + it.size + "</span>" +
      "<span>" + formatRp(it.price) + "</span></div>" +
      '<div class="qty-row"><button data-cact="dec" data-i="' + i + '">−</button><span>' + it.qty + "</span>" +
      '<button data-cact="inc" data-i="' + i + '">+</button>' +
      '<button class="qty-remove" data-cact="del" data-i="' + i + '">Hapus</button></div>' +
      '<div class="cart-line-total">' + formatRp(it.price * it.qty) + "</div></div>";
  }).join("");
  var sub = cartSubtotal(items), disc = voucherDiscount(sub);
  if (summary) summary.innerHTML =
    '<div class="drawer-row"><span>Subtotal</span><span>' + formatRp(sub) + "</span></div>" +
    (disc ? '<div class="drawer-row"><span>Voucher HINA10</span><span>−' + formatRp(disc) + "</span></div>" : "") +
    '<div class="drawer-row drawer-total"><span>Total</span><span>' + formatRp(sub - disc) + "</span></div>" +
    '<a class="btn btn-dark btn-block" href="checkout.html">Lanjut ke Checkout</a>';
}
function initCartPage() {
  var box = document.getElementById("cartPageItems");
  if (!box) return;
  renderCartPage();
  box.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-cact]");
    if (!btn) return;
    var i = parseInt(btn.getAttribute("data-i"), 10);
    var cart = loadCart();
    if (!cart[i]) return;
    var act = btn.getAttribute("data-cact");
    if (act === "inc") setQty(i, cart[i].qty + 1);
    else if (act === "dec") setQty(i, cart[i].qty - 1);
    else if (act === "del") setQty(i, 0);
  });
}

/* ---------- FAQ & newsletter & kontak ---------- */
function initMisc() {
  document.querySelectorAll(".faq-item > button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.parentElement.classList.toggle("open");
    });
  });
  var news = document.getElementById("newsletterForm");
  if (news) news.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("newsletterEmail");
    var msg = document.getElementById("newsletterMsg");
    if (!email.value || email.value.indexOf("@") === -1) {
      msg.textContent = "Masukkan alamat email yang valid.";
      return;
    }
    msg.textContent = "Terima kasih sudah mendaftar! (Simulasi — email tidak benar-benar dikirim atau disimpan di server.)";
    email.value = "";
  });
  var contact = document.getElementById("contactForm");
  if (contact) contact.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    contact.querySelectorAll("[required]").forEach(function (f) {
      if (!f.value.trim()) { ok = false; f.classList.add("invalid"); }
      else f.classList.remove("invalid");
    });
    var msg = document.getElementById("contactMsg");
    if (!ok) { msg.textContent = "Lengkapi dulu kolom yang wajib diisi."; return; }
    msg.textContent = "Pesan terkirim. Terima kasih! (Simulasi — pesan tidak benar-benar dikirim.)";
    contact.reset();
  });
  var voucherBtn = document.getElementById("applyVoucherHome");
  if (voucherBtn) voucherBtn.addEventListener("click", function () {
    setVoucher("HINA10");
    showToast("Voucher HINA10 aktif — diskon 10% di keranjangmu.");
  });
  var copyBtn = document.getElementById("copyVoucher");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    if (navigator.clipboard) navigator.clipboard.writeText("HINA10");
    showToast("Kode HINA10 disalin.");
  });
}

/* ---------- Akun demo (masuk / daftar / akun) ---------- */
function initAuth() {
  var reg = document.getElementById("registerForm");
  if (reg) reg.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("regName").value.trim();
    var email = document.getElementById("regEmail").value.trim();
    if (!name || email.indexOf("@") === -1) {
      document.getElementById("regMsg").textContent = "Isi nama dan email yang valid.";
      return;
    }
    /* Hanya nama + email yang disimpan. Kata sandi TIDAK pernah disimpan. */
    localStorage.setItem(USER_KEY, JSON.stringify({ name: name, email: email }));
    location.href = "akun.html";
  });
  var login = document.getElementById("loginForm");
  if (login) login.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("loginEmail").value.trim();
    if (email.indexOf("@") === -1) {
      document.getElementById("loginMsg").textContent = "Masukkan email yang valid.";
      return;
    }
    var user = demoUser();
    if (!user || user.email !== email) {
      user = { name: email.split("@")[0], email: email };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    location.href = "akun.html";
  });
  var forgot = document.getElementById("forgotLink");
  if (forgot) forgot.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("loginMsg").textContent = "Tautan atur ulang kata sandi dikirim ke emailmu. (Simulasi)";
  });
  var profile = document.getElementById("accountProfile");
  if (profile) {
    var user = demoUser();
    if (!user) { location.href = "masuk.html"; return; }
    profile.innerHTML = "<h3>" + user.name + "</h3><p>" + user.email + "</p>" +
      '<button class="btn" id="logoutBtn">Keluar</button>';
    document.getElementById("logoutBtn").addEventListener("click", function () {
      localStorage.removeItem(USER_KEY);
      location.href = "index.html";
    });
    var orders = [];
    try { orders = JSON.parse(localStorage.getItem("hina_orders")) || []; } catch (err) { orders = []; }
    var list = document.getElementById("accountOrders");
    if (list) {
      list.innerHTML = orders.length ? orders.map(function (o) {
        return '<li><strong>' + o.id + "</strong> — " + o.date + " — " + formatRp(o.total) +
          "<br><span>" + o.items.map(function (it) { return it.name + " (" + it.size + ") × " + it.qty; }).join(", ") + "</span></li>";
      }).join("") : "<li>Belum ada pesanan. <a href='koleksi.html'>Mulai belanja</a></li>";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderFeatured();
  initShop();
  initCartPage();
  initMisc();
  initAuth();
});
