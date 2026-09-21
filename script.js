// =====================================================
// AJ STORES - PRODUCT + ORDER SYSTEM
// =====================================================

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzZV3hrM0m0BhQR8c3Vdmk72ZEstvF-ASKdvV1fPgQ_gMRPOgX6NXmKAN_Hifnh78gK0A/exec";


// =====================================================
// STORE DETECTION
// =====================================================

const currentPath = window.location.pathname.toLowerCase();

let store = "AJ Trendy Hub";

if (currentPath.includes("/kidz/")) {
  store = "AJ Kidz Zone";
}


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let allProducts = [];
let currentProduct = null;
let currentSlide = 0;


// =====================================================
// ELEMENTS
// =====================================================

const modal = document.getElementById("modal");
const productViewer = document.getElementById("productViewer");


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

  return String(value || "").replace(/[&<>"']/g, function(char) {

    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return map[char];

  });

}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

  const productContainer =
    document.getElementById("products");

  if (!productContainer) return;


  // IMPORTANT:
  // products.json root folder-এ আছে।
  //
  // /ajstores/trendy/ থেকে:
  // ../products.json
  //
  // /ajstores/kidz/ থেকে:
  // ../products.json

  let productsPath = "products.json";

  if (
    currentPath.includes("/trendy/") ||
    currentPath.includes("/kidz/")
  ) {
    productsPath = "../products.json";
  }


  try {

    productContainer.innerHTML =
      '<p class="loading">Product load হচ্ছে...</p>';


    const response = await fetch(
      productsPath + "?v=" + Date.now(),
      {
        cache: "no-store"
      }
    );


    if (!response.ok) {
      throw new Error(
        "products.json পাওয়া যায়নি"
      );
    }


    const data = await response.json();


    // products.json array হলে
    // সরাসরি ব্যবহার করবে।
    //
    // আর যদি {products:[]} হয়
    // সেটাও support করবে।

    const products =
      Array.isArray(data)
        ? data
        : (data.products || []);


    allProducts = products.filter(function(product) {

      const productStore =
        String(product.store || "")
          .trim()
          .toLowerCase();

      const productStatus =
        String(product.status || "")
          .trim()
          .toUpperCase();

      const productName =
        String(product.name || "")
          .trim();


      return (
        productStore === store.toLowerCase() &&
        productStatus === "ON" &&
        productName !== ""
      );

    });


    // No product
    if (!allProducts.length) {

      productContainer.innerHTML = `
        <p class="loading">
          এই store-এ এখন কোনো product নেই।
        </p>
      `;

      return;
    }


    // Display products

    productContainer.innerHTML =
      allProducts.map(function(product, index) {

        const price =
          Number(product.price) || 0;


        let image = "";


        // Multi-color / single-color
        if (
          Array.isArray(product.colors) &&
          product.colors.length > 0
        ) {

          image =
            String(
              product.colors[0].image || ""
            ).trim();

        }


        // Old image system support
        if (!image && product.image) {

          image =
            String(product.image).trim();

        }


        const productName =
          escapeHtml(product.name);


        const description =
          escapeHtml(
            product.description || ""
          );


        let imageHTML = "";


        if (image) {

          imageHTML = `
            <img
              src="${escapeHtml(image)}"
              alt="${productName}"
              onerror="
                this.style.display='none';
                if(this.nextElementSibling){
                  this.nextElementSibling.style.display='flex';
                }
              "
            >
          `;

        }


        return `
          <article class="product">

            <div
              class="product-img"
              onclick="openProduct(${index})"
            >

              ${imageHTML}

              <span
                class="placeholder"
                ${image ? 'style="display:none"' : ""}
              >
                🛍️
              </span>

            </div>


            <h3
              onclick="openProduct(${index})"
            >
              ${productName}
            </h3>


            <p>
              ${description}
            </p>


            <strong>
              ৳${price.toLocaleString("en-BD")}
            </strong>


            <button
              type="button"
              onclick="
                event.stopPropagation();
                openOrderByIndex(${index});
              "
            >
              অর্ডার করুন
            </button>

          </article>
        `;

      }).join("");


  } catch (error) {

    console.error(
      "Product loading error:",
      error
    );


    productContainer.innerHTML = `
      <div class="loading">

        <p>
          Product load হচ্ছে না।
        </p>

        <small>
          products.json file আছে কিনা দেখুন।
        </small>

      </div>
    `;

  }

}


// =====================================================
// OPEN PRODUCT VIEWER
// =====================================================

function openProduct(index) {

  const product =
    allProducts[index];


  if (!product) return;


  currentProduct = product;
  currentSlide = 0;


  const colors =
    Array.isArray(product.colors)
      ? product.colors
      : [];


  let images =
    colors
      .map(function(color) {
        return String(
          color.image || ""
        ).trim();
      })
      .filter(Boolean);


  if (
    images.length === 0 &&
    product.image
  ) {

    images = [
      String(product.image).trim()
    ];

  }


  const price =
    Number(product.price) || 0;


  // ===================================================
  // IMAGE AREA
  // ===================================================

  let imageArea = "";


  if (images.length > 0) {

    imageArea = `
      <div class="product-slider">

        <button
          type="button"
          class="slider-btn prev"
          onclick="previousSlide(event)"
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
          onclick="nextSlide(event)"
        >
          ›
        </button>

      </div>
    `;

  } else {

    imageArea = `
      <div class="product-slider">

        <div id="sliderImageArea">

          <span class="placeholder">
            🛍️
          </span>

        </div>

      </div>
    `;

  }


  // ===================================================
  // COLOR BUTTONS
  // ===================================================

  let colorButtons = "";


  if (colors.length > 1) {

    colorButtons = `
      <div class="viewer-colors">

        <div class="viewer-color-title">
          Color
        </div>


        <div class="viewer-color-list">

          ${colors.map(function(color, index) {

            return `
              <button
                type="button"
                class="
                  viewer-color-btn
                  ${index === 0 ? "active" : ""}
                "
                onclick="
                  event.stopPropagation();
                  selectViewerColor(${index});
                "
              >
                ${escapeHtml(color.name || "")}
              </button>
            `;

          }).join("")}

        </div>

      </div>
    `;

  }


  // ===================================================
  // VIEWER HTML
  // ===================================================

  productViewer.innerHTML = `

    <div
      class="large-product-box"
      onclick="event.stopPropagation()"
    >

      <button
        type="button"
        class="close-viewer"
        onclick="
          event.stopPropagation();
          closeProduct();
        "
      >
        ×
      </button>


      ${imageArea}


      <div class="large-product-info">

        <h2>
          ${escapeHtml(product.name)}
        </h2>


        <p>
          ${escapeHtml(
            product.description || ""
          )}
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


  // ===================================================
  // ORDER BUTTON
  // ===================================================

  const orderButton =
    document.getElementById(
      "viewerOrderButton"
    );


  if (orderButton) {

    orderButton.addEventListener(
      "click",
      function(event) {

        event.preventDefault();
        event.stopPropagation();


        // প্রথমে product viewer বন্ধ
        closeProduct();


        // তারপর ONLY order form
        openOrderByProduct(product);

      }
    );

  }


  // ===================================================
  // SHOW VIEWER
  // ===================================================

  productViewer.style.display = "flex";

  document.body.classList.add(
    "viewer-open"
  );

}


// =====================================================
// GET CURRENT PRODUCT IMAGES
// =====================================================

function getCurrentImages() {

  if (!currentProduct) {
    return [];
  }


  const colors =
    Array.isArray(
      currentProduct.colors
    )
      ? currentProduct.colors
      : [];


  let images =
    colors
      .map(function(color) {
        return String(
          color.image || ""
        ).trim();
      })
      .filter(Boolean);


  if (
    images.length === 0 &&
    currentProduct.image
  ) {

    images = [
      String(currentProduct.image).trim()
    ];

  }


  return images;

}


// =====================================================
// RENDER SLIDE
// =====================================================

function renderSlide() {

  const images =
    getCurrentImages();


  const image =
    document.getElementById(
      "viewerMainImage"
    );


  if (
    !image ||
    images.length === 0
  ) {
    return;
  }


  if (currentSlide < 0) {

    currentSlide =
      images.length - 1;

  }


  if (
    currentSlide >= images.length
  ) {

    currentSlide = 0;

  }


  image.src =
    images[currentSlide];

}


// =====================================================
// NEXT SLIDE
// =====================================================

function nextSlide(event) {

  if (event) {

    event.preventDefault();
    event.stopPropagation();

  }


  const images =
    getCurrentImages();


  if (images.length <= 1) {
    return;
  }


  currentSlide++;

  renderSlide();

}


// =====================================================
// PREVIOUS SLIDE
// =====================================================

function previousSlide(event) {

  if (event) {

    event.preventDefault();
    event.stopPropagation();

  }


  const images =
    getCurrentImages();


  if (images.length <= 1) {
    return;
  }


  currentSlide--;

  renderSlide();

}


// =====================================================
// SELECT COLOR IN PRODUCT VIEWER
// =====================================================

function selectViewerColor(index) {

  if (!currentProduct) {
    return;
  }


  const colors =
    Array.isArray(
      currentProduct.colors
    )
      ? currentProduct.colors
      : [];


  if (!colors[index]) {
    return;
  }


  currentSlide = index;

  renderSlide();


  document
    .querySelectorAll(
      ".viewer-color-btn"
    )
    .forEach(function(button, i) {

      button.classList.toggle(
        "active",
        i === index
      );

    });

}


// =====================================================
// CLOSE PRODUCT VIEWER
// =====================================================

function closeProduct() {

  if (!productViewer) {
    return;
  }


  productViewer.style.display =
    "none";


  // IMPORTANT:
  // image / viewer completely remove
  productViewer.innerHTML = "";


  document.body.classList.remove(
    "viewer-open"
  );

}


// =====================================================
// OPEN ORDER FROM PRODUCT CARD
// =====================================================

function openOrderByIndex(index) {

  const product =
    allProducts[index];


  if (!product) {
    return;
  }


  openOrderByProduct(product);

}


// =====================================================
// OPEN ORDER FORM
// =====================================================

function openOrderByProduct(product) {

  if (!product) {
    return;
  }


  // IMPORTANT:
  // Product viewer বন্ধ
  closeProduct();


  currentProduct =
    product;


  const price =
    Number(product.price) || 0;


  // ===================================================
  // PRODUCT NAME
  // ===================================================

  const productInput =
    document.getElementById(
      "product"
    );


  const productName =
    document.getElementById(
      "orderProductName"
    );


  if (productInput) {

    productInput.value =
      product.name || "";

  }


  if (productName) {

    productName.textContent =
      product.name || "";

  }


  // ===================================================
  // PRICE
  // ===================================================

  const priceInput =
    document.getElementById(
      "price"
    );


  const priceText =
    document.getElementById(
      "orderProductPrice"
    );


  if (priceInput) {

    priceInput.value =
      price;

  }


  if (priceText) {

    priceText.textContent =
      price.toLocaleString("en-BD");

  }


  // ===================================================
  // COLOR
  // ===================================================

  const colorWrap =
    document.getElementById(
      "colorWrap"
    );


  const colorSelect =
    document.getElementById(
      "orderColor"
    );


  const colors =
    Array.isArray(product.colors)
      ? product.colors
      : [];


  if (
    colorWrap &&
    colorSelect
  ) {

    colorSelect.innerHTML = "";


    // MULTI COLOR
    if (colors.length > 1) {

      colorWrap.style.display =
        "block";


      colors.forEach(
        function(color, index) {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            color.name || "";


          option.textContent =
            color.name || "";


          if (index === 0) {

            option.selected = true;

          }


          colorSelect.appendChild(
            option
          );

        }
      );

    }


    // SINGLE COLOR
    else {

      colorWrap.style.display =
        "none";


      colorSelect.innerHTML = "";

      colorSelect.value = "";

    }

  }


  // ===================================================
  // CLEAR CUSTOMER INFORMATION
  // ===================================================

  const nameInput =
    document.getElementById(
      "name"
    );


  const phoneInput =
    document.getElementById(
      "phone"
    );


  const addressInput =
    document.getElementById(
      "address"
    );


  if (nameInput) {
    nameInput.value = "";
  }


  if (phoneInput) {
    phoneInput.value = "";
  }


  if (addressInput) {
    addressInput.value = "";
  }


  // ===================================================
  // RESET DELIVERY
  // ===================================================

  const deliveryArea =
    document.getElementById(
      "deliveryArea"
    );


  if (deliveryArea) {

    deliveryArea.value = "";

  }


  // ===================================================
  // RESET STATUS
  // ===================================================

  const status =
    document.getElementById(
      "status"
    );


  if (status) {

    status.textContent = "";

  }


  updateTotal();


  // ===================================================
  // SHOW ONLY MODAL
  // ===================================================

  if (modal) {

    // Product viewer already closed

    modal.style.display =
      "flex";


    modal.style.position =
      "fixed";


    modal.style.inset = "0";


    modal.style.zIndex =
      "10000";


    document.body.classList.add(
      "modal-open"
    );

  }

}


// =====================================================
// OLD OPEN ORDER SUPPORT
// =====================================================

function openOrder(
  productName,
  price
) {

  const product =
    allProducts.find(
      function(p) {

        return String(p.name)
          .trim()
          .toLowerCase() ===
          String(productName)
            .trim()
            .toLowerCase();

      }
    );


  if (product) {

    openOrderByProduct(product);

  } else {

    openOrderByProduct({

      name: productName,

      price: price,

      colors: []

    });

  }

}


// =====================================================
// CLOSE ORDER FORM
// =====================================================

function closeOrder() {

  if (!modal) {
    return;
  }


  modal.style.display =
    "none";


  document.body.classList.remove(
    "modal-open"
  );

}


// =====================================================
// CLICK OUTSIDE
// =====================================================

window.addEventListener(
  "click",
  function(event) {


    // Close order modal
    if (
      modal &&
      event.target === modal
    ) {

      closeOrder();

    }


    // Close product viewer
    if (
      productViewer &&
      event.target === productViewer
    ) {

      closeProduct();

    }

  }
);


// =====================================================
// ESC KEY
// =====================================================

document.addEventListener(
  "keydown",
  function(event) {

    if (event.key !== "Escape") {
      return;
    }


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
);


// =====================================================
// DELIVERY + TOTAL
// =====================================================

function updateTotal() {

  const priceInput =
    document.getElementById(
      "price"
    );


  const deliveryArea =
    document.getElementById(
      "deliveryArea"
    );


  const deliveryCharge =
    document.getElementById(
      "deliveryCharge"
    );


  const totalPrice =
    document.getElementById(
      "totalPrice"
    );


  if (
    !priceInput ||
    !deliveryArea
  ) {

    return;

  }


  const price =
    Number(
      priceInput.value
    ) || 0;


  let charge = 0;


  if (
    deliveryArea.value ===
    "ঢাকার ভিতরে"
  ) {

    charge = 60;

  }


  if (
    deliveryArea.value ===
    "ঢাকার বাইরে"
  ) {

    charge = 120;

  }


  if (deliveryCharge) {

    deliveryCharge.textContent =
      charge.toLocaleString("en-BD");

  }


  if (totalPrice) {

    totalPrice.textContent =
      (
        price + charge
      ).toLocaleString("en-BD");

  }

}


// =====================================================
// DELIVERY CHANGE
// =====================================================

const deliveryAreaElement =
  document.getElementById(
    "deliveryArea"
  );


if (deliveryAreaElement) {

  deliveryAreaElement.addEventListener(
    "change",
    updateTotal
  );

}


// =====================================================
// ORDER SUBMIT
// =====================================================

const orderForm =
  document.getElementById(
    "orderForm"
  );


if (orderForm) {

  orderForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const status =
        document.getElementById(
          "status"
        );


      const price =
        Number(
          document.getElementById(
            "price"
          ).value
        ) || 0;


      const deliveryArea =
        document.getElementById(
          "deliveryArea"
        ).value;


      if (!deliveryArea) {

        if (status) {

          status.textContent =
            "দয়া করে ডেলিভারি এলাকা নির্বাচন করুন।";

        }

        return;

      }


      let deliveryCharge = 0;


      if (
        deliveryArea ===
        "ঢাকার ভিতরে"
      ) {

        deliveryCharge = 60;

      }


      if (
        deliveryArea ===
        "ঢাকার বাইরে"
      ) {

        deliveryCharge = 120;

      }


      const total =
        price + deliveryCharge;


      // =================================================
      // COLOR
      // =================================================

      let selectedColor = "";


      const colorSelect =
        document.getElementById(
          "orderColor"
        );


      if (
        colorSelect &&
        colorSelect.value
      ) {

        selectedColor =
          colorSelect.value;

      }


      // =================================================
      // FORM DATA
      // =================================================

      const formData =
        new URLSearchParams();


      formData.append(
        "store",
        store
      );


      formData.append(
        "product",
        document.getElementById(
          "product"
        ).value
      );


      formData.append(
        "price",
        String(price)
      );


      formData.append(
        "color",
        selectedColor
      );


      formData.append(
        "deliveryArea",
        deliveryArea
      );


      formData.append(
        "deliveryCharge",
        String(deliveryCharge)
      );


      formData.append(
        "total",
        String(total)
      );


      formData.append(
        "name",
        document.getElementById(
          "name"
        ).value
      );


      formData.append(
        "phone",
        document.getElementById(
          "phone"
        ).value
      );


      formData.append(
        "address",
        document.getElementById(
          "address"
        ).value
      );


      if (status) {

        status.textContent =
          "অর্ডার পাঠানো হচ্ছে...";

      }


      // =================================================
      // SEND TO GOOGLE SHEET
      // =================================================

      try {

        await fetch(
          APPS_SCRIPT_URL,
          {
            method: "POST",
            mode: "no-cors",
            body: formData
          }
        );


        if (status) {

          status.textContent =
            "অর্ডার সফলভাবে নেওয়া হয়েছে। ধন্যবাদ!";

        }


        // Reset customer fields
        document.getElementById(
          "name"
        ).value = "";


        document.getElementById(
          "phone"
        ).value = "";


        document.getElementById(
          "address"
        ).value = "";


        document.getElementById(
          "deliveryArea"
        ).value = "";


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
// START PRODUCT LOADING
// =====================================================

loadProducts();
