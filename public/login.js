const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('error');
const pass = document.getElementById('password');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value.trim();

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // ✅ Redirect immediately if login success
      window.location.href = '/dashboard';
    } else {
      // ❌ Show error and reload instantly
      errorMsg.textContent = data.message || "Invalid email or password";
      errorMsg.style.color = "red";
       pass.value = "";
// instantly reloads the page
    }
  } catch (err) {
    console.error("Login error:", err);
    errorMsg.textContent = "Something went wrong!";
    errorMsg.style.color = "red";
    window.location.reload(); // instantly reloads the page on error
  }
});
