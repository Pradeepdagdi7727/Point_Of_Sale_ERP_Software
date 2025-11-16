document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.querySelector(".date-range input");
  const dateBtn = document.querySelector(".date-range button");

  dateBtn?.addEventListener("click", () => dateInput.focus());
});