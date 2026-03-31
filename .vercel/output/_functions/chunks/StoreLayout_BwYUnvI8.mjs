import { c as createComponent } from './astro-component_DEPAHf3t.mjs';
import 'piccolore';
import { o as renderHead, n as renderSlot, r as renderTemplate } from './entrypoint_RmKIHCmT.mjs';
import 'clsx';

const $$StoreLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$StoreLayout;
  const { title = "Sujata Nutrilive | Premium Spirulina" } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><meta name="description" content="Sujata Nutrilive – Premium cold-pressed Spirulina supplements. Lab-tested, 100% pure. Boost energy, immunity, and mental clarity with nature's most nutrient-dense superfood."><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-[#FAF9F6] text-[#111827] antialiased selection:bg-[#166534]/20 selection:text-[#166534] flex flex-col min-h-screen relative overflow-x-hidden font-['Inter']"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "F:/RK/Sujata Nutrilive/sujata-nutrilive/src/layouts/StoreLayout.astro", void 0);

export { $$StoreLayout as $ };
