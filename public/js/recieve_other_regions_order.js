const cardsContainer = document.getElementById("cardsContainer");

// click event listener
cardsContainer.addEventListener("click", (e) => {
  // check if target is options
  if (e.target.classList.contains("options-dots")) {
    const card = e.target.parentNode;

    // show and hide the options menu
    card.classList.toggle("edite");

    // edite btn
    const editeBtn = e.target.nextElementSibling.querySelector(".option-1");

    editeBtn.addEventListener("click", () => {
      // show the full option and hid the mini
      e.target.parentNode.parentNode.classList.add("full-options");
      // hide the option
      editeBtn.parentNode.parentNode.classList.remove("edite");
    });
    // btn card
    const cardSubmit = e.target.parentNode.parentNode.querySelector(
      ".card-submit"
    );
    // input fee
    const barCode = cardSubmit.parentNode.querySelector(".barcode");
    // input client name
    const deliveryClient = cardSubmit.parentNode.querySelector(".clientName");
    // input product name
    const productName = cardSubmit.parentNode.querySelector(".productName");
    // input product price
    const productPrice = cardSubmit.parentNode.querySelector(".productPrice");

    // when we type check if input fee is empty or not to display the btn
    barCode.addEventListener("focus", () => {
      if (deliveryFee.value === "") {
        // hide th card btn
        cardSubmit.style.display = "none";
      } else {
        // display the card btn
        cardSubmit.style.display = "block";
      }
    });

    // card submit click event
    cardSubmit.addEventListener("click", (e3) => {
      // remove full option from card
      e3.target.parentNode.parentNode.parentNode.classList.remove(
        "full-options"
      );

      // mini name
      const miniName = e3.target.parentNode.parentNode.previousElementSibling.querySelector(
        ".card_name"
      );
      // mini product name
      const miniProductName = e3.target.parentNode.parentNode.previousElementSibling.querySelector(
        ".product_name"
      );
      // mini product price
      const miniProductPrice = e3.target.parentNode.parentNode.previousElementSibling.querySelector(
        ".product_price"
      );

      // set values in mini
      miniName.innerHTML = deliveryClient.value;
      miniProductName.innerHTML = productName.value;
      miniProductPrice.innerHTML = productPrice.value;
    });
  }
});
