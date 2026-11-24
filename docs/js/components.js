/* HINA — header & footer bersama untuk halaman non-hero.
   Di index.html, header ramping ini muncul setelah hero terlewati. */
var USER_KEY = "hina_demo_user";

function demoUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; }
}

function headerHTML(active) {
  var user = demoUser();
  var accountLink = user
    ? '<a href="akun.html" class="hdr-user">' + user.name.split(" ")[0] + '</a>'
    : '<a href="masuk.html">Masuk</a><span class="hdr-sep">|</span><a href="daftar.html">Daftar</a>';
  function nav(page, href, label) {
    return '<a href="' + href + '"' + (active === page ? ' class="active"' : "") + '>' + label + '</a>';
  }
  return '<div class="hdr-inner">' +
    '<a class="hdr-logo" href="index.html">HINA</a>' +
    '<nav class="hdr-nav">' +
      nav("beranda", "index.html", "Beranda") +
      nav("koleksi", "koleksi.html", "Koleksi") +
      nav("tentang", "tentang.html", "Tentang") +
      nav("kontak", "kontak.html", "Kontak") +
    '</nav>' +
    '<div class="hdr-right">' + accountLink +
      '<a href="keranjang.html" class="hdr-cart" data-open-cart>Keranjang ' +
      '<span class="cart-badge" style="display:none">0</span></a>' +
    '</div></div>';
}

function footerHTML() {
  return '<div class="ftr-inner">' +
    '<div class="ftr-col ftr-brand"><span class="ftr-logo">HINA</span>' +
    '<p>Lemari kecil berisi pakaian anak yang lembut — katun, linen, dan rajut untuk bermain dan tidur siang.</p></div>' +
    '<div class="ftr-col"><h4>Navigasi</h4>' +
    '<a href="index.html">Beranda</a><a href="koleksi.html">Koleksi</a>' +
    '<a href="tentang.html">Tentang</a><a href="kontak.html">Kontak</a></div>' +
    '<div class="ftr-col"><h4>Kategori</h4>' +
    '<a href="koleksi.html?cat=gaun">Gaun</a><a href="koleksi.html?cat=atasan">Atasan</a>' +
    '<a href="koleksi.html?cat=luaran">Luaran</a></div>' +
    '<div class="ftr-col"><h4>Hubungi Kami</h4>' +
    '<p>halo@hina.example<br>WhatsApp 0812-3456-7890<br>Jl. Kenanga No. 8, Jakarta Selatan</p></div>' +
    '</div><div class="ftr-base">© 2026 HINA · Little Wardrobe</div>';
}

function initComponents() {
  var page = document.body.getAttribute("data-page") || "";
  var hdr = document.getElementById("siteHeader");
  if (hdr) {
    hdr.innerHTML = headerHTML(page);
    if (page === "beranda") {
      /* Header ramping muncul setelah hero terlewati. */
      var hero = document.getElementById("heroSection");
      var onScroll = function () {
        var past = hero ? window.scrollY > hero.offsetHeight - 80 : window.scrollY > 400;
        hdr.classList.toggle("visible", past);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    } else {
      hdr.classList.add("visible", "solid");
    }
  }
  var ftr = document.getElementById("siteFooter");
  if (ftr) ftr.innerHTML = footerHTML();
  if (typeof updateBadges === "function") updateBadges();
}

document.addEventListener("DOMContentLoaded", initComponents);
