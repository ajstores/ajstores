const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZV3hrM0m0BhQR8c3Vdmk72ZEstvF-ASKdvV1fPgQ_gMRPOgX6NXmKAN_Hifnh78gK0A/exec";

const path = location.pathname.toLowerCase();

let store = "AJ Trendy Hub";
let productFile = "products.json";

if (path.includes("/trendy/")) {
  store = "AJ Trendy Hub";
  productFile = "../products.json";
}

if (path.includes("/kidz/")) {
  store = "AJ Kidz Zone";
  productFile = "../products.json";
}

const modal = document.getElementById("modal");

let currentProduct = null;
let selectedColor = "";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function(c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c];
  });
}


// =============================
// LOAD PRODUCTS
// =============================

async function loadProducts() {

  const grid = document.getElementById("products");

  if (!grid) return;

  grid.innerHTML =
    '<p class="loading">Product load হচ্ছে...</p>';

  try {

    const response = await fetch(
      productFile + "?v=" + Date.now(),
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error("products.json পাওয়া যায়নি");
    }

    const allProducts = await response.json();

    const products = allProducts.filter(function(p) {

      return String(p.store || "")
        .trim()
        .toLowerCase() === store.trim().toLowerCase()
        &&
        String(p.status || "")
        .trim()
        .toUpperCase() === "ON";

    });


    if (!products.length) {

      grid.innerHTML =
        '<p class="loading">এখনো কোনো product যোগ করা হয়নি।';

      return;
    }


    window.loadedProducts = products;


    grid.innerHTML = products.map(function(p, index) {

      const price = Number(p.price) || 0;

      const colors =
        Array.isArray(p.colors) ? p.colors : [];

      const firstColor =
        colors.length ? colors[0] : null;

      const firstImage =
        firstColor && firstColor.image
          ? firstColor.image
          : "";


      let imageHTML = "";

      if (firstImage) {

        imageHTML =
          `<img
            src="${escapeHtml(firstImage)}"
            alt="${escapeHtml(p.name)}"
            class="card-main-image"
          >`;

      } else {

        imageHTML =
          `<div class="placeholder">🛍️</div>`;

      }


      return `

        <article
          class="product"
          onclick="openProduct(${index})"
        >

          <div class="product-img">
            ${imageHTML}
          </div>

          <h3>
            ${escapeHtml(p.name)}
          </h3>

          <strong>
            ৳${price.toLocaleString("en-BD")}
          </strong>

          ${
            colors.length > 1
              ? `<small>${colors.length} colors</small>`
              : ""
          }

        </article>

      `;

    }).join("");


  } catch (error) {

    console.error(error);

    grid.innerHTML =
      '<p class="loading">Product load হয়নি।</p>';

  }
}


// =============================
// LARGE PRODUCT
// =============================

function openProduct(index) {

  const products =
    window.loadedProducts || [];

  const product =
    products[index];

  if (!product) return;

  currentProduct = product;

  selectedColor = "";

  const colors =
    Array.isArray(product.colors)
      ? product.colors
      : [];


  const firstColor =
    colors.length
      ? colors[0]
      : { name: "", image: "" };


  const viewer =
    document.getElementById("productViewer");

  if (!viewer) return;


  viewer.innerHTML = `

    <div
      class="large-product-box"
      onclick="event.stopPropagation()"
    >

      <button
        class="close-viewer"
        onclick="closeProduct()"
      >
        ×
      </button>


      <div class="large-product-image">

        ${
          firstColor.image
            ? `<img
                id="largeProductImage"
                src="${escapeHtml(firstColor.image)}"
                alt="${escapeHtml(product.name)}"
              >`
            : `<div
                id="bigPlaceholder"
                class="big-placeholder"
              >
                🛍️
              </div>`
        }

      </div>


      <h2>
        ${escapeHtml(product.name)}
      </h2>


      <p class="large-description">
        ${escapeHtml(product.description || "")}
      </p>


      <div class="large-price">
        ৳${Number(product.price || 0).toLocaleString("en-BD")}
      </div>


      ${
        colors.length > 1
          ? `

          <div class="color-title">
            Color নির্বাচন করুন:
          </div>

          <div class="color-buttons">

            ${colors.map(function(color, i) {

              return `
                <button
                  class="color-btn ${i === 0 ? "selected" : ""}"
                  onclick="selectColor(${i}, event)"
                >
                  ${escapeHtml(color.name)}
                </button>
              `;

            }).join("")}

          </div>

          `
          : ""
      }


      <button
        class="order-now-btn"
        onclick="orderCurrentProduct()"
      >
        অর্ডার করুন
      </button>

    </div>

  `;


  viewer.style.display = "flex";

}


function closeProduct() {

  const viewer =
    document.getElementById("productViewer");

  if (viewer) {
    viewer.style.display = "none";
  }

}


// =============================
// COLOR SELECT
// =============================

function selectColor(index, event) {

  event.stopPropagation();

  if (!currentProduct) return;

  const colors =
    Array.isArray(currentProduct.colors)
      ? currentProduct.colors
      : [];

  const color =
    colors[index];

  if (!color) return;


  selectedColor =
    color.name;


  document.querySelectorAll(".color-btn")
    .forEach(function(btn) {
      btn.classList.remove("selected");
    });


  event.target.classList.add("selected");


  const image =
    document.getElementById("largeProductImage");

  const placeholder =
    document.getElementById("bigPlaceholder");


  if (color.image) {

    if (image) {

      image.src = color.image;
      image.style.display = "block";

    } else {

      const box =
        document.querySelector(".large-product-image");

      if (box) {

        box.innerHTML =
          `<img
            id="largeProductImage"
            src="${escapeHtml(color.image)}"
          >`;

      }

    }


    if (placeholder) {
      placeholder.style.display = "none";
    }

  } else {

    if (image) {
      image.style.display = "none";
    }

    if (placeholder) {
      placeholder.style.display = "flex";
    }

  }

}


// =============================
// ORDER
// =============================

function orderCurrentProduct() {

  if (!currentProduct) return;


  const colors =
    Array.isArray(currentProduct.colors)
      ? currentProduct.colors
      : [];


  // ONE COLOR
  if (colors.length === 1) {

    selectedColor =
      colors[0].name || "";

  }


  // MULTIPLE COLOR
  if (colors.length > 1 && !selectedColor) {

    selectedColor =
      colors[0].name || "";

  }


  openOrder(
    currentProduct.name,
    Number(currentProduct.price) || 0,
    selectedColor
  );

}


// =============================
// ORDER MODAL
// =============================

function openOrder(product, price, color) {

  if (!modal) return;

  modal.style.display = "flex";


  document.getElementById("product").value =
    product;


  document.getElementById("price").value =
    price;


  const productName =
    document.getElementById("orderProductName");

  if (productName) {
    productName.textContent = product;
  }


  const productPrice =
    document.getElementById("orderProductPrice");

  if (productPrice) {

    productPrice.textContent =
      Number(price).toLocaleString("en-BD");

  }


  const summaryPrice =
    document.getElementById("summaryPrice");

  if (summaryPrice) {

    summaryPrice.textContent =
      Number(price).toLocaleString("en-BD");

  }


  // COLOR BOX
  const colorBox =
    document.getElementById("orderColor");


  if (colorBox) {

    const colors =
      currentProduct &&
      Array.isArray(currentProduct.colors)
        ? currentProduct.colors
        : [];


    colorBox.innerHTML = "";


    // ONE COLOR
    if (colors.length === 1) {

      colorBox.style.display = "none";

    }


    // MULTIPLE COLOR
    else if (colors.length > 1) {

      colorBox.style.display = "block";


      colors.forEach(function(c) {

        const option =
          document.createElement("option");

        option.value = c.name;

        option.textContent = c.name;


        if (c.name === color) {
          option.selected = true;
        }


        colorBox.appendChild(option);

      });

    }


    else {

      colorBox.style.display = "none";

    }

  }


  document.getElementById("deliveryArea").value = "";

  updateTotal();

  document.getElementById("status").textContent = "";

}


function closeOrder() {

  if (modal) {
    modal.style.display = "none";
  }

}


window.onclick = function(e) {

  if (e.target === modal) {
    closeOrder();
  }

};


// =============================
// DELIVERY
// =============================

function updateTotal() {

  const price =
    Number(document.getElementById("price").value) || 0;

  const area =
    document.getElementById("deliveryArea").value;


  let charge = 0;


  if (area === "ঢাকার ভিতরে") {
    charge = 60;
  }


  if (area === "ঢাকার বাইরে") {
    charge = 120;
  }


  document.getElementById("deliveryCharge").textContent =
    charge;


  document.getElementById("totalPrice").textContent =
    (price + charge).toLocaleString("en-BD");

}


const deliveryArea =
  document.getElementById("deliveryArea");


if (deliveryArea) {

  deliveryArea.addEventListener(
    "change",
    updateTotal
  );

}


// =============================
// SUBMIT ORDER
// =============================

const orderForm =
  document.getElementById("orderForm");


if (orderForm) {

  orderForm.addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const status =
        document.getElementById("status");


      const price =
        Number(document.getElementById("price").value) || 0;


      const area =
        document.getElementById("deliveryArea").value;


      const colorBox =
        document.getElementById("orderColor");


      let color = "";


      if (
        colorBox &&
        colorBox.style.display !== "none"
      ) {

        color = colorBox.value;

      }


      // ONE COLOR PRODUCT
      if (
        !color &&
        currentProduct &&
        Array.isArray(currentProduct.colors) &&
        currentProduct.colors.length === 1
      ) {

        color =
          currentProduct.colors[0].name || "";

      }


      if (!area) {

        status.textContent =
          "ডেলিভারি এলাকা নির্বাচন করুন।";

        return;

      }


      const charge =
        area === "ঢাকার ভিতরে"
          ? 60
          : 120;


      const total =
        price + charge;


      const data =
        new URLSearchParams({

          store: store,

          product:
            document.getElementById("product").value,

          price:
            String(price),

          color:
            color,

          deliveryArea:
            area,

          deliveryCharge:
            String(charge),

          total:
            String(total),

          name:
            document.getElementById("name").value,

          phone:
            document.getElementById("phone").value,

          address:
            document.getElementById("address").value

        });


      status.textContent =
        "অর্ডার পাঠানো হচ্ছে...";


      try {

        await fetch(
          APPS_SCRIPT_URL,
          {
            method: "POST",
            mode: "no-cors",
            body: data
          }
        );


        status.textContent =
          "অর্ডার সফলভাবে নেওয়া হয়েছে। ধন্যবাদ!";


        this.reset();

        updateTotal();


      } catch (error) {

        console.error(error);

        status.textContent =
          "অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।";

      }

    }
  );

}


// =============================
// START
// =============================

loadProducts();
