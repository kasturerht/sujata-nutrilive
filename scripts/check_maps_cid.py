# scripts/check_maps_cid.py
import asyncio
from playwright.async_api import async_playwright
from playwright_stealth.stealth import Stealth

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        await Stealth().apply_stealth_async(page)
        
        url = "https://maps.google.com/maps?cid=2121240886056382360"
        print(f"Navigating to CID link: {url}")
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        except Exception as e:
            print("Goto error / timeout:", e)
            
        await page.wait_for_timeout(6000)
        print("Page URL:", page.url)
        print("Page Title:", await page.title())
        
        await page.screenshot(path="scripts/maps_cid.png")
        print("Screenshot saved to scripts/maps_cid.png")
        
        content = await page.content()
        with open("scripts/maps_cid.html", "w", encoding="utf-8") as f:
            f.write(content)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
