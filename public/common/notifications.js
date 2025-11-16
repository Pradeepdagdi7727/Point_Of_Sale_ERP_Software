document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.querySelector(".close-notification");
  const bar = document.querySelector(".notification-bar");

  closeBtn?.addEventListener("click", () => {
    bar.style.display = "none";
  });
});