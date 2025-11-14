document.addEventListener("DOMContentLoaded", () => {
  const productSearchInput = document.getElementById("product-search");
  const searchResultsDiv = document.getElementById("search-results");
  const productListBody = document.getElementById("product-list");
  let cart = [];

  // --- Invoice specific elements (moved from global scope to within DOMContentLoaded) ---
  const printBtn = document.getElementById("printBtn");
  const closeBtn = document.getElementById("closeBtn");
  const cashPrintBtn = document.getElementById("cashPrintBtn");
  const cardPrintBtn = document.getElementById("cardPrintBtn");
  const invoicePreview = document.getElementById("invoicePreview");
  const invoiceContent = document.getElementById("invoiceContent");

  // --- Fetch products from backend ---
  async function searchProducts(query) {
    try {
      const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  // --- Utility ---
  function formatCurrency(amount) {
    return parseFloat(amount).toFixed(2);
  }

  // --- Totals Calculation ---
  function calculateTotals() {
    let totalQuantity = 0;
    let totalMRP = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let subtotal = 0;

    cart.forEach((item) => {
      totalQuantity += item.qty;
      totalMRP += item.mrp * item.qty;

      // Discount per item
      let discountAmount = 0;
      if (item.discountType === "percent") {
        discountAmount = (item.mrp * (item.discountValue / 100));
      } else if (item.discountType === "flat") {
        discountAmount = item.discountValue;
      }
      
      const itemDiscountTotal = discountAmount * item.qty;
      totalDiscount += itemDiscountTotal;

      const netBeforeTaxPerItem = item.mrp - discountAmount;
      const netBeforeTaxTotal = netBeforeTaxPerItem * item.qty;
      
      const itemTax = netBeforeTaxTotal * item.taxRate;
      totalTax += itemTax;
      subtotal += netBeforeTaxTotal + itemTax;
    });

    // Flat discount on total bill (optional)
    const flatDiscountInput = document.getElementById("flat-discount-input");
    const flatDiscountValue = flatDiscountInput
      ? parseFloat(flatDiscountInput.value) || 0
      : 0;

    let afterFlatDiscount = subtotal - flatDiscountValue;
    if (afterFlatDiscount < 0) afterFlatDiscount = 0;

    const roundOffValue = Math.round(afterFlatDiscount) - afterFlatDiscount;
    const finalAmount = afterFlatDiscount + roundOffValue;

    // Update totals in UI
    document.getElementById("total-quantity").textContent =
      totalQuantity.toFixed(2); // Quantity can be float
    document.getElementById("total-mrp").textContent = formatCurrency(totalMRP);
    document.getElementById("total-tax").textContent = formatCurrency(totalTax);
    document.getElementById("total-discount").textContent =
      formatCurrency(totalDiscount + flatDiscountValue); // Sum of item discounts and flat bill discount
    document.getElementById("flat-discount").textContent =
      formatCurrency(flatDiscountValue);
    document.getElementById("round-off").textContent =
      formatCurrency(roundOffValue);
    document.getElementById("final-amount").textContent =
      formatCurrency(finalAmount);
  }

  // --- Render Cart ---
  function renderCart() {
    productListBody.innerHTML = "";

    if (cart.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.className = "empty-cart-message";
      emptyRow.innerHTML = `
        <td colspan="10" style="text-align: center; padding: 20px; color: #888;">
          No items in cart. Start by scanning a barcode or searching for a product.
        </td>
      `;
      productListBody.appendChild(emptyRow);
      calculateTotals();
      return;
    }

    cart.forEach((item, index) => {
      let discountAmountPerUnit = 0;
      if (item.discountType === "percent") {
        discountAmountPerUnit = (item.mrp * (item.discountValue / 100));
      } else if (item.discountType === "flat") {
        discountAmountPerUnit = item.discountValue;
      }
      const totalItemDiscount = discountAmountPerUnit * item.qty;

      const netBeforeTaxPerUnit = item.mrp - discountAmountPerUnit;
      const netBeforeTaxTotal = netBeforeTaxPerUnit * item.qty;
      const itemTaxAmount = netBeforeTaxTotal * item.taxRate;
      const itemFinalNetAmount = netBeforeTaxTotal + itemTaxAmount;

      const row = document.createElement("tr");
      row.className = "product-row";
      row.dataset.itemId = item.id;

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.barcode || item.id}</td>
        <td>${item.name}</td>
        <td>
          <div class="qty-controls">
            <button class="qty-btn" data-action="decrease" data-item-id="${item.id}">-</button>
            <input type="number" value="${item.qty.toFixed(2)}" data-item-id="${item.id}" class="item-qty-input">
            <button class="qty-btn" data-action="increase" data-item-id="${item.id}">+</button>
          </div>
        </td>
        <td>${formatCurrency(item.mrp)}</td>
        <td>${formatCurrency(totalItemDiscount)}</td>
        <td>
          <div style="display: flex; gap: 4px; align-items: center;">
            <input type="number" class="discount-input" data-item-id="${item.id}"
              value="${item.discountValue}" min="0" style="width:60px; text-align:center;">
            <select class="discount-type" data-item-id="${item.id}">
              <option value="percent" ${item.discountType === "percent" ? "selected" : ""}>%</option>
              <option value="flat" ${item.discountType === "flat" ? "selected" : ""}>₹</option>
            </select>
          </div>
        </td>
        <td>${formatCurrency(netBeforeTaxPerUnit)}</td>
        <td>${formatCurrency(itemFinalNetAmount)}</td>
        <td><span class="remove-item" data-item-id="${item.id}"><i class="material-icons">close</i></span></td>
      `;
      productListBody.appendChild(row);
    });

    calculateTotals();
  }

  // --- Cart Operations ---
  function addItemToCart(product, quantity = 1) {
    const existingItemIndex = cart.findIndex((item) => item.id == product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].qty += quantity;
    } else {
      cart.push({
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        qty: quantity,
        mrp: product.price,
        taxRate: product.tax || 0.05, // default 5%
        unitCost: product.final_price || product.price, // Assuming final_price is net before tax for display
        discountType: product.discount_type || "percent",
        discountValue: product.discount || 0,
      });
    }
    renderCart();
  }

  function updateItemQuantity(itemId, change) {
    const itemIndex = cart.findIndex((item) => item.id == itemId);
    if (itemIndex > -1) {
      cart[itemIndex].qty = Math.max(0, cart[itemIndex].qty + change); // Ensure quantity doesn't go below 0
      if (cart[itemIndex].qty === 0) {
        cart.splice(itemIndex, 1);
      }
    }
    renderCart();
  }
  
  function updateItemQuantityFromInput(itemId, newQty) {
    const itemIndex = cart.findIndex((item) => item.id == itemId);
    if (itemIndex > -1) {
      const quantity = parseFloat(newQty);
      if (!isNaN(quantity) && quantity >= 0) {
        cart[itemIndex].qty = quantity;
        if (cart[itemIndex].qty === 0) {
          cart.splice(itemIndex, 1);
        }
      }
    }
    renderCart();
  }

  function removeItemFromCart(itemId) {
    cart = cart.filter((item) => item.id != itemId);
    renderCart();
  }

  // --- Search Functionality ---
  let searchTimeout;
  productSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const query = productSearchInput.value.trim();
    searchResultsDiv.innerHTML = "";
    searchResultsDiv.classList.remove("show");

    if (query.length < 2 && !/^\d{8,}$/.test(query)) return;

    searchTimeout = setTimeout(async () => { // Added async here
      // Barcode detected (numbers only)
      if (/^\d{8,}$/.test(query)) {
        const items = await searchProducts(query); // Await here
        if (items.length > 0) {
          addItemToCart(items[0]);
          productSearchInput.value = "";
        }
        return;
      }

      // Regular search
      const filteredProducts = await searchProducts(query); // Await here
      searchResultsDiv.innerHTML = "";
      if (filteredProducts.length > 0) {
        filteredProducts.forEach((product) => {
          const resultItem = document.createElement("div");
          resultItem.className = "search-result-item";
          resultItem.textContent = `${product.name} (Code: ${product.barcode})`;
          resultItem.dataset.productId = product.id;
          searchResultsDiv.appendChild(resultItem);
        });
        searchResultsDiv.classList.add("show");
      } else {
        searchResultsDiv.innerHTML =
          '<div class="search-result-item">No products found.</div>';
        searchResultsDiv.classList.add("show");
      }
    }, 300);
  });

  // Select from search dropdown
  searchResultsDiv.addEventListener("click", async (event) => { // Added async here
    const target = event.target.closest(".search-result-item");
    if (target && target.dataset.productId) {
      const productId = target.dataset.productId;

      // Fetch full product info from backend using ID
      try {
        const response = await fetch(`/items/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product details");
        const product = await response.json();
        addItemToCart(product);
        productSearchInput.value = "";
        searchResultsDiv.classList.remove("show");
      } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Failed to add product. Please try again.");
      }
    }
  });

  // Hide dropdown on outside click
  document.addEventListener("click", (event) => {
    if (
      !productSearchInput.contains(event.target) &&
      !searchResultsDiv.contains(event.target)
    ) {
      searchResultsDiv.classList.remove("show");
    }
  });

  // Handle + / - / remove buttons
  productListBody.addEventListener("click", (event) => {
    const qtyBtn = event.target.closest(".qty-btn");
    const removeItemSpan = event.target.closest(".remove-item");

    if (qtyBtn) {
      const itemId = qtyBtn.dataset.itemId;
      const action = qtyBtn.dataset.action;
      updateItemQuantity(itemId, action === "increase" ? 1 : -1);
    } else if (removeItemSpan) {
      const itemId = removeItemSpan.dataset.itemId;
      removeItemFromCart(itemId);
    }
  });

  // Handle discount input/type changes and quantity input changes
  let inputUpdateTimeout;
  productListBody.addEventListener("input", (event) => {
    const discountInput = event.target.closest(".discount-input");
    const discountTypeSelect = event.target.closest(".discount-type");
    const qtyInput = event.target.closest(".item-qty-input");

    clearTimeout(inputUpdateTimeout);
    inputUpdateTimeout = setTimeout(() => {
      if (discountInput) {
        const itemId = discountInput.dataset.itemId;
        const item = cart.find((i) => i.id == itemId);
        if (item) {
          item.discountValue = parseFloat(discountInput.value) || 0;
          renderCart();
        }
      } else if (discountTypeSelect) {
        const itemId = discountTypeSelect.dataset.itemId;
        const item = cart.find((i) => i.id == itemId);
        if (item) {
          item.discountType = discountTypeSelect.value;
          renderCart();
        }
      } else if (qtyInput) {
        const itemId = qtyInput.dataset.itemId;
        updateItemQuantityFromInput(itemId, qtyInput.value);
      }
    }, 500); // Debounce for 500ms
  });

  // --- Invoice & Print Functions ---
  function generateReceipt(paymentMode = "CASH") {
    if (cart.length === 0) {
      alert("No items to generate receipt for!");
      return;
    }

    const invoiceNo = "ORD" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    let totalQty = 0;
    let grossTotalBeforeDiscount = 0;
    let totalDiscountAmount = 0;
    let finalTotalAmount = 0;
    let taxData = {}; // { '5': { taxable: 100, cgst: 2.5, sgst: 2.5 } }

    let itemsHTML = "";

    cart.forEach((item, index) => {
      const discountPerUnit = 
        item.discountType === "percent"
          ? (item.mrp * (item.discountValue / 100))
          : item.discountValue;

      const itemTotalDiscount = discountPerUnit * item.qty;
      const netAmountBeforeTaxPerUnit = item.mrp - discountPerUnit;
      const netAmountBeforeTaxTotal = netAmountBeforeTaxPerUnit * item.qty;

      const itemTaxAmount = netAmountBeforeTaxTotal * item.taxRate;
      const itemFinalTotal = netAmountBeforeTaxTotal + itemTaxAmount;

      totalQty += item.qty;
      grossTotalBeforeDiscount += item.mrp * item.qty;
      totalDiscountAmount += itemTotalDiscount;
      finalTotalAmount += itemFinalTotal;

      const taxRatePercent = (item.taxRate * 100).toFixed(0);
      if (!taxData[taxRatePercent]) {
        taxData[taxRatePercent] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0 };
      }
      
      const itemTaxableAmount = netAmountBeforeTaxTotal;
      const itemCGST = itemTaxAmount / 2;
      const itemSGST = itemTaxAmount / 2;

      taxData[taxRatePercent].taxable += itemTaxableAmount;
      taxData[taxRatePercent].cgst += itemCGST;
      taxData[taxRatePercent].sgst += itemSGST;

      itemsHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.qty.toFixed(2)}</td>
          <td>${item.mrp.toFixed(2)}</td>
          <td>${discountPerUnit.toFixed(2)}</td>
          <td>${itemFinalTotal.toFixed(2)}</td>
        </tr>
      `;
    });

    // Add flat discount to totalDiscountAmount for display in receipt summary
    const flatDiscountInput = document.getElementById("flat-discount-input");
    const flatDiscountValue = flatDiscountInput
      ? parseFloat(flatDiscountInput.value) || 0
      : 0;
    totalDiscountAmount += flatDiscountValue;
    finalTotalAmount -= flatDiscountValue; // Apply flat discount to final total

    let taxSummaryHTML = "";
    for (const [rate, data] of Object.entries(taxData)) {
      taxSummaryHTML += `
        <tr>
          <td>${rate}%</td>
          <td>${data.taxable.toFixed(2)}</td>
          <td>${data.cgst.toFixed(2)}</td>
          <td>${data.sgst.toFixed(2)}</td>
          <td>${data.igst.toFixed(2)}</td>
          <td>${data.cess.toFixed(2)}</td>
        </tr>
      `;
    }

    const roundOffValue = Math.round(finalTotalAmount) - finalTotalAmount;
    finalTotalAmount = finalTotalAmount + roundOffValue;


    invoiceContent.innerHTML = `
      <div class="receipt-header">
        <h2>LAXMI SUPER MARKET</h2>
        <p>01, NAGAUR ROAD, Pushkar Ajmer-305022</p>
        <p>GSTIN: 08AKPPU0227J1ZR</p>
        <p>Email: yashubana3@gmail.com</p>
      </div>
      <hr/>
      <div class="receipt-info">
        <p><strong>Invoice No:</strong> ${invoiceNo}</p>
        <p><strong>Payment Mode:</strong> ${paymentMode}</p>
        <p><strong>Date:</strong> ${date} ${time}</p>
      </div>
      <hr/>
      <table class="receipt-items">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>MRP</th>
            <th>Disc/Unit</th>
            <th>Net Total</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      <hr/>
      <div class="receipt-summary">
        <p><strong>Total Qty:</strong> ${totalQty.toFixed(2)}</p>
        <p><strong>Gross Total:</strong> ${grossTotalBeforeDiscount.toFixed(2)}</p>
        <p><strong>Total Discount:</strong> Rs. ${totalDiscountAmount.toFixed(2)}</p>
        <p><strong>Round Off:</strong> ${roundOffValue.toFixed(2)}</p>
        <h3><strong>Final Amount:</strong> Rs. ${finalTotalAmount.toFixed(2)}</h3>
      </div>
      
      <div class="tax-breakdown">
        <h4>Tax Summary</h4>
        <table class="tax-table">
          <thead>
            <tr>
              <th>Rate</th>
              <th>Taxable Amt</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>IGST</th>
              <th>CESS</th>
            </tr>
          </thead>
          <tbody>
            ${taxSummaryHTML || '<tr><td colspan="6">No Tax Applicable</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="receipt-footer">
        <p>Thank you for shopping with us!</p>
      </div>
    `;
    invoicePreview.style.display = "flex";
  }

  function printInvoice() {
    const printWindow = window.open("", "PRINT", "height=600,width=400");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 10px; font-size: 10px; }
            .receipt { width: 100%; max-width: 380px; margin: 0 auto; border: 1px solid #eee; padding: 10px; box-sizing: border-box; }
            .receipt-header, .receipt-info, .receipt-summary, .receipt-footer, .tax-breakdown { text-align: center; margin-bottom: 5px; }
            h2 { margin: 5px 0; font-size: 16px; }
            h3 { margin: 5px 0; font-size: 14px; }
            p { margin: 2px 0; font-size: 11px; }
            hr { border: 0; border-top: 1px dashed #ccc; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
            th, td { padding: 3px 5px; border: 0px solid #eee; text-align: left; font-size: 10px; }
            th { background-color: #f8f8f8; }
            .receipt-items th:nth-child(3), .receipt-items td:nth-child(3) { text-align: center; } /* Qty */
            .receipt-items th:nth-child(4), .receipt-items td:nth-child(4) { text-align: right; } /* MRP */
            .receipt-items th:nth-child(5), .receipt-items td:nth-child(5) { text-align: right; } /* Disc */
            .receipt-items th:nth-child(6), .receipt-items td:nth-child(6) { text-align: right; } /* Net Total */
            .tax-table th, .tax-table td { text-align: right; }
            .tax-table th:first-child, .tax-table td:first-child { text-align: left; }
          </style>
        </head>
        <body>
          <div class="receipt">${invoiceContent.innerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      cart = []; // Clear cart after successful print
      renderCart();
    }, 500); // Give browser a moment to render content
  }
  // --- SAVE INVOICE TO DATABASE BEFORE PRINTING ---
async function saveInvoice(cart, finalAmount) {
  try {
    // Convert your cart values into invoice-ready format
    const cleanedCart = cart.map(item => {
      const discountPerUnit =
        item.discountType === "percent"
          ? (item.mrp * (item.discountValue / 100))
          : item.discountValue;

      const netBeforeTaxPerUnit = item.mrp - discountPerUnit;
      const netBeforeTaxTotal = netBeforeTaxPerUnit * item.qty;
      const itemTaxAmount = netBeforeTaxTotal * item.taxRate;
      const itemFinalTotal = netBeforeTaxTotal + itemTaxAmount;

      return {
        barcode: item.barcode,
        name: item.name,
        price: item.mrp,        // price per unit
        qty: item.qty,          // total quantity
        discount: discountPerUnit,
        taxRate: item.taxRate,
        total: itemFinalTotal   // final total per item
      };
    });

    const res = await fetch("/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Walk-In Customer",
        cart: cleanedCart,
        finalAmount: Number(finalAmount)
      })
    });

    return await res.json();
  } catch (err) {
    console.error("Invoice save error:", err);
  }
}



  function closeInvoice() {
    invoicePreview.style.display = "none";
  }

  // --- Event Listeners for Invoice Buttons ---
  if (printBtn)
  printBtn.addEventListener("click", async () => {
    // final amount from UI
    console.log("CART BEFORE SAVE:", cart);
    const amount = parseFloat(document.getElementById("final-amount").textContent) || 0;

    await saveInvoice(cart, amount);  // ⬅ SAVE INVOICE FIRST
    printInvoice();                   // ⬅ THEN PRINT BILL
  });

  if (closeBtn) closeBtn.addEventListener("click", closeInvoice);
  if (cashPrintBtn) cashPrintBtn.addEventListener("click", () => generateReceipt("CASH"));
  if (cardPrintBtn) cardPrintBtn.addEventListener("click", () => generateReceipt("CARD"));

  // Initial empty cart render
  renderCart();
});