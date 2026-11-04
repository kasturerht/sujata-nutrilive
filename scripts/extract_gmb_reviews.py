# scripts/extract_gmb_reviews.py
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
        print(f"Navigating to Place: {url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(5000)
        
        # Click on Reviews tab if present
        # Usually button with text containing "Reviews" or role "tab"
        reviews_tab = page.locator('button[role="tab"]:has-text("Reviews")')
        if await reviews_tab.count() > 0:
            print("Found Reviews tab! Clicking...")
            await reviews_tab.first.click()
            await page.wait_for_timeout(4000)
        else:
            print("Looking for reviews button...")
            btn = page.locator('button:has-text("reviews")')
            if await btn.count() > 0:
                await btn.first.click()
                await page.wait_for_timeout(4000)

        await page.screenshot(path="scripts/maps_reviews_tab.png")
        print("Screenshot saved to scripts/maps_reviews_tab.png")
        
        # Let's extract review items
        # In Google Maps, review cards often have class like 'jftiEf' or container with aria-label
        review_elements = await page.locator('div[data-review-id]').all()
        print(f"Found {len(review_elements)} elements with data-review-id")
        
        if len(review_elements) == 0:
            # try finding by class 'jftiEf'
            review_elements = await page.locator('.jftiEf').all()
            print(f"Found {len(review_elements)} elements with class .jftiEf")
            
        reviews_data = []
        for el in review_elements:
            try:
                # author
                author_el = el.locator('.d4r55')
                author = await author_el.inner_text() if await author_el.count() > 0 else ""
                
                # rating
                rating_el = el.locator('.kvMYJc')
                rating = await rating_el.get_attribute('aria-label') if await rating_el.count() > 0 else ""
                
                # date
                date_el = el.locator('.rsqaWe')
                date = await date_el.inner_text() if await date_el.count() > 0 else ""
                
                # text
                text_el = el.locator('.wiI7pd')
                text = await text_el.inner_text() if await text_el.count() > 0 else ""
                
                # owner response
                owner_el = el.locator('.CDe7pd')
                owner_reply = await owner_el.inner_text() if await owner_el.count() > 0 else ""

                reviews_data.append({
                    "author": author,
                    "rating": rating,
                    "date": date,
                    "text": text,
                    "owner_reply": owner_reply,
                    "raw_text": await el.inner_text()
                })
            except Exception as e:
                print("Error extracting element:", e)

        print("\n--- EXTRACTED REVIEWS ---")
        print(json.dumps(reviews_data, indent=2, ensure_ascii=False))
        
        with open("scripts/extracted_gmb_reviews.json", "w", encoding="utf-8") as f:
            json.dump(reviews_data, f, indent=2, ensure_ascii=False)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
