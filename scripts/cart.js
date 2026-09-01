// DATA: State keranjang saat ini
let selectedItems = [];

// FUNGSI UTAMA: Memuat data keranjang ke UI
function loadCartPage() {
  const container = document.getElementById("cart-items-container");
  const emptyMsg = document.getElementById("cart-empty-message");
  const selectAllContainer = document.getElementById("global-select-container");
  let cart = JSON.parse(localStorage.getItem("r_sports_cart")) || [];

  // Jika keranjang kosong
  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.classList.remove("hidden");
    if (selectAllContainer) selectAllContainer.classList.add("hidden");
    if (container) container.innerHTML = "";
    calculateSelectedSummary();
    return;
  }

  // Jika ada isi keranjang
  if (emptyMsg) emptyMsg.classList.add("hidden");
  if (selectAllContainer) selectAllContainer.classList.remove("hidden");

  // Auto-select semua item jika baru pertama load
  if (selectedItems.length === 0 && cart.length > 0) {
    selectedItems = cart.map((_, index) => index);
    const selectAllCb = document.getElementById("select-all-checkbox");
    if (selectAllCb) selectAllCb.checked = true;
  }

  // Render daftar item
  if (container) {
    container.innerHTML = cart
      .map((item, index) => {
        const isChecked = selectedItems.includes(index) ? "checked" : "";
        return `
        <div class="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-row items-center justify-between gap-4 shadow-md hover:border-slate-700 transition duration-300">
          <div class="flex items-center gap-4 flex-1">
            <input type="checkbox" ${isChecked} onchange="toggleItemSelect(${index}, this.checked)" class="w-4 h-4 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950 cursor-pointer shrink-0">
            <div class="w-14 h-14 bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center justify-center shrink-0">
              <img src="${item.image}" alt="${item.name}" class="max-w-full max-h-full object-contain">
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-200 uppercase">${item.name}</h4>
              <p class="text-[11px] text-cyan-400 font-black mt-0.5">Rp ${Number(item.price).toLocaleString("id-ID")}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center border border-slate-800 rounded-lg bg-slate-950 p-0.5 h-8">
              <button onclick="updateItemQty(${index}, -1)" class="w-6 h-6 text-xs font-black text-slate-400 hover:text-white">-</button>
              <span class="w-6 text-center font-black text-slate-200 text-xs">${item.qty}</span>
              <button onclick="updateItemQty(${index}, 1)" class="w-6 h-6 text-xs font-black text-slate-400 hover:text-white">+</button>
            </div>
            <button onclick="deleteItemFromCart(${index})" class="text-red-400">🗑️</button>
          </div>
        </div>`;
      })
      .join("");
  }
  calculateSelectedSummary();
}

// FUNGSI KALKULASI: Hitung total harga & item
function calculateSelectedSummary() {
  let cart = JSON.parse(localStorage.getItem("r_sports_cart")) || [];
  let totalItems = 0;
  let totalPrice = 0;

  cart.forEach((item, index) => {
    if (selectedItems.includes(index)) {
      totalItems += Number(item.qty);
      totalPrice += Number(item.price) * Number(item.qty);
    }
  });

  document.getElementById("summary-total-items").innerText =
    `${totalItems} Item`;
  document.getElementById("summary-total-price").innerText =
    `Rp ${totalPrice.toLocaleString("id-ID")}`;
}

// FUNGSI CHECKOUT: Proses pembayaran & modal
window.processCheckout = () => {
  let cart = JSON.parse(localStorage.getItem("r_sports_cart")) || [];

  if (selectedItems.length === 0) {
    showToast("Pilih barang dulu!");
    return;
  }

  let itemsToPay = cart.filter((_, i) => selectedItems.includes(i));
  let itemsToKeep = cart.filter((_, i) => !selectedItems.includes(i));

  const modal = document.getElementById("checkout-modal");
  const modalMsg = document.getElementById("modal-msg");

  modalMsg.innerHTML = `
    <p class="text-slate-400 text-xs mb-4">Barang yang dibayar:</p>
    <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
      ${itemsToPay
        .map(
          (item) => `
        <div class="flex justify-between text-xs">
          <span class="text-white font-bold truncate mr-2">${item.name}</span>
          <span class="text-cyan-400 font-black">x ${item.qty}</span>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
  modal.classList.remove("hidden");

  // Update localStorage (sisakan barang yang belum dibayar)
  localStorage.setItem("r_sports_cart", JSON.stringify(itemsToKeep));
  selectedItems = [];
};

// FUNGSI NAVIGASI: Tutup modal & redirect
window.closeModal = () => {
  window.location.href = "HomePage.html";
};


// FUNGSI MANIPULASI: Toggle, Update, Delete
window.toggleItemSelect = (i, c) => {
  c
    ? selectedItems.push(i)
    : (selectedItems = selectedItems.filter((x) => x !== i));
  calculateSelectedSummary();
};

window.updateItemQty = (i, a) => {
  let c = JSON.parse(localStorage.getItem("r_sports_cart"));
  c[i].qty += a;
  if (c[i].qty < 1) c.splice(i, 1);
  localStorage.setItem("r_sports_cart", JSON.stringify(c));
  loadCartPage();
};

window.deleteItemFromCart = (i) => {
  let c = JSON.parse(localStorage.getItem("r_sports_cart"));
  c.splice(i, 1);
  localStorage.setItem("r_sports_cart", JSON.stringify(c));
  loadCartPage();
};


// INISIALISASI: Listener
document.addEventListener("DOMContentLoaded", loadCartPage);
