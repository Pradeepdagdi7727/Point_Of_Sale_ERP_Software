document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.querySelector(".toggle-sidebar-btn");

  let collapsed = localStorage.getItem("sidebarCollapsed") === "true";

  if (collapsed) sidebar.classList.add("collapsed");

  toggleBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
  });

  const inventoryMenu = document.getElementById("inventoryMenu");
  if (inventoryMenu) {
    inventoryMenu.addEventListener("click", () => {
      inventoryMenu.classList.toggle("active");
    });
  }
});