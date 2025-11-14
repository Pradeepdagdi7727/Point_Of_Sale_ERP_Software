document.addEventListener('DOMContentLoaded', () => {
  // ===== 1. Inventory Sub-menu Toggle =====
  const inventoryMenu = document.getElementById("inventoryMenu");

  if (inventoryMenu) {
    inventoryMenu.addEventListener("click", (e) => {
      const parentLink = inventoryMenu.querySelector('a');
      // Only toggle if the click is on the parent link itself, not a sub-menu item
      if (parentLink && parentLink.contains(e.target) && !e.target.closest('.sub-menu li a')) {
        e.preventDefault();
        inventoryMenu.classList.toggle("active");
        // Optional: If you want to force sub-menu open/close immediately
        const subMenu = inventoryMenu.querySelector('.sub-menu');
        if (subMenu) {
            if (inventoryMenu.classList.contains('active')) {
                subMenu.style.maxHeight = subMenu.scrollHeight + 'px'; // Expand
            } else {
                subMenu.style.maxHeight = '0'; // Collapse
            }
        }
      }
    });

    // Ensure sub-menu stays open if an item inside is active on load
    if (inventoryMenu.classList.contains('active')) {
        const subMenu = inventoryMenu.querySelector('.sub-menu');
        if (subMenu) {
            subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
        }
    }
  }

  // ===== 2. Sidebar Collapse Toggle (Modified for hover and localStorage) =====
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

  // ===== 3. Notification Bar Dismiss =====
  const notificationBar = document.querySelector(".notification-bar");
  const closeNotificationBtn = document.querySelector(".close-notification");

  if (notificationBar && closeNotificationBtn) {
    closeNotificationBtn.addEventListener("click", () => {
      notificationBar.style.display = "none";
      // Optional: Store in localStorage that notification was dismissed
      // so it doesn't reappear on refresh unless specifically reset.
      // localStorage.setItem('notificationDismissed', 'true');
    });
    // Optional: Check localStorage on load to hide if already dismissed
    // if (localStorage.getItem('notificationDismissed') === 'true') {
    //   notificationBar.style.display = 'none';
    // }
  }

  // ===== 4. Quick Action Button Alert =====
  const quickActionBtn = document.querySelector(".quick-action-btn");
  if (quickActionBtn) {
    quickActionBtn.addEventListener("click", () => {
      alert("Quick Action triggered! You can implement a modal or dropdown here.");
    });
  }

  // ===== 5. Date Range Picker Placeholder Interactivity =====
  const dateRangeInput = document.querySelector(".date-range input[type='text']");
  const dateRangeButton = document.querySelector(".date-range button");

  if (dateRangeInput && dateRangeButton) {
    dateRangeButton.addEventListener("click", () => {
      dateRangeInput.focus();
      alert("Date range picker would open here!"); // Or trigger a real date picker
    });
    dateRangeInput.addEventListener("focus", () => {
      dateRangeInput.placeholder = "e.g., 01/12/2023 - 31/12/2023";
    });
    dateRangeInput.addEventListener("blur", () => {
      dateRangeInput.placeholder = "Select Date Range";
    });
  }

  // ===== 6. Sidebar Active Item Highlight (Dynamic) =====
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  // Get the current page filename (e.g., "dashboard.html", "addmenual.html")
  const currentPath = window.location.pathname.split('/').pop();

  // First, remove 'active' from all items to ensure a clean state
  navItems.forEach(item => {
    item.classList.remove("active");
  });

  // Then, add 'active' to the matching item
  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (link && link.href) {
      const linkPath = link.href.split('/').pop();
      // Handle cases where the link is '#' for the root or default page
      if (currentPath === linkPath || (currentPath === '' && linkPath === 'dashboard.html')) {
        item.classList.add("active");
        // If a sub-menu item is active, ensure its parent 'Inventory' menu is also active
        if (item.closest('.sub-menu')) {
          item.closest('.nav-item').classList.add('active');
        }
      }
    }
  });

  // Special handling for 'addmenual.html' if it's a sub-menu item
  // This ensures the parent 'Inventory' also gets the 'active' class
  // You might want to remove this if the general loop above handles it sufficiently
  if (currentPath === 'addmenual.html') {
    const addManualLink = document.querySelector('.sub-menu li a[href="addmenual.html"]');
    if (addManualLink) {
      const parentNavItem = addManualLink.closest('.nav-item');
      if (parentNavItem) {
          parentNavItem.classList.add('active'); // Activate 'Add Manual' link itself
          // Activate the 'Inventory' parent if 'Add Manual' is active
          const inventoryParent = parentNavItem.closest('.nav-item'); // This will be the main Inventory link
          if (inventoryParent) {
              inventoryParent.classList.add('active');
          }
      }
    }
  }


  // ===== 7. Chart Placeholder Click for more info =====
  const chartPlaceholders = document.querySelectorAll(".chart-placeholder");
  chartPlaceholders.forEach(placeholder => {
    placeholder.addEventListener("click", () => {
      alert("This is where a dynamic chart (e.g., using Chart.js) would be displayed!");
    });
  });

  // ===== 8. Calculate Final Price (assuming you have these fields) =====
  // This section assumes your addmenual.html has input fields for Price, Discount, and Final Price.
  const priceInput = document.getElementById('price'); // Assuming ID 'price'
  const discountInput = document.getElementById('discount'); // Assuming ID 'discount'
  const finalPriceInput = document.getElementById('finalPrice'); // Assuming ID 'finalPrice'

  function calculateFinalPrice() {
    if (priceInput && discountInput && finalPriceInput) {
      const price = parseFloat(priceInput.value) || 0;
      const discount = parseFloat(discountInput.value) || 0;
      const finalPrice = price - (price * (discount / 100));
      finalPriceInput.value = finalPrice.toFixed(2); // Format to 2 decimal places
    }
  }

  // Add event listeners if these elements exist
  if (priceInput) {
    priceInput.addEventListener('input', calculateFinalPrice);
  }
  if (discountInput) {
    discountInput.addEventListener('input', calculateFinalPrice);
  }
  // Call on load to ensure initial calculation if values are pre-filled
  calculateFinalPrice();

}); // End DOMContentLoaded
// 👤 User menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const userIcon = document.getElementById("userIcon");
  const userDropdown = document.getElementById("userDropdown");

  // Toggle dropdown visibility
  userIcon.addEventListener("click", () => {
    userDropdown.style.display =
      userDropdown.style.display === "block" ? "none" : "block";
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    if (!userIcon.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.style.display = "none";
    }
  });

  // Handle logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    window.location.href = "login.html";
    // Optionally redirect:
    // window.location.href = "login.html";
  });
});
async function loadDashboard() {
  const res = await fetch("/stats");
  const data = await res.json();

  if (data.success) {
    document.getElementById("total-sales").innerText = "₹ " + data.data.todayRevenue;
    document.getElementById("total-invoice").innerText = data.data.totalInvoices;
    document.getElementById("sold-qty").innerText = data.data.totalQuantity;
    document.getElementById("total-customers").innerText = data.data.totalCustomers;
  }
}


loadDashboard();

