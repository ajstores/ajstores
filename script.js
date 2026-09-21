const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzZV3hrM0m0BhQR8c3Vdmk72ZEstvF-ASKdvV1fPgQ_gMRPOgX6NXmKAN_Hifnh78gK0A/exec";

const modal = document.getElementById("modal");
const viewer = document.getElementById("productViewer");
const grid = document.getElementById("products");

const store = location.pathname.toLowerCase().includes("/kidz/")
  ? "AJ Kidz Zone"
  : "AJ Trendy Hub";

let allProducts = [];
let currentProduct = null;
let currentColorIndex = 0;

let startX = 0;
let startY = 0;
let dragging = false;

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

function getProductsURL() {
  const path = location.pathname.toLowerCase();

  if (path.includes("/trendy/") || path.includes("/kidz/")) {
    return "../products.json?v=" + Date.now();
  }

  return "products.json?v=" + Date.now();
}

function getColors(product) {

  if (Array.isArray(product.colors) && product.colors.length > 0) {
    return product.colors;
  }

  if (product.image) {
    return [
      {
        name: "",
        image: product.image
      }
    ];
  }

  return [
    {
      name: "",
      image: ""
    }
  ];
}

function getFirstImage(product) {

  const colors = getColors(product);

  return String(
    colors[0]?.image ||
    product.image ||
    ""
  ).trim();
}


/* ==============================
   PRODUCT VIEWER
============================== */

function showViewer(product) {

  currentProduct = product;
  currentColorIndex = 0;

  const colors = getColors(product);

  viewer.innerHTML = `

    <div class="viewer-backdrop"></div>

    <div class="viewer-box">

      <button class="viewer-close">
        ×
      </button>

      <div class="viewer-image-wrap">

        <img
          class="viewer-main-image"
          src="${escapeHtml(colors[0]?.image || "")}"
          alt="${escapeHtml(product.name)}"
        >

      </div>

      <div class="viewer-info">

        <h2 class="viewer-title">
          ${escapeHtml(product.name)}
        </h2>

        <p class="viewer-description">
          ${escapeHtml(product.description || "")}
        </p>

        <div class="viewer-price">
          ৳${Number(product.price || 0).toLocaleString("en-BD")}
        </div>

        ${
          colors.length > 1
          ?
          `
          <div class="viewer-color-label">
            Color:
            <span class="viewer-color">
              ${escapeHtml(colors[0]?.name || "")}
            </span>
          </div>

          <div class="viewer-color-list">

            ${colors.map((color, index) => `

              <button
                type="button"
                class="viewer-color-btn ${index === 0 ? "active" : ""}"
                data-index="${index}"
              >
                ${escapeHtml(color.name)}
              </button>

            `).join("")}

          </div>
          `
          :
          ""
        }

        <button
          type="button"
          class="viewer-order-btn"
        >
          অর্ডার করুন
        </button>

      </div>

    </div>
  `;

  viewer.style.display = "flex";

  document.body.classList.add("viewer-open");

  const closeBtn =
    viewer.querySelector(".viewer-close");

  const backdrop =
    viewer.querySelector(".viewer-backdrop");

  const orderBtn =
    viewer.querySelector(".viewer-order-btn");

  closeBtn.addEventListener(
    "click",
    closeProduct
  );

  backdrop.addEventListener(
    "click",
    closeProduct
  );


  /* COLOR BUTTON */

  viewer
    .querySelectorAll(".viewer-color-btn")
    .forEach(button => {

      button.addEventListener("click", function() {

        currentColorIndex =
          Number(this.dataset.index);

        updateViewerImage();

      });

    });


  /* ORDER */

  orderBtn.addEventListener(
    "click",
    function() {

      const selectedColor =
        colors[currentColorIndex]?.name || "";

      closeProduct();

      openOrderByProduct(
        product,
        selectedColor
      );

    }
  );


  /* ==============================
     SWIPE / DRAG
  ============================== */

  const imageArea =
    viewer.querySelector(".viewer-image-wrap");


  imageArea.addEventListener(
    "pointerdown",
    function(e) {

      dragging = true;

      startX = e.clientX;
      startY = e.clientY;

      imageArea.setPointerCapture?.(
        e.pointerId
      );

    }
  );


  imageArea.addEventListener(
    "pointerup",
    function(e) {

      if (!dragging) return;

      dragging = false;

      const moveX =
        e.clientX - startX;

      const moveY =
        e.clientY - startY;


      /* Minimum swipe distance */

      if (
        Math.abs(moveX) > 50 &&
        Math.abs(moveX) > Math.abs(moveY) &&
        colors.length > 1
      ) {

        /* Swipe LEFT */

        if (moveX < 0) {

          currentColorIndex++;

          if (
            currentColorIndex >= colors.length
          ) {
            currentColorIndex = 0;
          }

        }

        /* Swipe RIGHT */

        else {

          currentColorIndex--;

          if (currentColorIndex < 0) {
            currentColorIndex =
              colors.length - 1;
          }

        }

        updateViewerImage();

      }

    }
  );


  imageArea.addEventListener(
    "pointercancel",
    function() {

      dragging = false;

    }
  );


  updateViewerImage();
}


function updateViewerImage() {

  if (!currentProduct) return;

  const colors =
    getColors(currentProduct);

  const color =
    colors[currentColorIndex];

  const image =
    viewer.querySelector(
      ".viewer-main-image"
    );

  const colorText =
    viewer.querySelector(
      ".viewer-color"
    );


  if (image) {

    image.src =
      color?.image || "";

  }


  if (colorText) {

    colorText.textContent =
      color?.name || "";

  }


  viewer
    .querySelectorAll(".viewer-color-btn")
    .forEach((button, index) => {

      button.classList.toggle(
        "active",
        index === currentColorIndex
      );

    });

}


function closeProduct() {

  viewer.style.display = "none";

  viewer.innerHTML = "";

  currentProduct = null;

  document.body.classList.remove(
    "viewer-open"
  );

}


/* ==============================
   ORDER FORM
============================== */

function openOrderByProduct(
  product,
  selectedColor = ""
) {

  modal.style.display = "flex";

  document.body.classList.add(
    "order-open"
  );


  document.getElementById(
    "product"
  ).value = product.name;


  document.getElementById(
    "price"
  ).value = product.price;


  document.getElementById(
    "orderProductName"
  ).textContent = product.name;


  document.getElementById(
    "orderProductPrice"
  ).textContent =
    Number(product.price)
      .toLocaleString("en-BD");


  const colors =
    getColors(product);


  const colorWrap =
    document.getElementById(
      "colorWrap"
    );


  const colorSelect =
    document.getElementById(
      "orderColor"
    );


  /* MULTI COLOR */

  if (colors.length > 1) {

    colorWrap.style.display =
      "block";


    colorSelect.innerHTML =
      colors.map(color => `

        <option value="${escapeHtml(color.name)}">
          ${escapeHtml(color.name)}
        </option>

      `).join("");


    if (selectedColor) {

      colorSelect.value =
        selectedColor;

    }

  }


  /* SINGLE COLOR */

  else {

    colorWrap.style.display =
      "none";

    colorSelect.innerHTML = "";

  }


  document.getElementById(
    "deliveryArea"
  ).value = "";


  document.getElementById(
    "status"
  ).textContent = "";


  updateTotal();

}


function closeOrder() {

  modal.style.display =
    "none";

  document.body.classList.remove(
    "order-open"
  );

}


function updateTotal() {

  const price =
    Number(
      document.getElementById(
        "price"
      )?.value
    ) || 0;


  const area =
    document.getElementById(
      "deliveryArea"
    )?.value || "";


  let charge = 0;


  if (area === "ঢাকার ভিতরে") {

    charge = 60;

  }

  else if (
    area === "ঢাকার বাইরে"
  ) {

    charge = 120;

  }


  document.getElementById(
    "deliveryCharge"
  ).textContent = charge;


  document.getElementById(
    "totalPrice"
  ).textContent =
    price + charge;

}


/* ==============================
   PRODUCT LIST
============================== */

function renderProducts(products) {

  grid.innerHTML = "";


  products.forEach(
    (product, index) => {

      const image =
        getFirstImage(product);


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "product";


      card.style.setProperty(
        "--delay",
        `${index * 80}ms`
      );


      card.innerHTML = `

        <div class="product-img">

          ${
            image
            ?
            `
            <img
              src="${escapeHtml(image)}"
              alt="${escapeHtml(product.name)}"
            >
            `
            :
            `
            <div class="placeholder">
              🛍️
            </div>
            `
          }

          <div class="product-hover">
            View Product
          </div>

        </div>


        <h3>
          ${escapeHtml(product.name)}
        </h3>


        <p>
          ${escapeHtml(product.description || "")}
        </p>


        <div class="product-bottom">

          <strong>
            ৳${Number(product.price)
              .toLocaleString("en-BD")}
          </strong>


          <button
            type="button"
            class="card-order"
          >
            অর্ডার করুন
          </button>

        </div>

      `;


      /* CARD CLICK */

      card.addEventListener(
        "click",
        function(e) {

          if (
            e.target.closest(
              ".card-order"
            )
          ) {
            return;
          }

          showViewer(product);

        }
      );


      /* ORDER BUTTON */

      card
        .querySelector(
          ".card-order"
        )
        .addEventListener(
          "click",
          function(e) {

            e.stopPropagation();

            closeProduct();

            const colors =
              getColors(product);


            openOrderByProduct(
              product,
              colors.length > 1
                ? colors[0].name
                : ""
            );

          }
        );


      grid.appendChild(card);

    }
  );

}


/* ==============================
   LOAD PRODUCTS
============================== */

async function loadProducts() {

  try {

    const response =
      await fetch(
        getProductsURL(),
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "products.json not found"
      );

    }


    const data =
      await response.json();


    const products =
      Array.isArray(data)
      ? data
      : data.products || [];


    allProducts =
      products.filter(product =>

        String(product.store)
          .trim()
          .toLowerCase()
          === store.toLowerCase()

        &&

        String(product.status)
          .trim()
          .toUpperCase()
          === "ON"

      );


    renderProducts(
      allProducts
    );


  }

  catch(error) {

    console.error(error);

    grid.innerHTML = `

      <p class="loading">

        Product load করা যায়নি।

      </p>

    `;

  }

}


/* ==============================
   ORDER EVENTS
============================== */

const deliveryArea =
  document.getElementById(
    "deliveryArea"
  );


if (deliveryArea) {

  deliveryArea.addEventListener(
    "change",
    updateTotal
  );

}


if (modal) {

  modal.addEventListener(
    "click",
    function(e) {

      if (e.target === modal) {

        closeOrder();

      }

    }
  );

}


/* ==============================
   SUBMIT ORDER
============================== */

const orderForm =
  document.getElementById(
    "orderForm"
  );


if (orderForm) {

  orderForm.addEventListener(
    "submit",
    async function(e) {

      e.preventDefault();


      const area =
        document.getElementById(
          "deliveryArea"
        ).value;


      const price =
        Number(
          document.getElementById(
            "price"
          ).value
        );


      if (!area) {

        document.getElementById(
          "status"
        ).textContent =
          "দয়া করে ডেলিভারি এলাকা নির্বাচন করুন।";

        return;

      }


      const charge =
        area === "ঢাকার ভিতরে"
        ? 60
        : 120;


      const total =
        price + charge;


      const colorWrap =
        document.getElementById(
          "colorWrap"
        );


      const color =
        colorWrap.style.display !== "none"
        ?
        document.getElementById(
          "orderColor"
        ).value
        :
        "";


      const data =
        new URLSearchParams({

          store: store,

          product:
            document.getElementById(
              "product"
            ).value,

          price:
            price,

          color:
            color,

          deliveryArea:
            area,

          deliveryCharge:
            charge,

          total:
            total,

          name:
            document.getElementById(
              "name"
            ).value,

          phone:
            document.getElementById(
              "phone"
            ).value,

          address:
            document.getElementById(
              "address"
            ).value

        });


      document.getElementById(
        "status"
      ).textContent =
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


        document.getElementById(
          "status"
        ).textContent =
          "অর্ডার সফলভাবে নেওয়া হয়েছে। ধন্যবাদ!";


        this.reset();

        updateTotal();


      }

      catch(error) {

        console.error(error);

        document.getElementById(
          "status"
        ).textContent =
          "অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।";

      }

    }
  );

}


/* ==============================
   ESC KEY
============================== */

document.addEventListener(
  "keydown",
  function(e) {

    if (e.key === "Escape") {

      closeProduct();

      closeOrder();

    }

  }
);


/* ==============================
   PAGE LOAD
============================== */

window.addEventListener(
  "load",
  function() {

    document.body.classList.add(
      "page-loaded"
    );

  }
);


loadProducts();
