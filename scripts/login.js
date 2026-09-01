// FUNGSI LOGIN: Autentikasi pengguna & redirect
function login(event) {
  // Mencegah form melakukan submit standar (refresh halaman)
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validasi kredensial (Contoh hardcoded)
  if (email === "rafitama110011@gmail.com" && password === "121212") {
    // Menyimpan data session login di browser
    sessionStorage.setItem("is_logged_in", "true");
    sessionStorage.setItem("email", email);

    // Mengalihkan pengguna ke halaman utama setelah login sukses
    window.location.href = "HomePage.html";
  } else {
    // Memberikan feedback jika kredensial salah
    alert("❌ Maaf, Email atau password yang lu masukkan salah, cok!");
  }
}
