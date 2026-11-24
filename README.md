# HINA — Lemari Kecil (portfolio10)

Website demo untuk label fiktif pakaian anak **HINA**: hero berupa rel pakaian
diagonal interaktif (12 potong pakaian pada satu rel) yang dilengkapi menjadi
website e-commerce lengkap — katalog, keranjang, checkout, dan akun demo.
Situs ini statis (HTML/CSS/JS tanpa build) dan diterbitkan lewat GitHub Pages
dari folder `docs/` pada branch `main`:
https://alststudio.github.io/portfolio10/

Semua teks berbahasa Indonesia. Harga dalam Rupiah.

## Struktur

```
docs/
  index.html        Beranda: hero rel interaktif (CSS+JS hero tertanam inline
                    di file ini) + section pelengkap di bawahnya
  koleksi.html      Katalog 12 produk: filter kategori, pencarian, urutan, muat lagi
  tentang.html      Cerita & nilai HINA
  kontak.html       Kontak + formulir pesan (simulasi)
  keranjang.html    Halaman keranjang
  checkout.html     Formulir checkout + voucher (simulasi)
  order-success.html  Ringkasan pesanan terakhir
  masuk.html / daftar.html / akun.html   Akun demo
  css/style.css     Gaya bersama semua halaman (di luar hero)
  css/responsive.css  Penyesuaian layar kecil (di luar hero)
  js/products.js    DATA PUSAT: 12 produk + semua data crop gambar
  js/cart.js        Keranjang (localStorage) + drawer + toast
  js/components.js  Header & footer bersama
  js/app.js         Katalog, modal produk 3 tab, FAQ, akun demo
  js/checkout.js    Checkout, voucher HINA10, pesanan simulasi
  assets/fonts/     Noto Sans variable (woff2, self-hosted)
```

## Menjalankan secara lokal

Cukup sajikan folder `docs/` dengan server statis apa pun, misalnya:

```
cd docs && python3 -m http.server 8000
```

Lalu buka http://localhost:8000/. Semua path bersifat relatif sehingga situs
juga bekerja dari subpath (mis. `/portfolio10/`).

## Gambar

Tidak ada gambar yang di-host lokal. Semua visual adalah crop CSS dari 4 sheet
foto yang dimuat lewat proxy `images.higgs.ai`:

1. Sheet sprite pakaian (transparan, 3312×2480) — semua potong di rel & kartu.
2. Sheet detail gaun smock (2048×2048) — tab foto produk 1.
3. Sheet makro kain (3312×2480) — tab "Kain".
4. Sheet close-up detail (3312×2480) — tab "Detail".

Koordinat crop (kotak sprite, rentang sel kain/detail) ada di `js/products.js`.
Hero menyimpan salinan data crop-nya sendiri di dalam script inline
`index.html` (hero memang harus mandiri dalam satu file); bila mengubah
koordinat, ubah di kedua tempat. Nilai style crop selalu memakai
`url('...')` berkutip tunggal karena string-nya disisipkan ke atribut
`style="..."`.

## Mengubah konten

- **Harga / produk / stok / promo:** edit array `PRODUCTS` di `js/products.js`
  (`price`, `promoPrice`, `stock`, `badge`, `sizes`, `rating`).
- **Logo / nama brand:** teks "HINA" ada di `index.html` (navigasi hero),
  `js/components.js` (header & footer), dan footer setiap halaman dibuat oleh
  `components.js`.
- **Warna:** token warna ada di `:root` pada `css/style.css` dan di bagian
  `<style>` inline `index.html` (dinding #ECE6EB, tinta #32333F, periwinkle
  #9D9FE4, blush #E9ACA9).
- **Kontak / WhatsApp / alamat:** `docs/kontak.html` dan `footerHTML()` di
  `js/components.js` (saat ini placeholder: halo@hina.example,
  0812-3456-7890, Jl. Kenanga No. 8, Jakarta Selatan).
- **Media sosial:** belum ada tautan sosial; tambahkan di `footerHTML()` pada
  `js/components.js` bila diperlukan.
- **Voucher:** kode `HINA10` (−10%) divalidasi di `js/checkout.js` dan
  `js/cart.js` (`voucherDiscount`).

## Yang masih simulasi (demo)

- Checkout & pembayaran (Transfer Bank / E-Wallet / COD) — tidak ada
  pembayaran nyata; pesanan disimpan di localStorage peramban pengunjung
  dengan nomor `HNA-2026-XXXX`.
- Akun (masuk/daftar) — hanya nama + email yang disimpan
  (`hina_demo_user`); kata sandi **tidak pernah** disimpan.
- Formulir kontak & newsletter — validasi saja, tidak mengirim apa pun.
- Testimoni — contoh, diberi label sebagai contoh.
- Keranjang — tersimpan di localStorage (`hina_cart`) per peramban.

## Catatan adaptasi hero

Hero aslinya dirancang sebagai satu halaman tetap (fixed) tanpa scroll.
Agar bisa dilengkapi menjadi website utuh, stage hero diletakkan
`position:absolute` di dalam section hero setinggi `100svh` di bagian atas
`index.html`, dan body bisa scroll ke section di bawahnya. Seluruh perilaku
internal hero tidak berubah, **kecuali aturan roda mouse**: hero menangkap
wheel (mencegah scroll + melangkah di rel) hanya selama section hero berada
di puncak viewport; bila potong yang tampil adalah yang **terakhir**
(ke-12) dan pengguna scroll ke bawah — atau yang **pertama** (ke-1) dan
scroll ke atas — wheel **tidak** dicegah agar halaman bisa scroll
(pelepasan di ujung rel).

## Integrasi backend / pembayaran (bila nanti dibuat nyata)

- Ganti penyimpanan localStorage (`hina_cart`, `hina_orders`,
  `hina_demo_user`) dengan API: katalog dari `PRODUCTS`, checkout membuat
  order di server, dan status stok divalidasi ulang di server.
- Sambungkan metode pembayaran ke gerbang pembayaran (mis. Midtrans/Xendit):
  kirim total dari server (bukan dari klien), lalu arahkan kembali ke
  `order-success.html` dengan nomor order dari server.
- Formulir kontak & newsletter diarahkan ke endpoint email/CRM.
