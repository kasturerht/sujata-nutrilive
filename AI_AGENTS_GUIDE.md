# 🤖 AI Agent Token-Saving Protocol & Developer Guide

Welcome, AI Coding Agent! This project has a strict **Token Optimization Protocol**. By following this guide, you will execute tasks efficiently, prevent context window bloat, and save up to **70% of LLM token consumption**.

---

## 📌 1. The Core Golden Rules (Tokens = Cost & Speed)

1. **Be Ultra-Concise**: Never write long chat introductions, explanations, or summaries. Keep chat responses brief, professional, and limited to 2-3 sentences.
2. **Targeted Reading**: 
   * NEVER read a full file if you only need a small section.
   * Always use `StartLine` and `EndLine` parameters to read only the lines you need.
3. **Differential File Modification**:
   * Do NOT rewrite or overwrite entire files to make small edits.
   * Use precise block replacement (`replace_file_content`) or chunked diffs.
4. **Scoped Directory Scans**:
   * Do not run recursive global directory listing or wide regex searches.
   * If you need component data, look strictly in `src/components/`. If you need routes, look in `src/pages/`.
5. **Quiet Terminal Output**:
   * Run commands in silent or quiet modes (e.g., `git pull -q`, `npm install --no-audit --quiet`).
   * Do not flood the terminal history, as terminal outputs are appended to the context.

---

## 🗺️ 2. Sujata Nutrilive Project Map (Quick Navigation)

Avoid searching the entire project. Refer to this map:

* **Global Layout & Purchase Notification Toast**: `src/layouts/StoreLayout.astro`
* **Cart Logic (Shopify Mutations & Storefront API)**: `src/components/CartDrawer.astro`
  * Contains central GraphQL queries for cart creation, item addition, and quantity updates.
  * Listeners for adding items are registered globally under `window.addProductToCart(variantId)`.
* **Pincode Tracker & Validator**: `src/components/StoreHeader.astro`
* **Dynamic Product Details Page (PDP)**: `src/pages/product/[handle].astro`
  * High-converting features (Ambient Glow, 3D Rotation, Live Countdown, Comparative Table, UGC Video Testimonials).
* **Lead Capture & Bounce Prevention Engine**: `src/components/ExitPopup.astro`

---

## ⚙️ 3. Execution Workflow for Agents

When given a coding task:
1. **Analyze**: Identify which file is responsible using the Project Map above.
2. **Read Specific Blocks**: Read only the relevant line range in that file.
3. **Draft Small Diff**: Write a highly precise replacement chunk.
4. **Deploy & Build quietly**: Check the build using `npm run build` or `astro check`. Keep terminal outputs minimal.
5. **Report Briefly**: Summarize the change in 1-2 bullet points. Do not summarize the entire system.

---

*Thank you for respecting our token-saving rules. Let's build efficiently!*
