# scripts/extract_reviews_scroll.py
import asyncio
from playwright.async_api import async_playwright
from playwright_stealth.stealth import Stealth
import json

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        await Stealth().apply_stealth_async(page)
        
        url = "https://www.google.com/maps/place/sujata+nutrilive/@20.196791,73.7183639,17z/data=!3m1!4b1!4m6!3m5!1s0x3bddeb29853bf1b7:0x19c8b835beec9b8f!8m2!3d20.196791!4d73.7183639!16s%2Fg%2F11x6wsrdgd"
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(4000)
        
        # Click reviews tab
        reviews_tab = page.locator('button[role="tab"]:has-text("Reviews")')
        if await reviews_tab.count() > 0:
            await reviews_tab.first.click()
            
        print("Waiting for reviews to render...")
        await page.wait_for_timeout(6000)
        
        # Let's take screenshot of the sidebar
        await page.screenshot(path="scripts/maps_reviews_loaded.png")
        print("Saved scripts/maps_reviews_loaded.png")
        
        # Scroll down in the sidebar
        sidebar = page.locator('div[role="main"]')
        if await sidebar.count() > 0:
            for _ in range(3):
                await sidebar.first.evaluate("el => el.scrollTop += 500")
                await page.wait_for_timeout(1000)
                
        await page.screenshot(path="scripts/maps_reviews_scrolled.png")
        print("Saved scripts/maps_reviews_scrolled.png")
        
        # Get all text inside div[role="main"]
        if await sidebar.count() > 0:
            main_text = await sidebar.first.inner_text()
            print("--- SIDEBAR TEXT ---")
            print(main_text)
            with open("scripts/reviews_sidebar_text.txt", "w", encoding="utf-8") as f:
                f.write(main_text)
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
