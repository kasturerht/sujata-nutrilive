# scripts/inspect_shopify_checkout.py
import asyncio
from playwright.async_api import async_playwright

async def main():
    checkout_url = "https://tvczdq-nu.myshopify.com/checkouts/cn/hWNIRrHC8K8Yxchwrsg4phOW/en-in?_s=7502c694-366d-43da-b45e-a36bb22c005d"
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        print("Navigating to checkout...")
        try:
            await page.goto(checkout_url, wait_until="domcontentloaded", timeout=20000)
        except Exception as e:
            print("Goto error:", e)
            
        await page.wait_for_timeout(5000)
        print("Page title:", await page.title())
        print("Final URL:", page.url)
        
        await page.screenshot(path="scripts/shopify_checkout_screen.png", full_page=True)
        print("Saved screenshot to scripts/shopify_checkout_screen.png")
        
        content = await page.content()
        with open("scripts/checkout_page.html", "w", encoding="utf-8") as f:
            f.write(content)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
