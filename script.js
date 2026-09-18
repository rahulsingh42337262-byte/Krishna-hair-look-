const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#navLinks");
menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

const form = document.querySelector("#bookingForm");
const message = document.querySelector("#formMessage");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  message.textContent = "Booking details captured. Next step: connect the real database, WhatsApp confirmation and Razorpay.";
});
