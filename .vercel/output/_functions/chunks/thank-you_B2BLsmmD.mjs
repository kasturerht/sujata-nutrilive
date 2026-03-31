import { r as renderScript } from './base_ytspo_Is.mjs';
import { c as createComponent } from './astro-component_MpF3f0r4.mjs';
import 'piccolore';
import { r as renderTemplate, n as renderSlot, o as renderHead, u as unescapeHTML, h as addAttribute, l as renderComponent, m as maybeRenderHead } from './entrypoint_BsvHG05z.mjs';
import 'clsx';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "Skadas | Enterprise Astro Agency & Headless CMS Migration Experts",
    description = "Elite technical growth squad. We engineer zero-latency headless commerce platforms, execute Shopify to Headless migrations, and deploy precise Server-Side tracking architecture.",
    image = "/og-image.jpg",
    // Apan nantar ek real image public folder madhe taku
    canonicalURL = new URL(Astro2.url.pathname, Astro2.site || "https://www.skadas.com").href
  } = Astro2.props;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.skadas.com/#website",
        "url": "https://www.skadas.com/",
        "name": "Skadas",
        "description": "Enterprise Technical Growth Squad & Headless Commerce Architects",
        "publisher": {
          "@id": "https://www.skadas.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.skadas.com/#organization",
        "name": "Skadas",
        "url": "https://www.skadas.com/",
        "logo": {
          "@type": "ImageObject",
          "url": new URL("/logo.png", Astro2.site || "https://www.skadas.com").href
        },
        "sameAs": [
          "https://www.linkedin.com/company/skadas",
          // Tuze social links ithe tak
          "https://twitter.com/skadas"
        ]
      },
      {
        "@type": "ProfessionalService",
        "@id": "https://www.skadas.com/#service",
        "name": "Skadas Headless Commerce Migration",
        "url": canonicalURL,
        "image": new URL(image, Astro2.site || "https://www.skadas.com").href,
        "description": description,
        "provider": {
          "@id": "https://www.skadas.com/#organization"
        },
        "areaServed": ["US", "AU", "UK"],
        "priceRange": "$$$$",
        "knowsAbout": ["Headless CMS", "Astro JS", "Sanity CMS", "Server-Side Tagging", "Shopify Headless"]
      }
    ]
  };
  return renderTemplate(_a || (_a = __template(['<html lang="en" class="scroll-smooth bg-[#030712]"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#030712"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', `><meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"><script type="text/partytown">
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-W4XZSFX');
    <\/script><title>`, '</title><meta name="title"', '><meta name="description"', '><link rel="canonical"', '><meta name="keywords" content="Enterprise Astro Agency, Headless CMS Migration Experts, Server-Side Tracking Consultants, GA4 Advanced Analytics, Headless Commerce Development, Shopify to Headless, Custom React Architecture"><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><meta property="og:image:alt" content="Skadas - Enterprise Technical Growth Squad"><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"', '><meta property="twitter:title"', '><meta property="twitter:description"', '><meta property="twitter:image"', '><meta property="twitter:image:alt" content="Skadas - Enterprise Technical Growth Squad"><script type="application/ld+json">', "<\/script>", '</head> <body class="bg-[#030712] text-slate-300 antialiased selection:bg-cyan-500/30 selection:text-white flex flex-col min-h-screen relative overflow-x-hidden"> <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W4XZSFX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript> <div class="fixed inset-0 z-[-2] min-h-screen w-full bg-[#030712] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.08),rgba(0,0,0,0))]"></div> ', " ", " </body> </html>"])), addAttribute(Astro2.generator, "content"), title, addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(canonicalURL, "href"), addAttribute(canonicalURL, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.site || "https://www.skadas.com").href, "content"), addAttribute(canonicalURL, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.site || "https://www.skadas.com").href, "content"), unescapeHTML(JSON.stringify(schema)), renderHead(), renderSlot($$result, $$slots["default"]), renderScript($$result, "F:/RK/Sujata Nutrilive/sujata-nutrilive/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts"));
}, "F:/RK/Sujata Nutrilive/sujata-nutrilive/src/layouts/Layout.astro", void 0);

const $$ThankYou = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Thank You | Skadas", "description": "Your message has been received successfully." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="pt-32 pb-24 flex items-center justify-center min-h-[80vh] relative z-10"> <div class="text-center px-6 max-w-2xl mx-auto reveal"> <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-8 shadow-[0_0_30px_rgba(34,211,238,0.2)]"> <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg> </div> <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4">Transmission <span class="text-cyan-400">Successful.</span></h1> <p class="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
We have received your request. One of our growth architects will analyze your requirements and reach out to you shortly.
</p> <a href="/" class="inline-flex items-center gap-2 bg-white text-slate-950 font-bold py-4 px-8 rounded-full hover:bg-cyan-400 hover:text-slate-900 transition-all duration-300">
Return to Homepage
<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> </a> </div> </main> ` })}`;
}, "F:/RK/Sujata Nutrilive/sujata-nutrilive/src/pages/thank-you.astro", void 0);

const $$file = "F:/RK/Sujata Nutrilive/sujata-nutrilive/src/pages/thank-you.astro";
const $$url = "/thank-you";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ThankYou,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
