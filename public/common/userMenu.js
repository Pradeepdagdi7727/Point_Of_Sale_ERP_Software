document.addEventListener("DOMContentLoaded", () => {
  const userIcon = document.getElementById("userIcon");
  const dropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  userIcon?.addEventListener("click", () => {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!userIcon?.contains(e.target)) dropdown.style.display = "none";
  });

  logoutBtn?.addEventListener("click", () => {
    window.location.href = "login.html";
  });
});