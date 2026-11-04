# scripts/capture_gmb_reviews_rpc.py
import asyncio
from playwright.async_api import async_playwright
from playwright_stealth.stealth import Stealth
import json

reviews_responses = []

async def handle_response(response):
    url = response.url
    # Capture any preview or rpc call
    if "maps/preview" in url or "listugcposts" in url:
        try:
            text = await response.text()
            if len(text) > 500:
                print(f"Captured: {url[:80]}... (len: {len(text)})")
                reviews_responses.append({"url": url, "body": text})
        except Exception:
            pass

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        page.on("response", handle_response)
        await Stealth().apply_stealth_async(page)
        
        url = "https://www.google.com/maps/place/sujata+nutrilive/@20.196791,73.7183639,17z/data=!3m1!4b1!4m6!3m5!1s0x3bddeb29853bf1b7:0x19c8b835beec9b8f!8m2!3d20.196791!4d73.7183639!16s%2Fg%2F11x6wsrdgd"
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(4000)
        
        # Click reviews tab
        reviews_tab = page.locator('button[role="tab"]:has-text("Reviews")')
        if await reviews_tab.count() > 0:
            print("Clicking Reviews tab...")
            await reviews_tab.first.click()
            
        # Wait 8 seconds
        await page.wait_for_timeout(8000)
        
        with open("scripts/gmb_rpc_responses.json", "w", encoding="utf-8") as f:
            json.dump(reviews_responses, f, indent=2, ensure_ascii=False)
            
        print(f"Saved {len(reviews_responses)} responses to scripts/gmb_rpc_responses.json")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
