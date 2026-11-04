# scripts/scrape_gmb_reviews.py
import asyncio
import json
from playwright.async_api import async_playwright
from playwright_stealth.stealth import Stealth

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()
        await Stealth().apply_stealth_async(page)
        
        # Sujata Nutrilive Agrotech Google Search / Maps page
        url = "https://www.google.com/search?q=Sujata+Nutrilive+Agrotech+Nashik+reviews&hl=en"
        print(f"Navigating to: {url}")
        await page.goto(url, wait_until="networkidle", timeout=30000)
        
        # Check title
        title = await page.title()
        print(f"Page title: {title}")
        
        # Take a screenshot to inspect
        await page.screenshot(path="scripts/gmb_search_screen.png")
        print("Screenshot saved to scripts/gmb_search_screen.png")
        
        content = await page.content()
        with open("scripts/gmb_rendered.html", "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"Rendered HTML saved ({len(content)} chars)")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
