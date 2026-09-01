const supabaseUrl = "https://quohuffbaychmgvrlvdd.supabase.co";
const apiKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1b2h1ZmZiYXljaG1ndnJsdmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTkxMTUsImV4cCI6MjA5NjA5NTExNX0.1vUuF4n047ZiuDScgseOEj_sIVge2ANCREd41kXDCms";

let localProductData = [];

// FUNGSI UTAMA: Mengambil Data dari Supabase
async function loadAllProducts() {
  const loadingEl = document.getElementById("loading");
  const productListEl = document.getElementById("product-list");

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/dataproduct?select=*`,
      {
        method: "GET",
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Gagal mengambil data database.");

    localProductData = await response.json();

    // Set cache agar data tersedia secara offline/saat refresh
    localStorage.setItem("rafi_sports_cache", JSON.stringify(localProductData));

    renderProducts(localProductData);
  } catch (error) {
    console.error("Error Homepage Engine:", error);
    if (productListEl) {
      productListEl.innerHTML = `<p class="text-center text-red-500 col-span-4 py-8">Gagal memuat produk. Silakan refresh halaman.</p>`;
    }
  } finally {
    if (loadingEl) loadingEl.classList.add("hidden");
  }
}

// FUNGSI TAMPILAN: Merender List Produk ke UI
function renderProducts(products) {
  const productListEl = document.getElementById("product-list");
  if (!productListEl) return;

  if (products.length === 0) {
    productListEl.innerHTML = `<p class="text-center text-slate-500 col-span-4 py-8">Produk tidak ditemukan.</p>`;
    return;
  }

  productListEl.innerHTML = products
    .map((product) => {
      const id = product.id;
      const name = product.name || product.nama || "Produk Premium";
      const image = product.image || product.gambar || "";
      const price = product.price || product.harga || 0;
      const category = product.category || product.kategori || "GEAR";
      const rating = product.rating || 5;

      return `
      <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 group shadow-md">
        <div class="relative aspect-square w-full rounded-xl bg-slate-950 p-2 flex items-center justify-center overflow-hidden border border-slate-900">
          <img src="${image}" alt="${name}" class="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110">
        </div>
        
        <div class="mt-4 space-y-1 flex-grow flex flex-col justify-end">
          <p class="text-[9px] font-bold text-slate-500 tracking-wider uppercase">${category}</p>
          <h3 class="text-xs font-bold text-slate-200 line-clamp-2 min-h-[32px]">${name}</h3>
          
          <div class="flex items-center gap-1 text-amber-400 text-xs py-0.5">
            <span>★</span> <span class="text-slate-400 text-[10px] font-bold">${rating}</span>
          </div>

          <p class="text-xs font-black text-cyan-400">Rp ${Number(price).toLocaleString("id-ID")}</p>
          
          <div class="grid grid-cols-2 gap-2 mt-3">
            <a href="detail.html?id=${String(id).trim()}" class="text-center bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 text-[10px] font-bold uppercase py-2 rounded-xl transition-all duration-300 flex items-center justify-center">
              Detail
            </a>
            <button onclick="addToCart('${String(id).trim()}')" class="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase py-2 rounded-xl transition-all duration-300">
               Cart
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// FUNGSI KERANJANG: Menambah item ke LocalStorage

function addToCart(productId) {
  const targetProduct = localProductData.find(
    (p) => String(p.id).trim() === String(productId).trim(),
  );

  if (!targetProduct) {
    showToast("⚠️ Produk tidak ditemukan!");
    return;
  }

  let currentCart = JSON.parse(localStorage.getItem("r_sports_cart")) || [];

  const existingItem = currentCart.find(
    (item) => String(item.id).trim() === String(productId).trim(),
  );

  if (existingItem) {
    existingItem.qty = (existingItem.qty || 0) + 1;
  } else {
    currentCart.push({
      id: targetProduct.id,
      name: targetProduct.name || targetProduct.nama,
      price: targetProduct.price || targetProduct.harga,
      image: targetProduct.image || targetProduct.gambar,
      qty: 1,
    });
  }

  localStorage.setItem("r_sports_cart", JSON.stringify(currentCart));
  showToast(`🛒 ${targetProduct.name || "Produk"} masuk keranjang!`);
}

// FUNGSI PENCARIAN: Filter produk via Keyword
function searchProduct(keyword) {
  const filtered = localProductData.filter((p) => {
    const nama = (p.name || p.nama || "").toLowerCase();
    const kat = (p.category || p.kategori || "").toLowerCase();
    return (
      nama.includes(keyword.toLowerCase()) ||
      kat.includes(keyword.toLowerCase())
    );
  });
  renderProducts(filtered);
}

// FUNGSI FILTER: Mengelompokkan berdasarkan kategori
function filterCategory(category) {
  const buttons = ["all", "Men", "Women", "Unisex"];
  buttons.forEach((btn) => {
    const el = document.getElementById(`btn-${btn}`);
    if (!el) return;
    if (btn === category) {
      el.className =
        "text-xs font-bold tracking-wider uppercase px-6 py-2.5 rounded-full border border-cyan-500 bg-cyan-950/40 text-cyan-400 transition-all duration-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]";
    } else {
      el.className =
        "text-xs font-bold tracking-wider uppercase px-6 py-2.5 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-200";
    }
  });

  if (category === "all") {
    renderProducts(localProductData);
  } else {
    const filtered = localProductData.filter(
      (p) => (p.gender || "").toLowerCase() === category.toLowerCase(),
    );
    renderProducts(filtered);
  }
}

// FUNGSI TOAST: Notifikasi popup sederhana
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

// INISIALISASI: Menjalankan fungsi saat load
document.addEventListener("DOMContentLoaded", loadAllProducts);
