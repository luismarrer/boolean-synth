import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warn') {
            console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        console.log(`[PAGE ERROR] ${err.message}`);
    });

    await page.goto('http://localhost:5173/');
    
    // waiting slightly to allow initial renders
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
})();
