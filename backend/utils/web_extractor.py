import requests
from bs4 import BeautifulSoup
import re
import asyncio
from playwright.async_api import async_playwright

async def extract_text_from_url(url: str) -> str:
    """
    Extract readable text from a research article or webpage.
    Handles MDPI, PLOS, Nature, Elsevier, and general blogs.
    Falls back to Playwright if needed.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
    }

    def clean_text(text):
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    # --- Step 1: Try normal requests ---
    print(f"🌐 Fetching {url} ...")
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")

            # Try extracting common article containers
            selectors = [
                "#html-article-content",
                ".article-body",
                ".main-content",
                "article",
                "main",
                ".content",
            ]
            for sel in selectors:
                node = soup.select_one(sel)
                if node and len(node.get_text(strip=True)) > 500:
                    text = clean_text(node.get_text(separator=" "))
                    print(f"✅ Extracted {len(text)} characters using selector {sel}")
                    return text

            # fallback: full body text
            text = clean_text(soup.get_text(separator=" "))
            if len(text) > 500:
                print("⚠️ Using fallback full-body extraction.")
                return text
            else:
                print("⚠️ Page text too short, switching to Playwright.")
        else:
            print(f"⚠️ HTTP {resp.status_code}, will use Playwright fallback.")

    except Exception as e:
        print(f"⚠️ requests failed: {e}")

    # --- Step 2: Playwright fallback ---
    print("🧠 Using Playwright headless browser fallback ...")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=60000)
            await page.wait_for_timeout(3000)

            # Try same selectors
            for sel in ["#html-article-content", "article", "main"]:
                content = await page.query_selector(sel)
                if content:
                    text = await content.inner_text()
                    if len(text) > 500:
                        await browser.close()
                        text = clean_text(text)
                        print(f"✅ Extracted {len(text)} characters via Playwright selector {sel}")
                        return text

            # fallback to full body
            body_text = await page.inner_text("body")
            await browser.close()
            text = clean_text(body_text)
            print(f"✅ Extracted {len(text)} chars from body via Playwright fallback.")
            return text

    except Exception as e:
        raise ValueError(f"Playwright extraction failed: {e}")
