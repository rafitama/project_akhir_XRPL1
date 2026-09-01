// INISIALISASI: Listener untuk Logout Modal
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logout-btn");
  const modal = document.getElementById("logout-modal");

  // Buka Modal Konfirmasi
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  }
});

// FUNGSI TUTUP MODAL: Menyembunyikan modal
function closeLogoutModal() {
  const modal = document.getElementById("logout-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// FUNGSI KONFIRMASI LOGOUT: Membersihkan sesi & redirect
function confirmLogout() {
  localStorage.removeItem("is_logged_in");
  window.location.href = "Login.html";
}
