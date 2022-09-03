// import puppeteer = require('puppeteer');
// import * as puppeteer from 'puppeteer';
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({path: 'example.png'});
  
    await browser.close();
  })();