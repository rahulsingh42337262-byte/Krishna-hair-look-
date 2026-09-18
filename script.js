const form = document.getElementById("bookingForm");
const message = document.getElementById("formMessage");
const modal = document.getElementById("slipModal");
const service = document.getElementById("service");
const date = document.getElementById("date");
const time = document.getElementById("time");
const nameInput = document.getElementById("name");
const mobile = document.getElementById("mobile");

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
date.min = `${yyyy}-${mm}-${dd}`;

document.querySelectorAll("[data-service]").forEach(link => {
  link.addEventListener("click", () => {
    service.value = link.dataset.service;
  });
});

function makeBookingId() {
  const now = new Date();
  const stamp = String(now.getTime()).slice(-8);
  const random = Math.floor(100 + Math.random() * 900);
  return `KHL-${stamp}-${random}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function formatTime(value) {
  if (!value) return "";
  return new Date(`2000-01-01T${value}`).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit"
  });
}

function fillSlip() {
  const option = service.options[service.selectedIndex];
  const price = option.dataset.price === "0" ? "Contact Us" : `₹${option.dataset.price}`;

  document.getElementById("slipId").textContent = makeBookingId();
  document.getElementById("slipName").textContent = nameInput.value.trim();
  document.getElementById("slipMobile").textContent = mobile.value.trim();
  document.getElementById("slipService").textContent = service.value;
  document.getElementById("slipDate").textContent = formatDate(date.value);
  document.getElementById("slipTime").textContent = formatTime(time.value);
  document.getElementById("slipAmount").textContent = price;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  fillSlip();
  message.textContent = "✓ Booking submitted. Your appointment slip is ready.";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
});

function closeSlip() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

document.getElementById("closeSlip").addEventListener("click", closeSlip);
document.getElementById("closeSlip2").addEventListener("click", closeSlip);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeSlip();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSlip();
});

document.getElementById("printSlip").addEventListener("click", () => {
  window.print();
});

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.getElementById("navLinks");
menuToggle?.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));
