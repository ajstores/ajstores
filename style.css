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
let currentSlide = 0;


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c];
  });
}


/* =====================================================
   PAGE LOADER
===================================================== */

function showPageLoader() {

  if (document.getElementById("pageLoader")) return;

  const loader = document.createElement("div");

  loader.id = "pageLoader";

  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-ring"></div>
      <div class="loader-logo">AJ</div>
      <p>Loading...</p>
    </div>
  `;

  document.body.appendChild(loader);
}


function hidePageLoader() {

  const loader =
    document.getElementById("pageLoader");

  if (!loader) return;

  loader.classList.add("hide");

  setTimeout(function () {
    loader.remove();
  }, 500);
}


/* =====================================================
   PRODUCT LOADING
===================================================== */

async function loadProducts() {

  const grid =
    document.getElementById("products");

  if (!grid) {
    hidePageLoader();
    return;
  }

  grid.innerHTML = `
    <div class="products-loading">
      <div class="loading-spinner"></div>
      <p>Product load হচ্ছে...</p>
    </div>
  `;

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

    const allProducts =
      await response.json();

    const products =
      allProducts.filter(function (p) {

        return (
          String(p.store || "")
            .trim()
            .toLowerCase() ===
          store.trim().toLowerCase()
        ) &&
        String(p.status || "")
          .trim()
          .toUpperCase() === "ON";

      });


    if (!products.length) {

      grid.innerHTML = `
        <div class="products-empty">
          <div class="empty-icon">🛍️</div>
          <p>এখনো কোনো product যোগ করা হয়নি।</p>
        </div>
      `;

      hidePageLoader();
      return;
    }


    window.loadedProducts = products;


    grid.innerHTML =
      products.map(function (p, index) {

        const price =
          Number(p.price) || 0;

        const colors =
          Array.isArray(p.colors)
            ? p.colors
            : [];

        const firstColor =
          colors.length
            ? colors[0]
            : null;

        const firstImage =
          firstColor &&
          firstColor.image
            ? firstColor.image
            : "";


        let imageHTML;


        if (firstImage) {

          imageHTML = `
            <img
              src="${escapeHtml(firstImage)}"
              alt="${escapeHtml(p.name)}"
              loading="lazy"
            >
          `;

        } else {

          imageHTML = `
            <div class="placeholder">
              🛍️
            </div>
          `;

        }


        /*
          BADGE

          products.json এ চাইলে:
          "badge":"SALE"
          অথবা
          "badge":"NEW"

          না থাকলে NEW দেখাবে
        */

        const badge =
          String(p.badge || "NEW")
            .trim()
            .toUpperCase();


        return `
          <article
            class="product product-card reveal"
            data-index="${index}"
            onclick="openProduct(${index})"
          >

            <div class="product-img">

              <div class="product-badge">
                ${escapeHtml(badge)}
              </div>

              <div class="heart-btn"
                   onclick="toggleFavorite(event, ${index})">
                <span>♡</span>
              </div>

              ${imageHTML}

              <div class="quick-view">
                View Product
              </div>

            </div>


            <div class="product-info">

              <h3>
                ${escapeHtml(p.name)}
              </h3>

              <div class="product-bottom">

                <strong class="price">
                  ৳${price.toLocaleString("en-BD")}
                </strong>

                ${
                  colors.length > 1
                    ? `
                      <small class="color-count">
                        ${colors.length} colors
                      </small>
                    `
                    : ""
                }

              </div>

            </div>

          </article>
        `;

      }).join("");


    /*
      STAGGER ANIMATION
    */

    requestAnimationFrame(function () {

      const cards =
        document.querySelectorAll(".product-card");

      cards.forEach(function (card, index) {

        card.style.setProperty(
          "--delay",
          `${index * 0.07}s`
        );

        setTimeout(function () {
          card.classList.add("show");
        }, index * 70);

      });

    });


  } catch (error) {

    console.error(error);

    grid.innerHTML = `
      <div class="products-empty">
        <div class="empty-icon">⚠️</div>
        <p>Product load হয়নি।</p>
        <button
          class="retry-btn"
          onclick="loadProducts()"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    `;

  }


  hidePageLoader();

}


/* =====================================================
   OPEN PRODUCT
===================================================== */

function openProduct(index) {

  const products =
    window.loadedProducts || [];

  const product =
    products[index];

  if (!product) return;


  currentProduct = product;
  selectedColor = "";
  currentSlide = 0;


  const colors =
    Array.isArray(product.colors)
      ? product.colors
      : [];


  if (colors.length === 1) {
    selectedColor =
      colors[0].name || "";
  }


  const viewer =
    document.getElementById("productViewer");

  if (!viewer) return;


  viewer.innerHTML = `

    <div
      class="large-product-box product-viewer-animation"
      onclick="event.stopPropagation()"
    >

      <button
        class="close-viewer"
        onclick="closeProduct()"
        aria-label="Close"
      >
        ×
      </button>


      <div
        class="product-slider"
        id="productSlider"
      >

        <div
          id="sliderImageArea"
          class="slider-image-transition"
        ></div>


        ${
          colors.length > 1
            ? `

              <button
                class="slider-arrow slider-prev"
                onclick="previousSlide(event)"
              >
                ‹
              </button>

              <button
                class="slider-arrow slider-next"
                onclick="nextSlide(event)"
              >
                ›
              </button>

              <div
                class="slider-dots"
                id="sliderDots"
              ></div>

            `
            : ""
        }

      </div>


      <div class="viewer-product-info">

        <h2>
          ${escapeHtml(product.name)}
        </h2>

        <p class="large-description">
          ${escapeHtml(product.description || "")}
        </p>

        <div class="large-price">
          ৳${Number(product.price || 0)
            .toLocaleString("en-BD")}
        </div>


        ${
          colors.length > 1
            ? `

              <div class="color-title">
                🎨 Color নির্বাচন করুন
              </div>

              <div
                class="color-buttons stylish-colors"
                id="viewerColors"
              >

                ${colors.map(function (color, i) {

                  return `
                    <button
                      class="
                        color-btn
                        stylish-color-btn
                        ${i === 0 ? "selected" : ""}
                      "
                      onclick="selectColor(${i}, event)"
                    >

                      ${
                        color.image
                          ? `
                            <img
                              src="${escapeHtml(color.image)}"
                              alt=""
                            >
                          `
                          : `
                            <span class="color-circle">
                              ${i + 1}
                            </span>
                          `
                      }

                      <span>
                        ${escapeHtml(color.name)}
                      </span>

                      <b>✓</b>

                    </button>
                  `;

                }).join("")}

              </div>

            `
            : ""
        }


        <button
          class="order-now-btn animated-order-btn"
          onclick="orderCurrentProduct()"
        >
          <span>🛒</span>
          অর্ডার করুন
        </button>

      </div>

    </div>
  `;


  viewer.style.display = "flex";

  document.body.classList.add("modal-open");


  requestAnimationFrame(function () {
    viewer.classList.add("viewer-show");
  });


  renderSlide();


  /* =================================================
     SWIPE
  ================================================= */

  const slider =
    document.getElementById("productSlider");


  if (slider && colors.length > 1) {

    let startX = 0;
    let startY = 0;


    slider.addEventListener(
      "touchstart",
      function (e) {

        startX =
          e.touches[0].clientX;

        startY =
          e.touches[0].clientY;

      },
      { passive: true }
    );


    slider.addEventListener(
      "touchend",
      function (e) {

        const endX =
          e.changedTouches[0].clientX;

        const endY =
          e.changedTouches[0].clientY;


        const differenceX =
          startX - endX;

        const differenceY =
          startY - endY;


        if (
          Math.abs(differenceX) <
          Math.abs(differenceY)
        ) {
          return;
        }


        if (
          Math.abs(differenceX) < 40
        ) {
          return;
        }


        if (differenceX > 0) {
          nextSlide();
        } else {
          previousSlide();
        }

      },
      { passive: true }
    );

  }

}


/* =====================================================
   RENDER SLIDE
===================================================== */

function renderSlide() {

  if (!currentProduct) return;


  const colors =
    Array.isArray(currentProduct.colors)
      ? currentProduct.colors
      : [];


  const imageArea =
    document.getElementById(
      "sliderImageArea"
    );


  if (!imageArea) return;


  if (!colors.length) {

    imageArea.innerHTML = `
      <div class="big-placeholder">
        🛍️
      </div>
    `;

    return;
  }


  const color =
    colors[currentSlide];


  /*
    IMAGE TRANSITION
  */

  imageArea.classList.remove(
    "color-changing"
  );


  void imageArea.offsetWidth;


  imageArea.classList.add(
    "color-changing"
  );


  if (color.image) {

    imageArea.innerHTML = `
      <img
        src="${escapeHtml(color.image)}"
        alt="${escapeHtml(color.name)}"
      >
    `;

  } else {

    imageArea.innerHTML = `
      <div class="big-placeholder">
        🛍️
      </div>
    `;

  }


  selectedColor =
    color.name || "";


  /*
    COLOR BUTTON ACTIVE
  */

  document
    .querySelectorAll(".color-btn")
    .forEach(function (btn, index) {

      if (index === currentSlide) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }

    });


  /*
    DOTS
  */

  const dots =
    document.getElementById(
      "sliderDots"
    );


  if (dots) {

    dots.innerHTML =
      colors.map(function (_, i) {

        return `
          <span
            class="
              slider-dot
              ${i === currentSlide
                ? "active"
                : ""}
            "
          ></span>
        `;

      }).join("");

  }

}


/* =====================================================
   NEXT SLIDE
===================================================== */

function nextSlide(event) {

  if (event) {
    event.stopPropagation();
  }


  if (!currentProduct) return;


  const colors =
    Array.isArray(currentProduct.colors)
      ? currentProduct.colors
      : [];


  if (colors.length <= 1) return;


  currentSlide++;


  if (
    currentSlide >=
    colors.length
  ) {
    currentSlide = 0;
  }


  renderSlide();

}


/* =====================================================
   PREVIOUS SLIDE
===================================================== */

function previousSlide(event) {

  if (event) {
    event.stopPropagation();
  }


  if (!currentProduct) return;


  const colors =
    Array.isArray(currentProduct.colors)
      ? currentProduct.colors
      : [];


  if (colors.length <= 1) return;


  currentSlide--;


  if (currentSlide < 0) {
    currentSlide =
      colors.length - 1;
  }


  renderSlide();

}


/* =====================================================
   SELECT COLOR
===================================================== */

function selectColor(index, event) {

  if (event) {
    event.stopPropagation();
  }


  currentSlide = index;

  renderSlide();

}


/* =====================================================
   CLOSE PRODUCT
===================================================== */

function closeProduct() {

  const viewer =
    document.getElementById(
      "productViewer"
    );


  if (!viewer) return;


  viewer.classList.remove(
    "viewer-show"
  );


  setTimeout(function () {

    viewer.style.display = "none";

    viewer.innerHTML = "";

    document.body.classList.remove(
      "modal-open"
    );

  }, 250);

}


/* =====================================================
   ORDER CURRENT PRODUCT
===================================================== */

function orderCurrentProduct() {

  if (!currentProduct) return;


  const colors =
    Array.isArray(currentProduct.colors)
      ? currentProduct.colors
      : [];


  if (colors.length === 1) {

    selectedColor =
      colors[0].name || "";

  }


  if (colors.length > 1) {

    selectedColor =
      colors[currentSlide].name || "";

  }


  openOrder(
    currentProduct.name,
    Number(currentProduct.price) || 0,
    selectedColor
  );

}


/* =====================================================
   OPEN ORDER MODAL
===================================================== */

function openOrder(
  product,
  price,
  color
) {

  if (!modal) return;


  modal.style.display = "flex";


  requestAnimationFrame(function () {
    modal.classList.add("modal-show");
  });


  document.body.classList.add(
    "modal-open"
  );


  document.getElementById(
    "product"
  ).value = product;


  document.getElementById(
    "price"
  ).value = price;


  const productName =
    document.getElementById(
      "orderProductName"
    );


  if (productName) {
    productName.textContent =
      product;
  }


  const productPrice =
    document.getElementById(
      "orderProductPrice"
    );


  if (productPrice) {

    productPrice.textContent =
      Number(price)
        .toLocaleString("en-BD");

  }


  /*
    COLOR
  */

  const colorWrap =
    document.getElementById(
      "colorWrap"
    );


  const colorBox =
    document.getElementById(
      "orderColor"
    );


  const colors =
    currentProduct &&
    Array.isArray(
      currentProduct.colors
    )
      ? currentProduct.colors
      : [];


  if (colorWrap && colorBox) {

    colorBox.innerHTML = "";


    if (colors.length > 1) {

      colorWrap.style.display =
        "block";


      colors.forEach(
        function (c) {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            c.name;


          option.textContent =
            c.name;


          if (c.name === color) {
            option.selected = true;
          }


          colorBox.appendChild(
            option
          );

        }
      );


      /*
        Stylish order color preview
      */

      createOrderColorButtons(
        colors,
        color
      );


    } else {

      colorWrap.style.display =
        "none";

    }

  }


  document.getElementById(
    "deliveryArea"
  ).value = "";


  updateTotal();


  document.getElementById(
    "status"
  ).textContent = "";

}


/* =====================================================
   STYLISH ORDER COLORS
===================================================== */

function createOrderColorButtons(
  colors,
  selected
) {

  const colorWrap =
    document.getElementById(
      "colorWrap"
    );


  if (!colorWrap) return;


  let old =
    document.getElementById(
      "orderColorStyle"
    );


  if (old) {
    old.remove();
  }


  const box =
    document.createElement(
      "div"
    );


  box.id =
    "orderColorStyle";


  box.className =
    "order-color-buttons";


  colors.forEach(function (
    color,
    index
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "order-color-choice";


    if (
      color.name === selected
    ) {
      button.classList.add(
        "selected"
      );
    }


    button.innerHTML = `

      ${
        color.image
          ? `
            <img
              src="${escapeHtml(color.image)}"
              alt=""
            >
          `
          : `
            <span class="mini-color">
              ${index + 1}
            </span>
          `
      }

      <span>
        ${escapeHtml(color.name)}
      </span>

      <b>✓</b>

    `;


    button.onclick =
      function () {

        document
          .querySelectorAll(
            ".order-color-choice"
          )
          .forEach(function (btn) {
            btn.classList.remove(
              "selected"
            );
          });


        button.classList.add(
          "selected"
        );


        const colorBox =
          document.getElementById(
            "orderColor"
          );


        if (colorBox) {
          colorBox.value =
            color.name;
        }


        selectedColor =
          color.name;

      };


    box.appendChild(
      button
    );

  });


  colorWrap.appendChild(
    box
  );

}


/* =====================================================
   CLOSE ORDER
===================================================== */

function closeOrder() {

  if (!modal) return;


  modal.classList.remove(
    "modal-show"
  );


  setTimeout(function () {

    modal.style.display =
      "none";

    document.body.classList.remove(
      "modal-open"
    );

  }, 250);

}


/* =====================================================
   CLOSE MODALS WITH CLICK
===================================================== */

window.addEventListener(
  "click",
  function (e) {

    if (e.target === modal) {
      closeOrder();
    }

  }
);


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
  "keydown",
  function (e) {

    if (e.key !== "Escape") {
      return;
    }


    const viewer =
      document.getElementById(
        "productViewer"
      );


    if (
      viewer &&
      viewer.style.display === "flex"
    ) {

      closeProduct();

    } else if (
      modal &&
      modal.style.display === "flex"
    ) {

      closeOrder();

    }

  }
);


/* =====================================================
   DELIVERY
===================================================== */

function updateTotal() {

  const price =
    Number(
      document.getElementById(
        "price"
      ).value
    ) || 0;


  const area =
    document.getElementById(
      "deliveryArea"
    ).value;


  let charge = 0;


  if (
    area === "ঢাকার ভিতরে"
  ) {
    charge = 60;
  }


  if (
    area === "ঢাকার বাইরে"
  ) {
    charge = 120;
  }


  const deliveryCharge =
    document.getElementById(
      "deliveryCharge"
    );


  const totalPrice =
    document.getElementById(
      "totalPrice"
    );


  if (deliveryCharge) {
    deliveryCharge.textContent =
      charge;
  }


  if (totalPrice) {

    totalPrice.textContent =
      (price + charge)
        .toLocaleString("en-BD");

  }

}


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


/* =====================================================
   FAVORITE / HEART
===================================================== */

function toggleFavorite(
  event,
  index
) {

  if (event) {
    event.stopPropagation();
  }


  const card =
    document.querySelector(
      `.product-card[data-index="${index}"]`
    );


  if (!card) return;


  const heart =
    card.querySelector(
      ".heart-btn"
    );


  if (!heart) return;


  const isActive =
    heart.classList.toggle(
      "liked"
    );


  const span =
    heart.querySelector(
      "span"
    );


  if (span) {

    span.textContent =
      isActive
        ? "♥"
        : "♡";

  }

}


/* =====================================================
   ORDER SUBMIT
===================================================== */

const orderForm =
  document.getElementById(
    "orderForm"
  );


if (orderForm) {

  orderForm.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();


      const status =
        document.getElementById(
          "status"
        );


      const submitButton =
        orderForm.querySelector(
          'button[type="submit"]'
        );


      const price =
        Number(
          document.getElementById(
            "price"
          ).value
        ) || 0;


      const area =
        document.getElementById(
          "deliveryArea"
        ).value;


      const colorBox =
        document.getElementById(
          "orderColor"
        );


      let color =
        selectedColor || "";


      const colorWrap =
        document.getElementById(
          "colorWrap"
        );


      if (
        colorBox &&
        colorWrap &&
        colorWrap.style.display !==
          "none"
      ) {

        color =
          colorBox.value;

      }


      if (!area) {

        status.textContent =
          "ডেলিভারি এলাকা নির্বাচন করুন।";

        status.classList.add(
          "error"
        );

        return;

      }


      const name =
        document.getElementById(
          "name"
        ).value.trim();


      const phone =
        document.getElementById(
          "phone"
        ).value.trim();


      const address =
        document.getElementById(
          "address"
        ).value.trim();


      if (!name || !phone || !address) {

        status.textContent =
          "সব তথ্য পূরণ করুন।";

        status.classList.add(
          "error"
        );

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
            document.getElementById(
              "product"
            ).value,

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
            name,

          phone:
            phone,

          address:
            address

        });


      status.classList.remove(
        "error"
      );


      status.textContent =
        "অর্ডার পাঠানো হচ্ছে...";


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.classList.add(
          "sending"
        );

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


        status.textContent =
          "✓ অর্ডার সফলভাবে নেওয়া হয়েছে। ধন্যবাদ!";


        status.classList.add(
          "success"
        );


        orderForm.reset();


        selectedColor = "";


        updateTotal();


        /*
          কিছুক্ষণ পরে modal close
        */

        setTimeout(
          function () {
            closeOrder();
          },
          1800
        );


      } catch (error) {

        console.error(error);


        status.textContent =
          "অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।";


        status.classList.add(
          "error"
        );

      }


      if (submitButton) {

        submitButton.disabled =
          false;

        submitButton.classList.remove(
          "sending"
        );

      }

    }
  );

}


/* =====================================================
   SCROLL REVEAL
===================================================== */

function setupScrollAnimation() {

  const items =
    document.querySelectorAll(
      ".reveal"
    );


  if (!items.length) return;


  if (
    !("IntersectionObserver" in window)
  ) {

    items.forEach(function (item) {
      item.classList.add("show");
    });

    return;

  }


  const observer =
    new IntersectionObserver(
      function (entries) {

        entries.forEach(
          function (entry) {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "show"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: 0.08
      }
    );


  items.forEach(function (item) {
    observer.observe(item);
  });

}


/* =====================================================
   BUTTON CLICK ANIMATION
===================================================== */

document.addEventListener(
  "click",
  function (e) {

    const button =
      e.target.closest(
        "button"
      );


    if (!button) return;


    button.classList.add(
      "button-click"
    );


    setTimeout(
      function () {

        button.classList.remove(
          "button-click"
        );

      },
      180
    );

  }
);


/* =====================================================
   IMAGE CLICK EFFECT
===================================================== */

document.addEventListener(
  "click",
  function (e) {

    const img =
      e.target.closest(
        ".product-card img"
      );


    if (!img) return;


    img.classList.add(
      "image-click"
    );


    setTimeout(
      function () {

        img.classList.remove(
          "image-click"
        );

      },
      220
    );

  }
);


/* =====================================================
   HOME BRAND CARD ANIMATION
===================================================== */

function setupBrandAnimation() {

  const brands =
    document.querySelectorAll(
      ".brand-card"
    );


  brands.forEach(
    function (brand, index) {

      brand.classList.add(
        "reveal"
      );


      brand.style.setProperty(
        "--delay",
        `${index * 0.15}s`
      );

    }
  );


  setupScrollAnimation();

}


/* =====================================================
   SMOOTH ANCHOR SCROLL
===================================================== */

document.addEventListener(
  "click",
  function (e) {

    const link =
      e.target.closest(
        'a[href^="#"]'
      );


    if (!link) return;


    const id =
      link.getAttribute(
        "href"
      );


    if (!id || id === "#") {
      return;
    }


    const target =
      document.querySelector(
        id
      );


    if (!target) return;


    e.preventDefault();


    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }
);


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    showPageLoader();

    setupBrandAnimation();

    loadProducts();

  }
);
