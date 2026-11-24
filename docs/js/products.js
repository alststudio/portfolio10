/* HINA — data pusat produk + helper crop gambar.
   Semua visual berasal dari 4 sheet melalui proxy images.higgs.ai.
   PENTING: nilai style yang dihasilkan memakai url('...') dengan kutip
   tunggal — string ini disisipkan ke atribut style="..." (kutip ganda),
   jadi kutip ganda di dalam url() akan memutus atribut. */

function proxyURL(resultLink, width) {
  return "https://images.higgs.ai/?default=1&output=webp&url=" +
    encodeURIComponent(resultLink) + "&w=" + width + "&q=85";
}

var SHEET_BASE = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";
var GARMENT_URL = proxyURL(SHEET_BASE + "hf_20261113_121624_09fa35c4-680e-46a5-b6a9-8acd429bce67.png", 3312);
var SMOCK_URL   = proxyURL(SHEET_BASE + "hf_20261113_121448_68442996-20c3-4f65-8f3d-56d2b6df8152.png", 2048);
var FABRIC_URL  = proxyURL(SHEET_BASE + "hf_20261113_132947_dc18692c-66e4-447b-a11e-167b3bcadefb.png", 3312);
var DETAIL_URL  = proxyURL(SHEET_BASE + "hf_20261113_132948_27322be0-e8d1-436a-a229-09ef6371cb98.png", 3312);

/* Kotak sprite pada sheet pakaian: [x, y, w, h, hookX] (urutan baca). */
var SPRITES = [
  [120, 54, 560, 742, 404],
  [982, 56, 508, 708, 1244],
  [1792, 62, 558, 588, 2067],
  [2638, 54, 514, 726, 2893],
  [110, 865, 596, 652, 406],
  [938, 869, 610, 650, 1234],
  [1844, 855, 456, 718, 2067],
  [2614, 861, 570, 630, 2895],
  [112, 1661, 592, 712, 407],
  [996, 1661, 492, 716, 1237],
  [1832, 1663, 478, 714, 2067],
  [2682, 1673, 434, 630, 2894]
];

/* Rentang sel sheet kain & detail: kolom [x0,x1], baris [y0,y1]. */
var FABRIC_COLS = [[0, 805], [836, 1638], [1668, 2476], [2506, 3311]];
var FABRIC_ROWS = [[0, 803], [834, 1633], [1664, 2479]];
var DETAIL_COLS = [[0, 811], [842, 1640], [1671, 2470], [2501, 3311]];
var DETAIL_ROWS = [[0, 804], [835, 1635], [1668, 2479]];

/* Sel sheet detail khusus gaun smock (produk 1): asal sel 2x2. */
var SMOCK_CELLS = { hanger: [0, 0], detail: [1041, 0], fabric: [0, 1041] };

var PRODUCTS = [
  { id: 1, slug: "gaun-smock", name: "Gaun Smock", category: "gaun",
    desc: "Katun sikat lembut dengan smock jahit tangan. Untuk bermain dan tidur siang.",
    material: "Katun Organik", colour: "Periwinkle / Blush / Awan", sizes: ["2Y", "4Y", "6Y"],
    price: 389000, promoPrice: 329000, badge: "Promo", rating: 4.9, stock: 14, isNew: false },
  { id: 2, slug: "gaun-muslin", name: "Gaun Muslin", category: "gaun",
    desc: "Kasa ganda ringan dengan lengan flutter kecil untuk hari yang hangat.",
    material: "Katun Muslin", colour: "Putih Awan", sizes: ["2Y", "4Y", "6Y"],
    price: 299000, promoPrice: null, badge: null, rating: 4.8, stock: 20, isNew: false },
  { id: 3, slug: "kardigan-pointelle", name: "Kardigan Pointelle", category: "luaran",
    desc: "Rajut pointelle halus dengan kancing kayu. Ringan dan mudah dipadukan.",
    material: "Rajut Katun", colour: "Blush", sizes: ["1Y", "2Y", "4Y"],
    price: 279000, promoPrice: null, badge: null, rating: 4.7, stock: 11, isNew: false },
  { id: 4, slug: "gaun-dungaree", name: "Gaun Dungaree", category: "gaun",
    desc: "Denim lembut washed dengan rok mengembang dan tali yang bisa diatur.",
    material: "Denim Katun", colour: "Periwinkle Pudar", sizes: ["2Y", "4Y", "6Y"],
    price: 359000, promoPrice: null, badge: "Baru", rating: 4.8, stock: 9, isNew: true },
  { id: 5, slug: "blus-ruffle", name: "Blus Ruffle", category: "atasan",
    desc: "Katun crinkle dengan kerah ruffle lebar dan lengan puff yang manis.",
    material: "Katun Crinkle", colour: "Abu Lilac", sizes: ["2Y", "4Y", "6Y"],
    price: 249000, promoPrice: null, badge: null, rating: 4.6, stock: 17, isNew: false },
  { id: 6, slug: "smock-broderie", name: "Smock Broderie", category: "atasan",
    desc: "Broderie anglaise dengan bahu frill dan potongan yang longgar.",
    material: "Katun Broderie", colour: "Putih Awan", sizes: ["2Y", "4Y", "6Y"],
    price: 379000, promoPrice: null, badge: null, rating: 4.9, stock: 8, isNew: false },
  { id: 7, slug: "pinafore-linen", name: "Pinafore Linen", category: "gaun",
    desc: "Linen washed dengan tali kancing dan dua saku tempel yang dalam.",
    material: "Linen 100%", colour: "Blush", sizes: ["2Y", "4Y", "6Y"],
    price: 339000, promoPrice: 289000, badge: "Promo", rating: 4.8, stock: 12, isNew: false },
  { id: 8, slug: "jumper-rajut", name: "Jumper Rajut", category: "atasan",
    desc: "Rajut katun open-stitch dengan leher bulat yang lembut dan mudah.",
    material: "Rajut Katun", colour: "Periwinkle", sizes: ["1Y", "2Y", "4Y"],
    price: 269000, promoPrice: null, badge: null, rating: 4.7, stock: 15, isNew: false },
  { id: 9, slug: "gaun-frill", name: "Gaun Frill", category: "gaun",
    desc: "Katun pintuck dengan bahu frill dan manset elastis yang nyaman.",
    material: "Katun Organik", colour: "Putih Awan", sizes: ["2Y", "4Y", "6Y"],
    price: 369000, promoPrice: null, badge: "Baru", rating: 4.9, stock: 10, isNew: true },
  { id: 10, slug: "pinafore-saku", name: "Pinafore Saku", category: "gaun",
    desc: "Twill lembut dengan tali frill dan saku untuk harta karun kecil.",
    material: "Katun Twill", colour: "Abu Lilac", sizes: ["2Y", "4Y", "6Y"],
    price: 319000, promoPrice: null, badge: null, rating: 4.8, stock: 13, isNew: false },
  { id: 11, slug: "gaun-gingham", name: "Gaun Gingham", category: "gaun",
    desc: "Gingham bersmock dengan lengan puff pendek untuk hari yang cerah.",
    material: "Katun Gingham", colour: "Blush / Krem", sizes: ["2Y", "4Y", "6Y"],
    price: 349000, promoPrice: null, badge: null, rating: 4.8, stock: 16, isNew: false },
  { id: 12, slug: "rompi-quilt", name: "Rompi Quilt", category: "luaran",
    desc: "Quilt ringan dengan kancing kayu. Hangat, tidak pernah terasa berat.",
    material: "Katun Quilt", colour: "Periwinkle Pucat", sizes: ["1Y", "2Y", "4Y"],
    price: 289000, promoPrice: null, badge: null, rating: 4.7, stock: 0, isNew: false }
];

var CATEGORIES = [
  { id: "semua", label: "Semua" },
  { id: "gaun", label: "Gaun" },
  { id: "atasan", label: "Atasan" },
  { id: "luaran", label: "Luaran" }
];

/* ---------- Helper bersama ---------- */
function formatRp(n) {
  return "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function getProduct(slugOrId) {
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].slug === slugOrId || PRODUCTS[i].id === slugOrId) return PRODUCTS[i];
  }
  return null;
}
function basePrice(p) { return p.promoPrice ? p.promoPrice : p.price; }
function starRow(rating) {
  var full = Math.round(rating), out = "";
  for (var i = 0; i < 5; i++) out += i < full ? "★" : "☆";
  return out;
}

/* Style crop sprite pakaian untuk elemen berukuran bw x bh (metode
   persentase, bebas resolusi; elemen memakai aspect-ratio sprite). */
function spriteStyle(productId) {
  var b = SPRITES[productId - 1];
  var x = b[0], y = b[1], w = b[2], h = b[3];
  var sx = (3312 / w * 100).toFixed(4), sy = (2480 / h * 100).toFixed(4);
  var px = (x / (3312 - w) * 100).toFixed(4), py = (y / (2480 - h) * 100).toFixed(4);
  return "background-image:url('" + GARMENT_URL + "');background-size:" + sx + "% " + sy +
    "%;background-position:" + px + "% " + py + "%;aspect-ratio:" + w + "/" + h + ";";
}

/* Style crop "cover" untuk satu sel sheet (fabric/detail/smock):
   mengembalikan CSS background lengkap untuk elemen seukuran kotak. */
function cellCoverStyle(url, sheetW, sheetH, rx, ry, rw, rh) {
  /* Persentase background-position untuk cover dihitung relatif terhadap
     selisih ukuran; kami pakai pendekatan piksel lewat background-size
     dalam % dan posisi % dari rumus standar:
     pos% = offset / (sheet - region) * 100 pada sumbu gambar berskala. */
  var sx = (sheetW / rw * 100).toFixed(4), sy = (sheetH / rh * 100).toFixed(4);
  var px = (rx / (sheetW - rw) * 100).toFixed(4), py = (ry / (sheetH - rh) * 100).toFixed(4);
  return "background-image:url('" + url + "');background-size:" + sx + "% " + sy +
    "%;background-position:" + px + "% " + py + "%;";
}

function fabricStyle(productId) {
  if (productId === 1) {
    var c = SMOCK_CELLS.fabric;
    return cellCoverStyle(SMOCK_URL, 2048, 2048, c[0] + 6, c[1] + 6, 995, 995);
  }
  var idx = productId - 1, col = idx % 4, row = Math.floor(idx / 4);
  var rx = FABRIC_COLS[col][0] + 6, ry = FABRIC_ROWS[row][0] + 6;
  var rw = FABRIC_COLS[col][1] - FABRIC_COLS[col][0] - 12;
  var rh = FABRIC_ROWS[row][1] - FABRIC_ROWS[row][0] - 12;
  return cellCoverStyle(FABRIC_URL, 3312, 2480, rx, ry, rw, rh);
}
function detailStyle(productId) {
  if (productId === 1) {
    var c = SMOCK_CELLS.detail;
    return cellCoverStyle(SMOCK_URL, 2048, 2048, c[0] + 6, c[1] + 6, 995, 995);
  }
  var idx = productId - 1, col = idx % 4, row = Math.floor(idx / 4);
  var rx = DETAIL_COLS[col][0] + 6, ry = DETAIL_ROWS[row][0] + 6;
  var rw = DETAIL_COLS[col][1] - DETAIL_COLS[col][0] - 12;
  var rh = DETAIL_ROWS[row][1] - DETAIL_ROWS[row][0] - 12;
  return cellCoverStyle(DETAIL_URL, 3312, 2480, rx, ry, rw, rh);
}
/* Tab "Di Gantungan" untuk modal: produk 1 memakai sel foto smock,
   produk lain memakai sprite-nya sendiri. */
function hangerStyle(productId) {
  if (productId === 1) {
    var c = SMOCK_CELLS.hanger;
    return cellCoverStyle(SMOCK_URL, 2048, 2048, c[0], c[1], 1007, 1007);
  }
  return spriteStyle(productId);
}
