document.addEventListener("DOMContentLoaded", () => {
  const productSearchInput = document.getElementById("product-search");
  const searchResultsDiv = document.getElementById("search-results");
  const productListBody = document.getElementById("product-list");
  let cart = [];

  // Invoice elements
  const printBtn = document.getElementById("printBtn");
  const closeBtn = document.getElementById("closeBtn");
  const cashPrintBtn = document.getElementById("cashPrintBtn");
  const cardPrintBtn = document.getElementById("cardPrintBtn");
  const invoicePreview = document.getElementById("invoicePreview");
  const invoiceContent = document.getElementById("invoiceContent");

  // --- Helper utilities ---
  function toNumber(v, fallback = 0) {
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }
  function formatCurrency(amount) {
    // Ensure we work with numbers and show exactly 2 decimals
    return toNumber(amount).toFixed(2);
  }
  function safeFixed(value, decimals = 2) {
    return toNumber(value).toFixed(decimals);
  }

  // --- Backend search ---
  async function searchProducts(query) {
    try {
      const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      console.error("Error fetching products:", err);
      return [];
    }
  }

  // --- Totals calculation ---
  function calculateTotals() {
    let totalQuantity = 0;
    let totalMRP = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let subtotal = 0;

    cart.forEach((item) => {
      // Ensure numeric safety
      const qty = toNumber(item.qty, 0);
      const mrp = toNumber(item.mrp, 0);
      const taxRate = toNumber(item.taxRate, 0);
      const discountType = item.discountType || "percent";
      const discountValue = toNumber(item.discountValue, 0);

      totalQuantity += qty;
      totalMRP += mrp * qty;

      // per unit discount
      const discountPerUnit =
        discountType === "percent" ? (mrp * (discountValue / 100)) : discountValue;
      const itemDiscountTotal = discountPerUnit * qty;
      totalDiscount += itemDiscountTotal;

      const netBeforeTaxPerUnit = mrp - discountPerUnit;
      const netBeforeTaxTotal = netBeforeTaxPerUnit * qty;

      const itemTax = netBeforeTaxTotal * taxRate;
      totalTax += itemTax;
      subtotal += netBeforeTaxTotal + itemTax;
    });

    // flat bill discount (if present)
    const flatDiscountInput = document.getElementById("flat-discount-input");
    const flatDiscountValue = flatDiscountInput ? toNumber(flatDiscountInput.value, 0) : 0;
    let afterFlatDiscount = subtotal - flatDiscountValue;
    if (afterFlatDiscount < 0) afterFlatDiscount = 0;

    const roundOffValue = Math.round(afterFlatDiscount) - afterFlatDiscount;
    const finalAmount = afterFlatDiscount + roundOffValue;

    // Update UI (guard with existence checks)
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText("total-quantity", safeFixed(totalQuantity, 2)); // quantities as floats
    setText("total-mrp", formatCurrency(totalMRP));
    setText("total-tax", formatCurrency(totalTax));
    setText("total-discount", formatCurrency(totalDiscount + flatDiscountValue));
    setText("flat-discount", formatCurrency(flatDiscountValue));
    setText("round-off", formatCurrency(roundOffValue));
    setText("final-amount", formatCurrency(finalAmount));
  }

  // --- Render cart table ---
  function renderCart() {
    productListBody.innerHTML = "";

    if (cart.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.className = "empty-cart-message";
      emptyRow.innerHTML = `
        <td colspan="10" style="text-align:center;padding:20px;color:#888;">
          No items in cart. Start by scanning a barcode or searching for a product.
        </td>`;
      productListBody.appendChild(emptyRow);
      calculateTotals();
      return;
    }

    cart.forEach((item, index) => {
      const qty = toNumber(item.qty, 0);
      const mrp = toNumber(item.mrp, 0);
      const discountType = item.discountType || "percent";
      const discountValue = toNumber(item.discountValue, 0);
      const taxRate = toNumber(item.taxRate, 0);

      const discountPerUnit = discountType === "percent" ? (mrp * (discountValue / 100)) : discountValue;
      const totalItemDiscount = discountPerUnit * qty;
      const netBeforeTaxPerUnit = mrp - discountPerUnit;
      const netBeforeTaxTotal = netBeforeTaxPerUnit * qty;
      const itemTaxAmount = netBeforeTaxTotal * taxRate;
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
            <input type="number" value="${safeFixed(qty, 2)}" data-item-id="${item.id}" class="item-qty-input" step="0.01" min="0">
            <button class="qty-btn" data-action="increase" data-item-id="${item.id}">+</button>
          </div>
        </td>
        <td>${formatCurrency(mrp)}</td>
        <td>${formatCurrency(totalItemDiscount)}</td>
        <td>
          <div style="display:flex;gap:4px;align-items:center;">
            <input type="number" class="discount-input" data-item-id="${item.id}"
              value="${discountValue}" min="0" style="width:60px;text-align:center;">
            <select class="discount-type" data-item-id="${item.id}">
              <option value="percent" ${discountType === "percent" ? "selected" : ""}>%</option>
              <option value="flat" ${discountType === "flat" ? "selected" : ""}>₹</option>
            </select>
          </div>
        </td>
        <td>${formatCurrency(netBeforeTaxPerUnit)}</td>
        <td>${formatCurrency(itemFinalNetAmount)}</td>
        <td><span class="remove-item" data-item-id="${item.id}" style="cursor:pointer;"><i class="material-icons">close</i></span></td>
      `;

      productListBody.appendChild(row);
    });

    calculateTotals();
  }

  // --- Cart operations ---
  function addItemToCart(product, quantity = 1) {
    // Normalize product fields to numbers immediately
    const normalized = {
      id: product.id,
      barcode: product.barcode,
      name: product.name,
      qty: toNumber(quantity, 1),
      mrp: toNumber(product.price, 0),
      taxRate: toNumber(product.tax, 0.05),
      unitCost: toNumber(product.final_price ?? product.price, product.price ?? 0),
      discountType: product.discount_type || "percent",
      discountValue: toNumber(product.discount ?? product.discountValue ?? 0, 0),
    };

    const existingIndex = cart.findIndex((i) => i.id == normalized.id);

    if (existingIndex > -1) {
      cart[existingIndex].qty = toNumber(cart[existingIndex].qty, 0) + normalized.qty;
    } else {
      cart.push(normalized);
    }

    renderCart();
  }

  function updateItemQuantity(itemId, change) {
    const idx = cart.findIndex((i) => i.id == itemId);
    if (idx > -1) {
      let newQty = toNumber(cart[idx].qty, 0) + change;
      newQty = Math.max(0, newQty);
      if (newQty === 0) cart.splice(idx, 1);
      else cart[idx].qty = newQty;
    }
    renderCart();
  }

  function updateItemQuantityFromInput(itemId, newQtyValue) {
    const idx = cart.findIndex((i) => i.id == itemId);
    if (idx > -1) {
      const q = toNumber(newQtyValue, 0);
      if (q <= 0) cart.splice(idx, 1);
      else cart[idx].qty = q;
    }
    renderCart();
  }

  function removeItemFromCart(itemId) {
    cart = cart.filter((i) => i.id != itemId);
    renderCart();
  }

  // --- Search UI with debounce ---
  let searchTimeout;
  productSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const query = productSearchInput.value.trim();
    searchResultsDiv.innerHTML = "";
    searchResultsDiv.classList.remove("show");

    if (query.length < 2 && !/^\d{8,}$/.test(query)) return;

    searchTimeout = setTimeout(async () => {
      // If barcode-like string (8+ digits), try direct add
      if (/^\d{8,}$/.test(query)) {
        const items = await searchProducts(query);
        if (items.length > 0) {
          addItemToCart(items[0], 1);
          productSearchInput.value = "";
        } else {
          searchResultsDiv.innerHTML = '<div class="search-result-item">No product found for barcode.</div>';
          searchResultsDiv.classList.add("show");
        }
        return;
      }

      // Regular search
      const results = await searchProducts(query);
      searchResultsDiv.innerHTML = "";
      if (results && results.length > 0) {
        results.forEach((p) => {
          const el = document.createElement("div");
          el.className = "search-result-item";
          el.textContent = `${p.name} (Code: ${p.barcode ?? p.id})`;
          el.dataset.productId = p.id;
          searchResultsDiv.appendChild(el);
        });
        searchResultsDiv.classList.add("show");
      } else {
        searchResultsDiv.innerHTML = '<div class="search-result-item">No products found.</div>';
        searchResultsDiv.classList.add("show");
      }
    }, 300);
  });

  // select product from dropdown
  searchResultsDiv.addEventListener("click", async (event) => {
    const target = event.target.closest(".search-result-item");
    if (!target || !target.dataset.productId) return;
    const productId = target.dataset.productId;

    try {
      const resp = await fetch(`/items/${productId}`);
      if (!resp.ok) throw new Error("Failed to fetch product");
      const product = await resp.json();
      addItemToCart(product, 1);
      productSearchInput.value = "";
      searchResultsDiv.classList.remove("show");
    } catch (err) {
      console.error("Error fetching product details:", err);
      alert("Failed to add product. Try again.");
    }
  });

  // hide dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!productSearchInput.contains(e.target) && !searchResultsDiv.contains(e.target)) {
      searchResultsDiv.classList.remove("show");
    }
  });

  // qty + remove buttons handler (event delegation)
  productListBody.addEventListener("click", (event) => {
    const qtyBtn = event.target.closest(".qty-btn");
    const removeSpan = event.target.closest(".remove-item");

    if (qtyBtn) {
      const itemId = qtyBtn.dataset.itemId;
      const action = qtyBtn.dataset.action;
      updateItemQuantity(itemId, action === "increase" ? 1 : -1);
    } else if (removeSpan) {
      removeItemFromCart(removeSpan.dataset.itemId);
    }
  });

  // handle inline input changes (discount, type, qty)
  let inputTimeout;
  productListBody.addEventListener("input", (event) => {
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
      const discountInput = event.target.closest(".discount-input");
      const discountType = event.target.closest(".discount-type");
      const qtyInput = event.target.closest(".item-qty-input");

      if (discountInput) {
        const id = discountInput.dataset.itemId;
        const it = cart.find((i) => i.id == id);
        if (it) {
          it.discountValue = toNumber(discountInput.value, 0);
          renderCart();
        }
      } else if (discountType) {
        const id = discountType.dataset.itemId;
        const it = cart.find((i) => i.id == id);
        if (it) {
          it.discountType = discountType.value;
          renderCart();
        }
      } else if (qtyInput) {
        const id = qtyInput.dataset.itemId;
        updateItemQuantityFromInput(id, qtyInput.value);
      }
    }, 400);
  });

  // --- Invoice generation ---
  function generateReceipt(paymentMode = "CASH") {
    if (cart.length === 0) {
      alert("No items to generate receipt for!");
      return;
    }

    const invoiceNo = "ORD" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    let totalQty = 0;
    let grossTotalBeforeDiscount = 0;
    let totalDiscountAmount = 0;
    let finalTotalAmount = 0;
    const taxData = {}; // grouped by percent

    let itemsHTML = "";

    cart.forEach((item, index) => {
      const qty = toNumber(item.qty, 0);
      const mrp = toNumber(item.mrp, 0);
      const taxRate = toNumber(item.taxRate, 0);
      const discountType = item.discountType || "percent";
      const discountValue = toNumber(item.discountValue, 0);

      const discountPerUnit = discountType === "percent" ? (mrp * (discountValue / 100)) : discountValue;
      const itemTotalDiscount = discountPerUnit * qty;
      const netBeforeTaxPerUnit = mrp - discountPerUnit;
      const netBeforeTaxTotal = netBeforeTaxPerUnit * qty;
      const itemTaxAmount = netBeforeTaxTotal * taxRate;
      const itemFinalTotal = netBeforeTaxTotal + itemTaxAmount;

      totalQty += qty;
      grossTotalBeforeDiscount += mrp * qty;
      totalDiscountAmount += itemTotalDiscount;
      finalTotalAmount += itemFinalTotal;

      const rateKey = Math.round(taxRate * 100).toString(); // e.g., "5" for 0.05
      if (!taxData[rateKey]) {
        taxData[rateKey] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0 };
      }
      taxData[rateKey].taxable += netBeforeTaxTotal;
      taxData[rateKey].cgst += itemTaxAmount / 2;
      taxData[rateKey].sgst += itemTaxAmount / 2;

      itemsHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td style="text-align:center">${safeFixed(qty, 2)}</td>
          <td style="text-align:right">${safeFixed(mrp, 2)}</td>
          <td style="text-align:right">${safeFixed(discountPerUnit, 2)}</td>
          <td style="text-align:right">${safeFixed(itemFinalTotal, 2)}</td>
        </tr>
      `;
    });

    // apply flat discount
    const flatDiscountInput = document.getElementById("flat-discount-input");
    const flatDiscountValue = flatDiscountInput ? toNumber(flatDiscountInput.value, 0) : 0;
    totalDiscountAmount += flatDiscountValue;
    finalTotalAmount -= flatDiscountValue;
    if (finalTotalAmount < 0) finalTotalAmount = 0;

    // prepare tax summary HTML
    let taxSummaryHTML = "";
    for (const [rate, data] of Object.entries(taxData)) {
      taxSummaryHTML += `
        <tr>
          <td>${rate}%</td>
          <td style="text-align:right">${safeFixed(data.taxable, 2)}</td>
          <td style="text-align:right">${safeFixed(data.cgst, 2)}</td>
          <td style="text-align:right">${safeFixed(data.sgst, 2)}</td>
          <td style="text-align:right">${safeFixed(data.igst, 2)}</td>
          <td style="text-align:right">${safeFixed(data.cess, 2)}</td>
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
      <table class="receipt-items" style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th>#</th><th>Item</th><th>Qty</th><th>MRP</th><th>Disc/Unit</th><th>Net Total</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      <hr/>
      <div class="receipt-summary">
        <p><strong>Total Qty:</strong> ${safeFixed(totalQty, 2)}</p>
        <p><strong>Gross Total:</strong> ${safeFixed(grossTotalBeforeDiscount, 2)}</p>
        <p><strong>Total Discount:</strong> Rs. ${safeFixed(totalDiscountAmount, 2)}</p>
        <p><strong>Round Off:</strong> ${safeFixed(roundOffValue, 2)}</p>
        <h3><strong>Final Amount:</strong> Rs. ${safeFixed(finalTotalAmount, 2)}</h3>
      </div>
      <div class="tax-breakdown">
        <h4>Tax Summary</h4>
        <table class="tax-table" style="width:100%;border-collapse:collapse">
          <thead>
            <tr><th>Rate</th><th>Taxable Amt</th><th>CGST</th><th>SGST</th><th>IGST</th><th>CESS</th></tr>
          </thead>
          <tbody>
            ${taxSummaryHTML || '<tr><td colspan="6" style="text-align:center">No Tax Applicable</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="receipt-footer">
        <p>Thank you for shopping with us!</p>
      </div>
    `;
    invoicePreview.style.display = "flex";
  }

  // --- Print flow (save then print) ---
  async function saveInvoice(cartData, finalAmount) {
    try {
      const cleanedCart = cartData.map((item) => {
        const discountPerUnit = item.discountType === "percent"
          ? toNumber(item.mrp) * (toNumber(item.discountValue) / 100)
          : toNumber(item.discountValue);

        const netBeforeTaxPerUnit = toNumber(item.mrp) - discountPerUnit;
        const netBeforeTaxTotal = netBeforeTaxPerUnit * toNumber(item.qty);
        const itemTaxAmount = netBeforeTaxTotal * toNumber(item.taxRate);
        const itemFinalTotal = netBeforeTaxTotal + itemTaxAmount;

        return {
          barcode: item.barcode,
          name: item.name,
          price: toNumber(item.mrp),
          qty: toNumber(item.qty),
          discount: discountPerUnit,
          taxRate: toNumber(item.taxRate),
          total: itemFinalTotal,
        };
      });

      const res = await fetch("/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Walk-In Customer",
          cart: cleanedCart,
          finalAmount: toNumber(finalAmount),
        }),
      });

      if (!res.ok) throw new Error("Failed to save invoice");
      return await res.json();
    } catch (err) {
      console.error("Invoice save error:", err);
      return null;
    }
  }

  function printInvoiceWindow() {
    const printWindow = window.open("", "PRINT", "height=600,width=400");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin:0; padding:10px; font-size:10px; }
            .receipt { width:100%; max-width:380px; margin:0 auto; }
            h2 { margin:4px 0; font-size:16px; text-align:center; }
            p, td { margin:2px 0; font-size:11px; }
            hr { border:0; border-top:1px dashed #ccc; margin:8px 0; }
            table{width:100%;border-collapse:collapse}
            th, td{padding:3px 5px;text-align:left;font-size:10px}
          </style>
        </head>
        <body>
          <div class="receipt">${invoiceContent.innerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // print with a short delay to allow render
    setTimeout(() => {
      printWindow.print();
      printWindow.close();

      // clear cart after printing
      cart = [];
      renderCart();
    }, 500);
  }

  function closeInvoice() {
    invoicePreview.style.display = "none";
  }

  // --- Buttons ---
  if (printBtn) {
    printBtn.addEventListener("click", async () => {
      console.log("CART BEFORE SAVE:", JSON.parse(JSON.stringify(cart)));
      const amount = toNumber(document.getElementById("final-amount")?.textContent, 0);
      const saved = await saveInvoice(cart, amount);
      if (saved) {
        printInvoiceWindow();
      } else {
        // if save failed — still allow printing but warn user
        if (confirm("Failed to save invoice to server. Print anyway?")) {
          printInvoiceWindow();
        }
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeInvoice);
  if (cashPrintBtn) cashPrintBtn.addEventListener("click", () => generateReceipt("CASH"));
  if (cardPrintBtn) cardPrintBtn.addEventListener("click", () => generateReceipt("CARD"));

  // initial render
  renderCart();
});