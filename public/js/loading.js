const body = document.querySelector("BODY");
const spinner = document.getElementById("spinner");

window.addEventListener("load", (e) => {
  if (body) {
    body.style.overflow = "auto";
    if (spinner) {
      spinner.style.visibility = "hidden";
    }
  }
});
