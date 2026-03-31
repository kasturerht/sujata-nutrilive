document.addEventListener("DOMContentLoaded",()=>{const $=document.querySelectorAll(".add-to-cart-btn"),l=document.getElementById("cart-drawer"),c=document.getElementById("cart-overlay"),k=document.getElementById("close-cart-btn"),b=document.querySelector("#cart-drawer button.group"),u=document.getElementById("cart-items-container"),h=document.getElementById("cart-count-badge"),g=document.getElementById("header-cart-badge"),T=document.getElementById("cart-drawer-trigger"),v=document.getElementById("cart-subtotal"),_="skadas-headless-demo.myshopify.com",E="32f678c5f8d1345e945ed48713d9cf2f",x=()=>{c.classList.remove("opacity-0","pointer-events-none"),c.classList.add("opacity-100"),l.classList.remove("translate-x-[100%]"),l.classList.add("translate-x-0"),document.body.style.overflow="hidden"},w=()=>{c.classList.remove("opacity-100"),c.classList.add("opacity-0","pointer-events-none"),l.classList.remove("translate-x-0"),l.classList.add("translate-x-[100%]"),document.body.style.overflow=""};k?.addEventListener("click",w),c?.addEventListener("click",w),T?.addEventListener("click",e=>{e.preventDefault(),x()});async function m(e,n){return await(await fetch(`https://${_}/api/2024-01/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":E},body:JSON.stringify({query:e,variables:n})})).json()}const d=`
      id checkoutUrl totalQuantity
      cost { totalAmount { amount } }
      lines(first: 10) {
        edges {
          node {
            id quantity
            merchandise {
              ... on ProductVariant {
                id title image { url } price { amount } product { title }
              }
            }
          }
        }
      }
    `;function y(e){if(!e)return;const n=e.totalQuantity||0;h&&(h.innerText=n),g&&(g.innerText=n,g.style.display=n>0?"flex":"none");const t=e.cost?.totalAmount?.amount||0,r=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(t);if(v&&(v.innerText=r),b&&e.checkoutUrl&&(b.onclick=()=>window.location.href=e.checkoutUrl),u.innerHTML="",n===0){u.innerHTML='<div class="text-center py-10 text-gray-600 font-medium">Your routine is empty.</div>';return}const a=2e3,i=a-t,p=Math.min(t/a*100,100);let o="";if(i>0?o=`
          <div class="mb-5 bg-gray-50 p-4 rounded-2xl border border-gray-100 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <p class="text-[11px] font-bold text-gray-800 text-center mb-3 tracking-wide">
              You're only <span class="text-[#166534] text-sm font-black">₹${i}</span> away from <span class="uppercase tracking-widest border-b border-[#166534]">Free Shipping</span> 🚚
            </p>
            <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div class="h-full bg-[#111827] rounded-full transition-all duration-700 ease-out relative" style="width: ${p}%">
                 <div class="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%,rgba(255,255,255,0.2)_100%)] bg-[length:1rem_1rem] animate-[stripe_1s_linear_infinite]"></div>
              </div>
            </div>
          </div>
        `:o=`
          <div class="mb-5 bg-[#f0fdf4] p-4 rounded-2xl border border-emerald-200 animate-[pulse_2s_ease-in-out_1]">
            <p class="text-xs font-black text-[#166534] text-center uppercase tracking-widest flex items-center justify-center gap-2">
              <span class="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              Free Shipping Unlocked! 🎉
            </p>
            <div class="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden mt-3">
              <div class="h-full bg-emerald-500 transition-all duration-700 ease-out" style="width: 100%"></div>
            </div>
          </div>
        `,!document.getElementById("shipping-styles")){const s=document.createElement("style");s.id="shipping-styles",s.innerHTML=`
          @keyframes stripe { from { background-position: 1rem 0; } to { background-position: 0 0; } }
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `,document.head.appendChild(s)}u.insertAdjacentHTML("beforeend",o),e.lines.edges.forEach(({node:s})=>{const L=s.merchandise.product,f=s.merchandise,B=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(f.price.amount),M=f.image?.url||"/spirulina-bottle.png",A=`
          <div class="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-50 mb-4 animate-[fadeInUp_0.5s_ease-out]">
            <div class="w-20 h-24 bg-[#f0fdf4] rounded-xl flex items-center justify-center p-2 relative">
              <div id="loader-${s.id}" class="absolute inset-0 bg-white/80 backdrop-blur-sm hidden flex-center justify-center items-center rounded-xl z-10">
                <div class="w-4 h-4 border-2 border-[#166534] border-t-transparent rounded-full animate-spin mt-10 ml-8"></div>
              </div>
              <img src="${M}" alt="${L.title}" class="w-full h-full object-contain drop-shadow-md"/>
            </div>
            <div class="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 class="text-sm font-bold text-[#111827] line-clamp-1">${L.title}</h3>
                <p class="text-[10px] uppercase tracking-wider text-gray-600 font-semibold mt-1">${f.title!=="Default Title"?f.title:"Pure Form"}</p>
              </div>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                  <button class="qty-btn w-5 h-5 flex items-center justify-center text-gray-500 hover:text-black font-bold" data-line-id="${s.id}" data-action="decrease" data-current="${s.quantity}">-</button>
                  <span class="text-xs font-bold text-[#111827] w-3 text-center">${s.quantity}</span>
                  <button class="qty-btn w-5 h-5 flex items-center justify-center text-gray-500 hover:text-black font-bold" data-line-id="${s.id}" data-action="increase" data-current="${s.quantity}">+</button>
                </div>
                <span class="text-sm font-black text-[#111827]">${B}</span>
              </div>
            </div>
          </div>
        `;u.insertAdjacentHTML("beforeend",A)}),q()}async function C(){const e=localStorage.getItem("sujata_cart_id");if(e){const n=`query { cart(id: "${e}") { ${d} } }`,t=await m(n);t.data?.cart?y(t.data.cart):localStorage.removeItem("sujata_cart_id")}}async function I(e){let n=localStorage.getItem("sujata_cart_id");if(n){const t=`mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${d} } } }`,r=await m(t,{cartId:n,lines:[{merchandiseId:e,quantity:1}]});return r.errors?(localStorage.removeItem("sujata_cart_id"),I(e)):r.data.cartLinesAdd.cart}else{const t=`mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { ${d} } } }`,a=(await m(t,{input:{lines:[{merchandiseId:e,quantity:1}]}})).data.cartCreate.cart;return localStorage.setItem("sujata_cart_id",a.id),a}}async function j(e,n){const t=localStorage.getItem("sujata_cart_id");if(!t)return;const r=document.getElementById(`loader-${e}`);r&&r.classList.remove("hidden");let a,i;n===0?(a=`mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${d} } } }`,i={cartId:t,lineIds:[e]}):(a=`mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${d} } } }`,i={cartId:t,lines:[{id:e,quantity:n}]});const p=await m(a,i),o=p.data.cartLinesUpdate?.cart||p.data.cartLinesRemove?.cart;o&&y(o)}function q(){document.querySelectorAll(".qty-btn").forEach(e=>{e.addEventListener("click",function(){const n=this.getAttribute("data-line-id"),t=parseInt(this.getAttribute("data-current")),a=this.getAttribute("data-action")==="increase"?t+1:t-1;j(n,a)})})}$.forEach(e=>{e.addEventListener("click",async function(n){n.preventDefault();const t=this,r=t.innerHTML,a=t.getAttribute("data-variant-id");t.classList.add("pointer-events-none","!bg-[#166534]"),t.innerHTML='<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> AUTHORIZING...';try{const i=await I(a);y(i),t.innerHTML='<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg> ADDED TO ROUTINE',setTimeout(()=>{x(),setTimeout(()=>{t.innerHTML=r,t.classList.remove("pointer-events-none","!bg-[#166534]")},1e3)},500)}catch(i){console.error("Cart Error:",i),t.innerHTML="ERROR",setTimeout(()=>{t.innerHTML=r,t.classList.remove("pointer-events-none","!bg-[#166534]")},2e3)}})}),C()});
