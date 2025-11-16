document.addEventListener("DOMContentLoaded", () => {
  const toggleSidebarBtn = document.querySelector(".toggle-sidebar-btn");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  // Retrieve sidebar state from localStorage, default to false (expanded) if not found
  let isPermanentlyCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

  if (sidebar) {
    // Apply the saved state immediately on load
    if (isPermanentlyCollapsed) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
    // No need to adjust mainContent margin here if CSS flex handles it with `flex-grow: 1;`
  }

  if (toggleSidebarBtn && sidebar && mainContent) {
    toggleSidebarBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      isPermanentlyCollapsed = sidebar.classList.contains("collapsed");
      // Save the new state to localStorage
      localStorage.setItem('sidebarCollapsed', isPermanentlyCollapsed);
    });

    // --- Hover functionality for collapsed sidebar ---
    sidebar.addEventListener("mouseenter", () => {
      if (isPermanentlyCollapsed) { // Only expand on hover if permanently collapsed by user
        sidebar.classList.remove("collapsed");
      }
    });

    sidebar.addEventListener("mouseleave", () => {
      if (isPermanentlyCollapsed) { // Collapse back only if permanently collapsed by user
        sidebar.classList.add("collapsed");
      }
    });
  }
  const inventoryMenu = document.getElementById("inventoryMenu");
  if (inventoryMenu) {
    inventoryMenu.addEventListener("click", () => {
      inventoryMenu.classList.toggle("active");
    });
  }
});