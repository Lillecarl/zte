const puppeteer = require('puppeteer');
const ping = require('ping');

ping.sys.probe('8.8.8.8', function(isAlive) {
  (async () => {
    if (!isAlive) {
      console.log('Sending SMS to Tele2');
      const browser = await puppeteer.launch({headless: false});
      const page = await browser.newPage();
      await page.goto('http://' + process.env.IP);
      await page.waitForSelector('#txtPwd');
      await page.type('#txtPwd', 'process.env.PASS', {delay: 100});
      await page.click('#btnLogin');
      await page.waitFor(2500);
      await page.goto('http://192.168.100.1/index.html#sms');
      await page.waitForSelector('#smslist-new-sms');
      await page.click('#smslist-new-sms');
      await page.waitForSelector('#chosen-search-field-input');
      await page.type('#chosen-search-field-input', '772661', {delay: 100});
      await page.type('#chosen-search-field-input', String.fromCharCode(13));
      await page.type('#chat-input', 'SNOOZE');
      await page.click('#btn-send');
      await page.waitFor(2500);
      //browser.close()
    }
    else {
      console.log('Already got data');
    }
  })(); 
})
