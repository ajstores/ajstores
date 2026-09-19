const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZV3hrM0m0BhQR8c3Vdmk72ZEstvF-ASKdvV1fPgQ_gMRPOgX6NXmKAN_Hifnh78gK0A/exec";

const modal = document.getElementById('modal');

const store = location.pathname.toLowerCase().includes('kidz')
  ? 'AJ Kidz Zone'
  : 'AJ Trendy Hub';


// ===============================
// HTML ESCAPE
// ===============================

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}


// ===============================
// JAVASCRIPT ESCAPE
// ===============================

function jsEscape(v) {
  return String(v ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, ' ');
}


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

  const grid = document.getElementById('products');

  if (!grid) return;

  try {

    // products.json location
    const basePath =
      location.pathname.toLowerCase().includes('/trendy/') ||
      location.pathname.toLowerCase().includes('/kidz/')
        ? '../'
        : './';


    const response = await fetch(
      basePath + 'products.json?ts=' + Date.now()
    );


    if (!response.ok) {
      throw new Error('products.json not found');
    }


    const all = await response.json();


    // Filter products according to store
    const products = all.filter(p =>
      String(p.store).toLowerCase() === store.toLowerCase() &&
      String(p.status).toUpperCase() === 'ON'
    );


    if (!products.length) {

      grid.innerHTML =
        '<p class="loading">এখনো কোনো product যোগ করা হয়নি।</p>';

      return;
    }


    // ===============================
    // CREATE PRODUCT CARDS
    // ===============================

    grid.innerHTML = products.map(p => {

      const price = Number(p.price) || 0;


      // ===============================
      // IMAGE FIX
      // ===============================

      let imageUrl = '';

      if (p.image) {

        try {

          // Convert image path into correct absolute URL
          imageUrl = new URL(
            p.image,
            response.url
          ).href;

        } catch (error) {

          imageUrl = p.image;

        }

      }


      const img = imageUrl
        ? `
          <img
            src="${escapeHtml(imageUrl)}"
            alt="${escapeHtml(p.name)}"
            loading="lazy"
            onerror="
              this.style.display='none';
              this.nextElementSibling.style.display='flex';
            "
          >
        `
        : '';


      return `

        <article class="product">

          <div class="product-img">

            ${img}

            <span
              class="placeholder"
              ${imageUrl ? 'style="display:none"' : ''}
            >
              🛍️
            </span>

          </div>


          <h3>
            ${escapeHtml(p.name)}
          </h3>


          <p>
            ${escapeHtml(p.description || '')}
          </p>


          <strong>
            ৳${price.toLocaleString('en-BD')}
          </strong>


          <button
            onclick="openOrder('${jsEscape(p.name)}', ${price})"
          >
            অর্ডার করুন
          </button>

        </article>

      `;

    }).join('');


  } catch (err) {

    console.error('Product loading error:', err);

    grid.innerHTML =
      '<p class="loading">Product load হয়নি। একটু পরে আবার চেষ্টা করুন।</p>';

  }

}


// ===============================
// OPEN ORDER MODAL
// ===============================

function openOrder(product, price) {

  modal.style.display = 'flex';


  document.getElementById('product').value =
    product;


  document.getElementById('price').value =
    price;


  const a =
    document.getElementById('orderProductName');

  if (a)
    a.textContent = product;


  const b =
    document.getElementById('orderProductPrice');

  if (b)
    b.textContent =
      Number(price).toLocaleString('en-BD');


  const c =
    document.getElementById('summaryPrice');

  if (c)
    c.textContent =
      Number(price).toLocaleString('en-BD');


  document.getElementById('deliveryArea').value =
    '';


  updateTotal();


  document.getElementById('status').textContent =
    '';

}


// ===============================
// CLOSE ORDER MODAL
// ===============================

function closeOrder() {

  modal.style.display = 'none';

}


// ===============================
// CLOSE MODAL BY CLICKING OUTSIDE
// ===============================

window.onclick = e => {

  if (e.target === modal) {

    closeOrder();

  }

};


// ===============================
// UPDATE TOTAL PRICE
// ===============================

function updateTotal() {

  const price =
    Number(
      document.getElementById('price').value
    ) || 0;


  const area =
    document.getElementById('deliveryArea').value;


  const charge =
    area === 'ঢাকার ভিতরে'
      ? 60
      : area === 'ঢাকার বাইরে'
        ? 120
        : 0;


  document.getElementById('deliveryCharge').textContent =
    charge;


  document.getElementById('totalPrice').textContent =
    (price + charge).toLocaleString('en-BD');

}


// ===============================
// DELIVERY AREA CHANGE
// ===============================

const deliveryArea =
  document.getElementById('deliveryArea');

if (deliveryArea) {

  deliveryArea.addEventListener(
    'change',
    updateTotal
  );

}


// ===============================
// ORDER FORM SUBMIT
// ===============================

const orderForm =
  document.getElementById('orderForm');


if (orderForm) {

  orderForm.addEventListener(
    'submit',
    async function(e) {

      e.preventDefault();


      const status =
        document.getElementById('status');


      const price =
        Number(
          document.getElementById('price').value
        ) || 0;


      const area =
        document.getElementById('deliveryArea').value;


      // Check delivery area
      if (!area) {

        status.textContent =
          'ডেলিভারি এলাকা নির্বাচন করুন।';

        return;

      }


      // Delivery charge
      const charge =
        area === 'ঢাকার ভিতরে'
          ? 60
          : 120;


      // Total price
      const total =
        price + charge;


      // ===============================
      // ORDER DATA
      // ===============================

      const data = new URLSearchParams({

        store: store,

        product:
          document.getElementById('product').value,

        price:
          String(price),

        deliveryArea:
          area,

        deliveryCharge:
          String(charge),

        total:
          String(total),

        name:
          document.getElementById('name').value,

        phone:
          document.getElementById('phone').value,

        address:
          document.getElementById('address').value

      });


      status.textContent =
        'অর্ডার পাঠানো হচ্ছে...';


      try {

        await fetch(
          APPS_SCRIPT_URL,
          {

            method: 'POST',

            mode: 'no-cors',

            body: data

          }
        );


        status.textContent =
          'অর্ডার সফলভাবে নেওয়া হয়েছে। ধন্যবাদ!';


        this.reset();


        updateTotal();


      } catch (err) {

        console.error(
          'Order error:',
          err
        );


        status.textContent =
          'অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।';

      }

    }
  );

}


// ===============================
// LOAD PRODUCTS ON PAGE LOAD
// ===============================

loadProducts();
