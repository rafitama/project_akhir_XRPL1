const supabaseUrl = "https://quohuffbaychmgvrlvdd.supabase.co";
const apiKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1b2h1ZmZiYXljaG1ndnJsdmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTkxMTUsImV4cCI6MjA5NjA5NTExNX0.1vUuF4n047ZiuDScgseOEj_sIVge2ANCREd41kXDCms";

// Parsing ID dari URL browser
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id") ? urlParams.get("id").trim() : null;

// State kuantitas barang
let currentQty = 1;
window.currentProduct = null;

// 1. Fungsi penarik data produk detail dari database Supabase
async function fetchProductDetail() {
  const loadingEl = document.getElementById("detail-loading");
  const contentEl = document.getElementById("detail-content");

  if (!productId || productId === "null" || productId === "") {
    console.error("❌ Error: ID Produk kosong!");
    if (loadingEl) {
      loadingEl.innerHTML = `<p class="text-center text-red-500 py-12 font-bold">❌ Gagal memuat: ID Produk tidak ditemukan di URL browser!</p>`;
    }
    return;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/dataproduct?id=eq.${productId}`,
      {
        method: "GET",
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Gagal terhubung ke database Supabase.");
    const data = await response.json();

    if (data && data.length > 0) {
      window.currentProduct = data[0];
      renderDetailHTML(window.currentProduct);

      if (loadingEl) loadingEl.classList.add("hidden");
      if (contentEl) contentEl.classList.remove("hidden");
    } else {
      // Sistem Cadangan (Failsafe) jika koneksi Supabase lambat, baca dari cache homepage
      const localCache = localStorage.getItem("rafi_sports_cache");
      if (localCache) {
        const matchedProduct = JSON.parse(localCache).find(
          (p) => p.id == productId,
        );
        if (matchedProduct) {
          window.currentProduct = matchedProduct;
          renderDetailHTML(window.currentProduct);
          if (loadingEl) loadingEl.classList.add("hidden");
          if (contentEl) contentEl.classList.remove("hidden");
          return;
        }
      }
      throw new Error("Produk tidak terdaftar di database.");
    }
  } catch (err) {
    console.error("Detail Engine Crash:", err);
    if (loadingEl) {
      loadingEl.innerHTML = `<p class="text-center text-red-400 py-12 font-medium">❌ Gagal memuat data produk: ${err.message}</p>`;
    }
  }
}

// 2. Fungsi penanam data ke elemen HTML detail
function renderDetailHTML(product) {
  const name = product.name || product.nama || "Produk Premium";
  const image = product.image || product.gambar || "";
  const price = product.price || product.harga || 0;
  const description =
    product.description ||
    product.deskripsi ||
    "Tidak ada deskripsi resmi untuk produk premium ini.";
  const gender = product.gender || "UNISEX";
  const category = product.category || product.kategori || "SPORTS GEAR";
  const rating = product.rating || 5.0;

  if (document.getElementById("product-image"))
    document.getElementById("product-image").src = image;
  if (document.getElementById("product-category"))
    document.getElementById("product-category").innerText =
      `${category} • ${gender}`;
  if (document.getElementById("product-title"))
    document.getElementById("product-title").innerText = name;
  if (document.getElementById("product-price"))
    document.getElementById("product-price").innerText =
      `Rp ${Number(price).toLocaleString("id-ID")}`;
  if (document.getElementById("product-description"))
    document.getElementById("product-description").innerText = description;
  if (document.getElementById("rating-value"))
    document.getElementById("rating-value").innerText =
      Number(rating).toFixed(1);

  if (document.getElementById("rating-stars")) {
    let starHtml = "";
    const roundStars = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      starHtml += i <= roundStars ? "★" : "☆";
    }
    document.getElementById("rating-stars").innerHTML = starHtml;
  }

  document.title = `${name} | R SPORTS`;
}

// 3. FUNGSI PLUS MINUS KUANTITAS BERFUNGSI
function changeQty(amount) {
  currentQty += amount;
  if (currentQty < 1) currentQty = 1;
  document.getElementById("qty-display").innerText = currentQty;
}


// 4. BUAT NAMBAH KE KERANJANG
function addToCart() {
  if (!window.currentProduct) return;

  let cart = JSON.parse(localStorage.getItem("r_sports_cart")) || [];
  const index = cart.findIndex((item) => item.id == window.currentProduct.id);

  if (index > -1) {
    cart[index].qty += currentQty; // Pakai currentQty dari state
  } else {
    cart.push({
      id: window.currentProduct.id,
      name: window.currentProduct.name || window.currentProduct.nama,
      price: window.currentProduct.price || window.currentProduct.harga,
      image: window.currentProduct.image || window.currentProduct.gambar,
      qty: currentQty,
    });
  }

  localStorage.setItem("r_sports_cart", JSON.stringify(cart));
  showToast(`🛒 Berhasil masuk keranjang!`);
}

// 5. FUNGSI INSTANT CHECKOUT BERFUNGSI
function checkoutNow() {
  if (!window.currentProduct) {
    showToast("❌ Data produk belum siap!");
    return;
  }

  // Masukkan keranjang dulu biar otomatis terdata sebelum pindah halaman
  addToCart();

  showToast(" Memproses checkout instan...");
  setTimeout(() => {
    window.location.href = "cart.html";
  }, 800);
}

// Fungsi Alert Toast Android-Style
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("opacity-0", "translate-y-4");
  toast.classList.add("opacity-100", "translate-y-0");
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-4");
    toast.classList.remove("opacity-100", "translate-y-0");
  }, 2500);
}

// Trigger inisialisasi awal saat dokumen web siap dibuka
document.addEventListener("DOMContentLoaded", fetchProductDetail);
