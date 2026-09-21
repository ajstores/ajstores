// =====================================================
// AJ STORES - PRODUCT + ORDER SYSTEM
// Products from products.json
// Orders saved to Google Sheets
// =====================================================

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzZV3hrM0m0BhQR8c3Vdmk72ZEstvF-ASKdvV1fPgQ_gMRPOgX6NXmKAN_Hifnh78gK0A/exec";

const modal = document.getElementById("modal");
const productViewer = document.getElementById("productViewer");

const store = location.pathname.toLowerCase().includes("kidz")
  ? "AJ Kidz Zone"
  : "AJ Trendy Hub";

let allProducts = [];
let currentProduct = null;


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {
  const grid = document.getElementById("products");

  if (!grid) return;

  try {
    const response = await fetch("products.json?v=" + Date.now(), {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("products.json load failed");
    }

    const data = await response.json();

    const products = Array.isArray(data)
      ? data
      : (data.products || []);

    allProducts = products.filter(p =>
      String(p.store || "").trim().toLowerCase() === store.toLowerCase() &&
      String(p.status || "").trim().toUpperCase() === "ON" &&
      String(p.name || "").trim() !== ""
    );

    if (!allProducts.length) {
      grid.innerHTML =
        '<p class="loading">এখনো কোনো product যোগ করা হয়নি।</p>';
      return;
    }

    grid.innerHTML = allProducts.map((p, index) => {

      const price = Number(p.price) || 0;

      let image = "";

      if (Array.isArray(p.colors) && p.colors.length > 0) {
        image = String(p.colors[0].image || "").trim();
      }

      if (!image) {
        image = String(p.image || "").trim();
      }

      const safeName = escapeHtml(p.name);
      const safeDescription = escapeHtml(p.description || "");
      const safeImage = escapeHtml(image);

      const imageHtml = image
        ? `
          <img
            src="${safeImage}"
            alt="${safeName}"
            onerror="
              this.style.display='none';
              if(this.nextElementSibling){
                this.nextElementSibling.style.display='flex';
              }
            "
          >
        `
        : "";

      return `
        <article class="product">

          <div
            class="product-img"
            onclick="openProduct(${index})"
            style="cursor:pointer;"
          >
            ${imageHtml}
            <span
              class="placeholder"
              ${image ? 'style="display:none"' : ""}
            >
              🛍️
            </span>
          </div>

          <h3 onclick="openProduct(${index})" style="cursor:pointer;">
            ${safeName}
          </h3>

          <p>${safeDescription}</p>

          <strong>
            ৳${price.toLocaleString("en-BD")}
          </strong>

          <button
            type="button"
            onclick="event.stopPropagation(); openOrderByIndex(${index})"
          >
            অর্ডার করুন
          </button>

        </article>
      `;
    }).join("");

  } catch (error) {

    console.error(error);

    grid.innerHTML = `
      <div class="loading">
        Product load করা যায়নি। products.json file আছে কিনা দেখুন।
      </div>
    `;
  }
}


// =====================================================
// SECURITY HELPERS
// =====================================================

function escapeHtml(value) {

  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

}


// =====================================================
// PRODUCT VIEWER
// =====================================================

function openProduct(index) {

  const product = allProducts[index];

  if (!product) return;

  currentProduct = product;

  const colors =
    Array.isArray(product.colors) && product.colors.length
      ? product.colors
      : [];

  let images = colors
    .map(c => String(c.image || "").trim())
    .filter(Boolean);

  if (!images.length && product.image) {
    images = [String(product.image).trim()];
  }

  const price = Number(product.price) || 0;

  const colorButtons = colors.length > 1
    ? `
      <div class="viewer-colors">
        <div class="viewer-color-title">
          Color
        </div>

        <div class="viewer-color-list">
          ${colors.map((c, i) => `
            <button
              type="button"
              class="viewer-color-btn ${i === 0 ? "active" : ""}"
              onclick="selectViewerColor(${i})"
            >
              ${escapeHtml(c.name || "")}
            </button>
          `).join("")}
        </div>
      </div>
    `
    : "";

  const imageHtml = images.length
    ? `
      <div class="product-slider">

        <button
          type="button"
          class="slider-btn prev"
          onclick="previousSlide()"
        >
          ‹
        </button>

        <div id="sliderImageArea">
          <img
            id="viewerMainImage"
            src="${escapeHtml(images[0])}"
            alt="${escapeHtml(product.name)}"
          >
        </div>

        <button
          type="button"
          class="slider-btn next"
          onclick="nextSlide()"
        >
          ›
        </button>

      </div>
    `
    : `
      <div class="product-slider">
        <div id="sliderImageArea">
          <span class="placeholder">
            🛍️
          </span>
        </div>
      </div>
    `;

  productViewer.innerHTML = `
    <div
      class="large-product-box"
      onclick="event.stopPropagation()"
    >

      <button
        type="button"
        class="close-viewer"
        onclick="closeProduct()"
      >
        ×
      </button>

      ${imageHtml}

      <div class="large-product-info">

        <h2>
          ${escapeHtml(product.name)}
        </h2>

        <p>
          ${escapeHtml(product.description || "")}
        </p>

        <strong class="large-product-price">
          ৳${price.toLocaleString("en-BD")}
        </strong>

        ${colorButtons}

        <button
          type="button"
          class="order-now-btn"
          id="viewerOrderButton"
        >
          অর্ডার করুন
        </button>

      </div>

    </div>
  `;

  // Order button আলাদা event listener দিয়ে চালানো হচ্ছে
  // যাতে click product viewer-এ bubble না করে।
  const orderButton =
    document.getElementById("viewerOrderButton");

  if (orderButton) {

    orderButton.addEventListener("click", function(e) {

      e.preventDefault();
      e.stopPropagation();

      // IMPORTANT:
      // আগে পুরো product viewer বন্ধ হবে
      closeProduct();

      // তারপর শুধু order form খুলবে
      openOrderByProduct(product);

    });
  }

  productViewer.style.display = "flex";

  document.body.classList.add("viewer-open");

  currentSlide = 0;
}


// =====================================================
// SLIDER
// =====================================================

let currentSlide = 0;

function getCurrentImages() {

  if (!currentProduct) return [];

  const colors =
    Array.isArray(currentProduct.colors)
      ? currentProduct.colors
      : [];

  let images = colors
    .map(c => String(c.image || "").trim())
    .filter(Boolean);

  if (!images.length && currentProduct.image) {
    images = [String(currentProduct.image).trim()];
  }

  return images;
}


function renderSlide() {

  const images = getCurrentImages();

  const image =
    document.getElementById("viewerMainImage");

  if (!image || !images.length) return;

  if (currentSlide < 0) {
    currentSlide = images.length - 1;
  }

  if (currentSlide >= images.length) {
    currentSlide = 0;
  }

  image.src = images[currentSlide];
}


function nextSlide() {

  const images = getCurrentImages();

  if (images.length <= 1) return;

  currentSlide++;

  renderSlide();
}


function previousSlide() {

  const images = getCurrentImages();

  if (images.length <= 1) return;

  currentSlide--;

  renderSlide();
}


// =====================================================
// VIEWER COLOR
// =====================================================

function selectViewerColor(index) {

  if (!currentProduct) return;

  const colors =
    Array.isArray(currentProduct.colors)
      ? currentProduct.colors
      : [];

  if (!colors[index]) return;

  currentSlide = index;

  renderSlide();

  document
    .querySelectorAll(".viewer-color-btn")
    .forEach((btn, i) => {

      btn.classList.toggle(
        "active",
        i === index
      );

    });
}


// =====================================================
// CLOSE PRODUCT VIEWER
// =====================================================

function closeProduct() {

  if (!productViewer) return;

  // পুরো viewer remove/close
  productViewer.style.display = "none";
  productViewer.innerHTML = "";

  document.body.classList.remove("viewer-open");
}


// =====================================================
// OPEN ORDER FROM PRODUCT CARD
// =====================================================

function openOrderByIndex(index) {

  const product = allProducts[index];

  if (!product) return;

  openOrderByProduct(product);
}


// =====================================================
// OPEN ORDER
// =====================================================

function openOrderByProduct(product) {

  if (!product) return;

  // খুব গুরুত্বপূর্ণ:
  // Order form খোলার আগে viewer সম্পূর্ণ বন্ধ
  closeProduct();

  currentProduct = product;

  const price = Number(product.price) || 0;

  const productInput =
    document.getElementById("product");

  const priceInput =
    document.getElementById("price");

  const nameText =
    document.getElementById("orderProductName");

  const priceText =
    document.getElementById("orderProductPrice");

  if (productInput) {
    productInput.value = product.name || "";
  }

  if (priceInput) {
    priceInput.value = price;
  }

  if (nameText) {
    nameText.textContent = product.name || "";
  }

  if (priceText) {
    priceText.textContent =
      price.toLocaleString("en-BD");
  }

  // ---------------------------------------------
  // COLOR OPTION
  // ---------------------------------------------

  const colorWrap =
    document.getElementById("colorWrap");

  const colorSelect =
    document.getElementById("orderColor");

  const colors =
    Array.isArray(product.colors)
      ? product.colors
      : [];

  if (colorWrap && colorSelect) {

    colorSelect.innerHTML = "";

    if (colors.length > 1) {

      colorWrap.style.display = "block";

      colors.forEach((color, index) => {

        const option =
          document.createElement("option");

        option.value =
          color.name || "";

        option.textContent =
          color.name || "";

        if (index === 0) {
          option.selected = true;
        }

        colorSelect.appendChild(option);

      });

    } else {

      // Single color হলে Color option থাকবে না
      colorWrap.style.display = "none";

      colorSelect.innerHTML = "";
      colorSelect.value = "";
    }
  }

  // ---------------------------------------------
  // RESET DELIVERY
  // ---------------------------------------------

  const deliveryArea =
    document.getElementById("deliveryArea");

  if (deliveryArea) {
    deliveryArea.value = "";
  }

  // Customer fields clear
  const nameInput =
    document.getElementById("name");

  const phoneInput =
    document.getElementById("phone");

  const addressInput =
    document.getElementById("address");

  if (nameInput) nameInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (addressInput) addressInput.value = "";

  const status =
    document.getElementById("status");

  if (status) {
    status.textContent = "";
  }

  updateTotal();

  // ---------------------------------------------
  // ONLY ORDER FORM SHOW
  // ---------------------------------------------

  if (modal) {

    modal.style.display = "flex";

    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.zIndex = "10000";

    document.body.classList.add("modal-open");
  }
}


// =====================================================
// OLD openOrder SUPPORT
// =====================================================

function openOrder(product, price) {

  const productObject = allProducts.find(
    p =>
      String(p.name).trim() ===
      String(product).trim()
  );

  if (productObject) {

    openOrderByProduct(productObject);

  } else {

    openOrderByProduct({
      name: product,
      price: price,
      colors: []
    });

  }
}


// =====================================================
// CLOSE ORDER
// =====================================================

function closeOrder() {

  if (!modal) return;

  modal.style.display = "none";

  document.body.classList.remove("modal-open");
}


// =====================================================
// CLICK OUTSIDE MODAL
// =====================================================

window.addEventListener("click", function(e) {

  if (modal && e.target === modal) {
    closeOrder();
  }

  if (
    productViewer &&
    e.target === productViewer
  ) {
    closeProduct();
  }

});


// =====================================================
// ESC KEY
// =====================================================

document.addEventListener("keydown", function(e) {

  if (e.key === "Escape") {

    if (
      modal &&
      modal.style.display === "flex"
    ) {
      closeOrder();
      return;
    }

    if (
      productViewer &&
      productViewer.style.display === "flex"
    ) {
      closeProduct();
    }

  }

});


// =====================================================
// DELIVERY + TOTAL
// =====================================================

function updateTotal() {

  const priceInput =
    document.getElementById("price");

  const deliveryArea =
    document.getElementById("deliveryArea");

  const deliveryCharge =
    document.getElementById("deliveryCharge");

  const totalPrice =
    document.getElementById("totalPrice");

  if (!priceInput || !deliveryArea) return;

  const price =
    Number(priceInput.value) || 0;

  const area =
    deliveryArea.value;

  let charge = 0;

  if (area === "ঢাকার ভিতরে") {
    charge = 60;
  }

  if (area === "ঢাকার বাইরে") {
    charge = 120;
  }

  if (deliveryCharge) {
    deliveryCharge.textContent =
      charge.toLocaleString("en-BD");
  }

  if (totalPrice) {
    totalPrice.textContent =
      (price + charge).toLocaleString("en-BD");
  }
}


// =====================================================
// DELIVERY CHANGE
// =====================================================

const deliveryArea =
  document.getElementById("deliveryArea");

if (deliveryArea) {

  deliveryArea.addEventListener(
    "change",
    updateTotal
  );

}


// =====================================================
// SUBMIT ORDER
// =====================================================

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
        Number(
          document.getElementById("price").value
        ) || 0;

      const area =
        document.getElementById("deliveryArea").value;

      if (!area) {

        if (status) {
          status.textContent =
            "দয়া করে ডেলিভারি এলাকা নির্বাচন করুন।";
        }

        return;
      }

      const charge =
        area === "ঢাকার ভিতরে"
          ? 60
          : 120;

      const total =
        price + charge;


      // ---------------------------------------------
      // SELECTED COLOR
      // ---------------------------------------------

      const colorSelect =
        document.getElementById("orderColor");

      let selectedColor = "";

      if (
        colorSelect &&
        colorSelect.value
      ) {

        selectedColor =
          colorSelect.value;
      }


      // ---------------------------------------------
      // SEND DATA
      // ---------------------------------------------

      const data =
        new URLSearchParams({

          store: store,

          product:
            document.getElementById("product").value,

          price:
            String(price),

          color:
            selectedColor,

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


      if (status) {
        status.textContent =
          "অর্ডার পাঠানো হচ্ছে...";
      }


      try {

        await fetch(
          APPS_SCRIPT_URL,
          {
            method: "POST",
            mode: "no-cors",
            body: data
          }
        );


        if (status) {
          status.textContent =
            "অর্ডার সফলভাবে নেওয়া হয়েছে। ধন্যবাদ!";
        }


        // Form reset
        this.reset();

        // Color আবার hide
        const colorWrap =
          document.getElementById("colorWrap");

        if (colorWrap) {
          colorWrap.style.display = "none";
        }

        updateTotal();


      } catch (error) {

        console.error(error);

        if (status) {
          status.textContent =
            "অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।";
        }

      }

    }
  );

}


// =====================================================
// START
// =====================================================

loadProducts();
