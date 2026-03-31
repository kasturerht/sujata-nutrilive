import { r as renderScript } from './base_C8vQ1W3a.mjs';
import { c as createComponent } from './astro-component_DEPAHf3t.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, u as unescapeHTML } from './entrypoint_RmKIHCmT.mjs';
import { $ as $$StoreLayout } from './StoreLayout_BwYUnvI8.mjs';

const $$handle = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$handle;
  const shopifyDomain = "skadas-headless-demo.myshopify.com";
  const storefrontToken = "32f678c5f8d1345e945ed48713d9cf2f";
  const { handle } = Astro2.params;
  const productQuery = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      availableForSale
      vendor
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;
  const res = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken
    },
    body: JSON.stringify({ query: productQuery, variables: { handle } })
  });
  const data = await res.json();
  const product = data.data?.product;
  if (!product) {
    return Astro2.redirect("/store");
  }
  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);
  const primaryImage = images[0];
  const price = parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2);
  const maxPrice = parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(2);
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const hasPriceRange = price !== maxPrice;
  return renderTemplate`${renderComponent($$result, "StoreLayout", $$StoreLayout, { "title": `${product.title} | Skadas`, "data-astro-cid-ea5i6owk": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-black/[0.04]" data-astro-cid-ea5i6owk> <div class="max-w-[90rem] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between" data-astro-cid-ea5i6owk> <a href="/store" class="flex items-center gap-2.5 text-[#4B5563] hover:text-[#111827] transition-colors duration-200 group" data-astro-cid-ea5i6owk> <svg class="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ea5i6owk> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7-7-7 7 7 7" data-astro-cid-ea5i6owk></path> </svg> <span class="text-xs font-semibold tracking-[0.15em] uppercase" data-astro-cid-ea5i6owk>All Products</span> </a> <span class="font-['Playfair_Display'] font-bold text-[#111827] text-sm hidden sm:block" data-astro-cid-ea5i6owk>Skadas</span> <div class="w-24 hidden sm:block" data-astro-cid-ea5i6owk></div> </div> </div> <main class="bg-[#FAF9F6] min-h-screen pt-16" data-astro-cid-ea5i6owk> <div class="max-w-[90rem] mx-auto px-6 lg:px-12 py-12 lg:py-20 relative z-10" data-astro-cid-ea5i6owk> <!-- Breadcrumb --> <nav class="flex items-center gap-2 mb-10 lg:mb-14" data-astro-cid-ea5i6owk> <a href="/store" class="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9CA3AF] hover:text-[#166534] transition-colors" data-astro-cid-ea5i6owk>Store</a> <span class="text-[#D1D5DB]" data-astro-cid-ea5i6owk>/</span> <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-[#111827] line-clamp-1" data-astro-cid-ea5i6owk>${product.title}</span> </nav> <!-- Two-column layout --> <div class="grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] gap-10 lg:gap-20 items-start" data-astro-cid-ea5i6owk> <!-- LEFT: Image Gallery --> <div class="lg:sticky lg:top-24 space-y-4" data-astro-cid-ea5i6owk> <!-- Hero Image --> <div id="hero-image-container" class="relative w-full aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-white group" data-astro-cid-ea5i6owk> <div class="absolute inset-0 bg-gradient-to-br from-[#E8F3ED]/40 via-transparent to-transparent pointer-events-none z-10" data-astro-cid-ea5i6owk></div> ${primaryImage ? renderTemplate`<img id="hero-image"${addAttribute(primaryImage.url, "src")}${addAttribute(primaryImage.altText || product.title, "alt")} class="w-full h-full object-contain p-10 transition-all duration-700 ease-out group-hover:scale-[1.03]" data-astro-cid-ea5i6owk>` : renderTemplate`<div class="w-full h-full flex items-center justify-center text-[#9CA3AF] text-xs tracking-widest uppercase" data-astro-cid-ea5i6owk>No Image</div>`} <!-- Stock badge --> <div class="absolute top-5 left-5 z-20" data-astro-cid-ea5i6owk> <span${addAttribute(`text-[8px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 rounded-full shadow-sm ${product.availableForSale ? "bg-white text-[#166534]" : "bg-red-50 text-red-600"}`, "class")} data-astro-cid-ea5i6owk> ${product.availableForSale ? "In Stock" : "Sold Out"} </span> </div> <!-- Vendor --> ${product.vendor && renderTemplate`<div class="absolute top-5 right-5 z-20" data-astro-cid-ea5i6owk> <span class="text-[8px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 rounded-full bg-black/5 text-[#6B7280]" data-astro-cid-ea5i6owk> ${product.vendor} </span> </div>`} </div> <!-- Thumbnail Strip --> ${images.length > 1 && renderTemplate`<div class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" data-astro-cid-ea5i6owk> ${images.map((img, i) => renderTemplate`<button${addAttribute(`thumbnail-btn flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${i === 0 ? "border-[#166534] shadow-md" : "border-transparent opacity-60 hover:opacity-100 hover:border-[#166534]/40"}`, "class")}${addAttribute(img.url, "data-src")}${addAttribute(img.altText || product.title, "data-alt")}${addAttribute(i, "data-index")} data-astro-cid-ea5i6owk> <img${addAttribute(img.url, "src")}${addAttribute(img.altText || product.title, "alt")} class="w-full h-full object-contain bg-white p-2" data-astro-cid-ea5i6owk> </button>`)} </div>`} </div> <!-- RIGHT: Product Info --> <div class="flex flex-col gap-8" data-astro-cid-ea5i6owk> <!-- Title + Rating --> <div data-astro-cid-ea5i6owk> <p class="text-[10px] font-bold tracking-[0.3em] uppercase text-[#166534] mb-3" data-astro-cid-ea5i6owk>Premium Formulation</p> <h1 class="text-[clamp(2rem,4vw,3.25rem)] font-['Playfair_Display'] font-black text-[#111827] leading-[1.1] tracking-tight mb-5" data-astro-cid-ea5i6owk> ${product.title} </h1> <div class="flex items-center gap-2" data-astro-cid-ea5i6owk> <div class="flex items-center gap-0.5" data-astro-cid-ea5i6owk> ${[...Array(5)].map((_) => renderTemplate`<svg class="w-4 h-4 text-[#F59E0B] fill-current" viewBox="0 0 20 20" data-astro-cid-ea5i6owk> <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" data-astro-cid-ea5i6owk></path> </svg>`)} </div> <span class="text-[11px] text-[#6B7280] font-semibold tracking-wider" data-astro-cid-ea5i6owk>4.9 · 124 Reviews</span> </div> </div> <!-- Glassmorphism Pricing Card --> <div class="relative rounded-[1.75rem] overflow-hidden border border-white/60 shadow-[0_8px_32px_rgba(22,101,52,0.06)]" data-astro-cid-ea5i6owk> <div class="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-[#E8F3ED]/60 backdrop-blur-xl" data-astro-cid-ea5i6owk></div> <div class="relative z-10 p-6 lg:p-7" data-astro-cid-ea5i6owk> <div class="flex items-end justify-between mb-5" data-astro-cid-ea5i6owk> <div data-astro-cid-ea5i6owk> <p class="text-[9px] font-bold tracking-[0.25em] uppercase text-[#9CA3AF] mb-1" data-astro-cid-ea5i6owk>Price</p> <div class="flex items-baseline gap-1.5" data-astro-cid-ea5i6owk> <span class="text-[clamp(2rem,4vw,2.75rem)] font-black text-[#111827] leading-none tracking-tight" data-astro-cid-ea5i6owk> ${hasPriceRange ? `${price} – ${maxPrice}` : price} </span> <span class="text-sm font-semibold text-[#6B7280]" data-astro-cid-ea5i6owk>${currency}</span> </div> </div> <div class="text-right" data-astro-cid-ea5i6owk> <span class="inline-flex items-center gap-1.5 bg-[#E8F3ED] text-[#166534] text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full" data-astro-cid-ea5i6owk> <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-ea5i6owk><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" data-astro-cid-ea5i6owk></path></svg>
Free Shipping
</span> </div> </div> <!-- Variant Selector --> ${variants.length > 1 && renderTemplate`<div class="mb-5" data-astro-cid-ea5i6owk> <p class="text-[9px] font-bold tracking-[0.2em] uppercase text-[#6B7280] mb-3" data-astro-cid-ea5i6owk> ${variants[0].selectedOptions[0]?.name || "Options"} </p> <div class="flex flex-wrap gap-2" id="variant-selector" data-astro-cid-ea5i6owk> ${variants.map((v, i) => renderTemplate`<button${addAttribute(`variant-btn text-xs font-bold tracking-wide px-4 py-2.5 rounded-full border-2 transition-all duration-200 ${i === 0 ? "border-[#166534] bg-[#166534] text-white shadow-md" : "border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#166534]/50"} ${!v.availableForSale ? "opacity-40 cursor-not-allowed line-through" : ""}`, "class")}${addAttribute(v.id, "data-variant-id")}${addAttribute(parseFloat(v.price.amount).toFixed(2), "data-price")}${addAttribute(!v.availableForSale, "disabled")} data-astro-cid-ea5i6owk> ${v.title} </button>`)} </div> </div>`} <!-- CTA --> <button id="add-to-cart-btn"${addAttribute(!product.availableForSale, "disabled")} class="w-full h-14 bg-[#166534] hover:bg-[#14532D] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed text-white font-bold text-sm tracking-[0.1em] uppercase rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(22,101,52,0.25)] hover:shadow-[0_8px_32px_rgba(22,101,52,0.35)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3" data-astro-cid-ea5i6owk> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-ea5i6owk> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" data-astro-cid-ea5i6owk></path> </svg> ${product.availableForSale ? "Add to Cart" : "Out of Stock"} </button> <p class="text-center text-[10px] text-[#9CA3AF] tracking-wider mt-4" data-astro-cid-ea5i6owk>Secure checkout · 30-day returns · COD available</p> </div> </div> <!-- Trust Badges --> <div class="grid grid-cols-3 gap-3" data-astro-cid-ea5i6owk> ${[
    { icon: "🌿", label: "100% Organic", sub: "USDA Certified" },
    { icon: "🧬", label: "Vegan Protein", sub: "Plant-based" },
    { icon: "❄️", label: "Cold-Pressed", sub: "Raw nutrients" }
  ].map(({ icon, label, sub }) => renderTemplate`<div class="bg-white rounded-2xl p-4 text-center border border-[#F3F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.03)]" data-astro-cid-ea5i6owk> <div class="text-xl mb-1.5" data-astro-cid-ea5i6owk>${icon}</div> <p class="text-[10px] font-bold text-[#111827] tracking-wide leading-tight" data-astro-cid-ea5i6owk>${label}</p> <p class="text-[9px] text-[#9CA3AF] tracking-wider mt-0.5" data-astro-cid-ea5i6owk>${sub}</p> </div>`)} </div> <!-- Description --> ${product.descriptionHtml ? renderTemplate`<div class="prose-product" data-astro-cid-ea5i6owk> <p class="text-[10px] font-bold tracking-[0.25em] uppercase text-[#166534] mb-4 flex items-center gap-2" data-astro-cid-ea5i6owk> <span class="inline-block w-8 h-[1px] bg-[#166534]/40" data-astro-cid-ea5i6owk></span>
About This Product
</p> <div class="text-[#4B5563] text-[0.9375rem] font-light leading-[1.85] [&_strong]:font-semibold [&_strong]:text-[#111827] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_p]:mb-4" data-astro-cid-ea5i6owk>${unescapeHTML(product.descriptionHtml)}</div> </div>` : product.description ? renderTemplate`<div data-astro-cid-ea5i6owk> <p class="text-[10px] font-bold tracking-[0.25em] uppercase text-[#166534] mb-4 flex items-center gap-2" data-astro-cid-ea5i6owk> <span class="inline-block w-8 h-[1px] bg-[#166534]/40" data-astro-cid-ea5i6owk></span>
About This Product
</p> <p class="text-[#4B5563] text-[0.9375rem] font-light leading-[1.85]" data-astro-cid-ea5i6owk>${product.description}</p> </div>` : null} <!-- Tags --> ${product.tags?.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 pt-2 border-t border-[#F3F4F6]" data-astro-cid-ea5i6owk> ${product.tags.map((tag) => renderTemplate`<span class="text-[9px] font-bold tracking-[0.2em] uppercase bg-[#F9FAF9] text-[#6B7280] border border-[#E5E7EB] px-3 py-1.5 rounded-full" data-astro-cid-ea5i6owk> ${tag} </span>`)} </div>`} </div> </div> </div> </main> ${renderScript($$result2, "F:/RK/Sujata Nutrilive/sujata-nutrilive/src/pages/product/[handle].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "F:/RK/Sujata Nutrilive/sujata-nutrilive/src/pages/product/[handle].astro", void 0);

const $$file = "F:/RK/Sujata Nutrilive/sujata-nutrilive/src/pages/product/[handle].astro";
const $$url = "/product/[handle]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$handle,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
