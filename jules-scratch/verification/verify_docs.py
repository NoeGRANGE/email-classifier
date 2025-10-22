from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    page.goto("http://localhost:3000")
    page.screenshot(path="jules-scratch/verification/homepage.png")

    page.goto("http://localhost:3000/introduction")
    page.screenshot(path="jules-scratch/verification/introduction.png")

    page.goto("http://localhost:3000/how-it-works")
    page.screenshot(path="jules-scratch/verification/how-it-works.png")

    page.goto("http://localhost:3000/data-privacy")
    page.screenshot(path="jules-scratch/verification/data-privacy.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
