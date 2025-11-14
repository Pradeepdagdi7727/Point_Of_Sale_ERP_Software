const form = document.getElementById("addItemForm");
const messageDiv = document.getElementById("message");
const priceInput = document.getElementById("price");
const discountInput = document.getElementById("discount");
const finalPriceInput = document.getElementById("finalPrice");

// ✅ Auto-calculate final price
function calculateFinalPrice() {
  const price = parseFloat(priceInput.value) || 0;
  const discount = parseFloat(discountInput.value) || 0;
  const final = price - (price * discount / 100);
  finalPriceInput.value = isNaN(final) ? "0.00" : final.toFixed(2);
}

document.addEventListener("DOMContentLoaded", calculateFinalPrice);
priceInput.addEventListener("input", calculateFinalPrice);
discountInput.addEventListener("input", calculateFinalPrice);

// ✅ Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  messageDiv.textContent = "";
  messageDiv.className = "form-message";

  // 🧠 Collect form data manually to send JSON (recommended)
  const formData = {
    barcode: document.getElementById("barcode").value.trim(),
    name: document.getElementById("itemName").value.trim(),
    category: document.getElementById("category").value.trim(),
    quantity: document.getElementById("quantity").value,
    price: document.getElementById("price").value,
    discount: document.getElementById("discount").value,
    finalPrice: document.getElementById("finalPrice").value
  };

  try {
    const res = await fetch("/additem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (data.success) {
      messageDiv.textContent = "✅ Item added successfully!";
      messageDiv.classList.add("success");
      form.reset();
      finalPriceInput.value = "0.00";
    } else {
      messageDiv.textContent = `❌ Failed: ${data.message || "Unknown error"}`;
      messageDiv.classList.add("error");
    }
  } catch (error) {
    console.error("Submission error:", error);
    messageDiv.textContent = `⚠️ Error: ${error.message}`;
    messageDiv.classList.add("error");
  }
});
