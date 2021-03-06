// create shipment btn
const createShipment = document.getElementById("creatShipment");
// seller name input
const sellerName = document.getElementById("sellerName");
// seller phone input
const sellerPhone = document.getElementById("sellerPhone");
// seller address input
const sellerAddress = document.getElementById("sellerAddress");
// special mark input
const specialMark = document.getElementById("specialMark");
// product name input
const productName = document.getElementById("productName");
// product price name
const productPrice = document.getElementById("productPrice");
// note input
const Note = document.getElementById("note");
// region selectbox
const region = document.getElementById("region");
// time to arrive a shipment select
const timeSelect = document.getElementById("time-select");
// shipments container
const shipmentsContainer = document.getElementById("shipmentsContainer");
// shipments number
const shipmentsNumber = document.querySelector(".shipments_number");
// counter to give every select dirrerent class to select them
let counter = 0;

// create a new shipment
createShipment.addEventListener("click", (e) => {
  // disable sending data
  e.preventDefault();
  // check if the inputs empty to create shipment fn()
  if (
    sellerName.value !== "" &&
    sellerPhone !== "" &&
    sellerAddress !== "" &&
    productName !== "" &&
    productPrice !== ""
  ) {
    // create a new shipment
    createOne();
    // get and set the number of shipments card
    getThenumberOfShipments();
    // reset the value of inputs
    resetInputs();
  }
});

let editBtn, removeBtn;

// make a fn() on bottom part to add classes for all details of card
document
  .querySelector(".bottom-part .result-flex")
  .addEventListener("click", (e) => {
    // check if the target is the card options
    if (e.target.classList.contains("card-options")) {
      // showing card options
      e.target.classList.toggle("show-options");

      editBtn = e.target.querySelector(".option-edite");
      removeBtn = e.target.querySelector(".option-remove");
    }

    // set the fn() to show the inputs to edite
    editBtn.addEventListener("click", () => {
      // set class to show them
      editBtn.parentNode.parentNode.parentNode.classList.toggle("all-details");
    });

    // set a fn() to remove the item "card"
    removeBtn.addEventListener("click", () => {
      // the card element
      removeBtn.parentNode.parentNode.parentNode.remove();

      getThenumberOfShipments();
    });
  });

// get the bottom part to make a fn() on card btn
document
  .querySelector(".bottom-part .result-flex")
  .addEventListener("click", (e) => {
    // disable sending data
    e.preventDefault();
    // check if target is the btn
    if (e.target.classList.contains("edit-done")) {
      // specific the card
      let card = e.target.parentNode.parentNode.parentNode;
      // seller name in minimize
      const sellerN = card.querySelector(".result_seller-name");
      // seller name in edite form
      const NameInForm = card.querySelector(".sellerNameForm");
      // minimize name of product
      const name = card.querySelector(".result_name");
      // minimize price of product
      const price = card.querySelector(".result_price");
      // the input of product namein edite form
      const productName = card.querySelector(".productName");
      // the input of product price in edite form
      const productPrice = card.querySelector(".productPrice");

      // toggle class showing all details
      card.classList.toggle("all-details");
      // remove options when it's mini
      card.querySelector(".card-options").classList.remove("show-options");
      // set the name in minimum card
      name.innerHTML = productName.value;
      // set the price in minimum card
      price.innerHTML = productPrice.value;
      // set the seller name on minimize card
      sellerN.innerHTML = NameInForm.value;
    }
  });

// get and set the number of cards fn()
const getThenumberOfShipments = () => {
  // get the cards number
  const numberOfShipments = shipmentsContainer.querySelectorAll(".card").length;
  // set the cards number
  shipmentsNumber.innerHTML = numberOfShipments;

  const createOrder = document.querySelector(".btn-shipments--submit");

  if (numberOfShipments >= 1) {
    createOrder.style.display = "inline-block";
  } else {
    createOrder.style.display = "none";
  }
};

// reset the inputs value fn()
const resetInputs = () => {
  sellerName.value = "";
  sellerPhone.value = "";
  sellerAddress.value = "";
  specialMark.value = "";
  productName.value = "";
  productPrice.value = "";
  Note.value = "";
  sellerName.focus();
};

// create a shipment fn()
const createOne = () => {
  // template to make a card
  const template = `<div class="card">
        <div class="card-options">
            <span class="dote-1 dote"></span>
            <span class="dote-2 dote"></span>
            <span class="dote-3 dote"></span>
            <ul class="options">
                <li class="option option-edite">??????????</li>
                <li class="option option-remove">??????</li>
            </ul>
        </div>
        <!-- the info in small side -->
        <div class="minimize-result">
            <h2 class="result_seller-name">${sellerName.value}<h2>
            <h3 class="result_name">${productName.value}</h3>
            <p class="result_price">$${productPrice.value}</p>
        </div>
        <!-- all result -->
        <div class="all-result">
            <input type="text" name="clientName" placeholder="?????? ????????????" class="sellerNameForm" value="${sellerName.value}">
            <input type="tel" name="clientNumber" placeholder="?????? ????????????" value="${sellerPhone.value}">
            <input type="text" name="address" placeholder="?????????????? (????????????????)" value="${sellerAddress.value}">
            <input type="text" name="landmark" placeholder="?????????? ?????????? ????????????" value="${specialMark.value}">
            <input type="text" name="productName" placeholder="?????? ????????????" class="productName" value="${productName.value}">
            <input type="number" name="productPrice" placeholder="?????? ????????????" class="productPrice" value="${productPrice.value}">
            <input type="text" name="note" placeholder="???????????? ?????????? ????????????" class="note" value="${Note.value}">
            <div class="select--container">
                <!-- first select for region -->
                <div class="region-select">
                    <label>????????????????</label>
                    <select name="region" class="select${counter}">
                        <option value="Alexandria">????????????????????</option>
                        <!--1-->
                        <option value="Ismailia">??????????????????????</option>
                        <!--2-->
                        <option value="Aswan">??????????</option>
                        <!--3-->
                        <option value="Asyut">??????????</option>
                        <!--4-->
                        <option value="Luxor">????????????</option>
                        <!--5-->
                        <option value="Red Sea">?????????? ????????????</option>
                        <!--6-->
                        <option value="Beheira">??????????????</option>
                        <!--7-->
                        <option value="Beni Suef">?????? ????????</option>
                        <!--8-->
                        <option value="Port Said">??????????????</option>
                        <!--9-->
                        <option value="South Sinai">???????? ??????????</option>
                        <!--10-->
                        <option value="Giza">????????????</option>
                        <!--11-->
                        <option value="Dakahlia">????????????????</option>
                        <!--12-->
                        <option value="Damietta">??????????</option>
                        <!--13-->
                        <option value="Sohag">??????????</option>
                        <!--14-->
                        <option value="Suez">????????????</option>
                        <!--15-->
                        <option value="Sharqia">??????????????</option>
                        <!--16-->
                        <option value="North Sinai">???????? ??????????</option>
                        <!--17-->
                        <option value="Gharbia">??????????????</option>
                        <!--18-->
                        <option value="Faiyum">????????????</option>
                        <!--19-->
                        <option value="Cairo">??????????????</option>
                        <!--20-->
                        <option value="Qalyubia">??????????????????</option>
                        <!--21-->
                        <option value="Qena">??????</option>
                        <!--22-->
                        <option value="Kafr El Sheikh">?????? ??????????</option>
                        <!--23-->
                        <option value="Matruh">??????????</option>
                        <!--24-->
                        <option value="Monufia">????????????????</option>
                        <!--25-->
                        <option value="Minya">????????????</option>
                        <!--26-->
                        <option value="New Valley">???????????? ????????????</option>
                        <!--27-->
                    </select>
                </div>
                <!-- second select for time -->
                <div class="time-select">
                    <label>?????? ??????????????</label>
                    <select name="deliveryType" class="time-container${counter}">
                        <option value="dw">???? 48 ?????? 72 ????????</option>
                        <option value="sd">?????? ??????????</option>
                    </select>
                </div>
            </div>
            <div class="center">
                <button class="edit-done" >??????????</button>
            </div>
        </div>
    </div>`;

  // specifice where to put the card
  shipmentsContainer.insertAdjacentHTML("beforeend", template);
  // specific what region is
  shipmentsContainer.querySelector(`.select${counter}`).value = region.value;
  // specific what time is
  shipmentsContainer.querySelector(`.time-container${counter}`).value =
    timeSelect.value;
  // add 1 to the counter to make a diffrent classes
  counter += 1;
};
