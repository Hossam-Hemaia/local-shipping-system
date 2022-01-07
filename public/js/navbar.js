const item = document.getElementById("item1dropdown");
const dropdown = document.querySelector(".nav_dropdown");
const item2 = document.getElementById("dropdownitem2");
const dropdown2 = document.getElementById("dropdown2");
if (item) {
  item.addEventListener("click", (e) => {
    dropdown.classList.toggle("show-dropdown");
  });
}

// event2
if (item2) {
  item2.addEventListener("click", () => {
    dropdown2.classList.toggle("show-dropdown");
  });
}

// toggle part

const toggleIcon = document.getElementById("phoneToggler");
const navbarInPhone = document.getElementById("navbarPhone");
const overlay = document.getElementById("overlay");

toggleIcon.addEventListener("click", () => {
  toggleIcon.classList.toggle("toggle-opend");
  navbarInPhone.classList.toggle("showNav");
  overlay.classList.toggle("showoverlay");
});

overlay.addEventListener("click", () => {
  toggleIcon.classList.toggle("toggle-opend");
  navbarInPhone.classList.toggle("showNav");
  overlay.classList.toggle("showoverlay");
});
