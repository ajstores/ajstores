const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZV3hrM0m0BhQR8c3Vdmk72ZEstvF-ASKdvV1fPgQ_gMRPOgX6NXmKAN_Hifnh78gK0A/exec";
const modal = document.getElementById('modal');
const store = location.pathname.toLowerCase().includes('kidz') ? 'AJ Kidz Zone' : 'AJ Trendy Hub';

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function jsEscape(v) {
  return String(v ?? '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');
}

async function loadProducts() {
  const grid=document.getElementById('products');
  if(!grid) return;
  try {
    const response=await fetch('products.json?ts='+Date.now());
    if(!response.ok) throw new Error('products.json not found');
    const all=await response.json();
    const products=all.filter(p=>String(p.store).toLowerCase()===store.toLowerCase() && String(p.status).toUpperCase()==='ON');
    if(!products.length) {
      grid.innerHTML='<p class="loading">এখনো কোনো product যোগ করা হয়নি।</p>';
      return;
    }
    grid.innerHTML=products.map(p=>{
      const price=Number(p.price)||0;
      const img=p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : '';
      return `<article class="product"><div class="product-img">${img}<span class="placeholder" ${p.image?'style="display:none"':''}>🛍️</span></div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||'')}</p><strong>৳${price.toLocaleString('en-BD')}</strong><button onclick="openOrder('${jsEscape(p.name)}',${price})">অর্ডার করুন</button></article>`;
    }).join('');
  } catch(err) {
    grid.innerHTML='<p class="loading">Product load হয়নি। Website online host করার পর product দেখাবে।</p>';
  }
}

function openOrder(product,price) {
  modal.style.display='flex';
  document.getElementById('product').value=product;
  document.getElementById('price').value=price;
  const a=document.getElementById('orderProductName'); if(a)a.textContent=product;
  const b=document.getElementById('orderProductPrice'); if(b)b.textContent=Number(price).toLocaleString('en-BD');
  const c=document.getElementById('summaryPrice'); if(c)c.textContent=Number(price).toLocaleString('en-BD');
  document.getElementById('deliveryArea').value='';
  updateTotal();
  document.getElementById('status').textContent='';
}
function closeOrder() {modal.style.display='none';}
window.onclick=e=>{if(e.target===modal)closeOrder();};
function updateTotal() {
  const price=Number(document.getElementById('price').value)||0;
  const area=document.getElementById('deliveryArea').value;
  const charge=area==='ঢাকার ভিতরে'?60:area==='ঢাকার বাইরে'?120:0;
  document.getElementById('deliveryCharge').textContent=charge;
  document.getElementById('totalPrice').textContent=(price+charge).toLocaleString('en-BD');
}
document.getElementById('deliveryArea').addEventListener('change',updateTotal);
document.getElementById('orderForm').addEventListener('submit',async function(e) {
  e.preventDefault();
  const status=document.getElementById('status');
  const price=Number(document.getElementById('price').value)||0;
  const area=document.getElementById('deliveryArea').value;
  if(!area) {status.textContent='ডেলিভারি এলাকা নির্বাচন করুন।';return;}
  const charge=area==='ঢাকার ভিতরে'?60:120;
  const total=price+charge;
  const data=new URLSearchParams({
    store,product:document.getElementById('product').value,price:String(price),
    deliveryArea:area,deliveryCharge:String(charge),total:String(total),
    name:document.getElementById('name').value,phone:document.getElementById('phone').value,
    address:document.getElementById('address').value
  });
  status.textContent='অর্ডার পাঠানো হচ্ছে...';
  try {
    await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',body:data});
    status.textContent='অর্ডার সফলভাবে নেওয়া হয়েছে। ধন্যবাদ!';
    this.reset(); updateTotal();
  } catch(err) {
    status.textContent='অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।';
  }
});
loadProducts();
