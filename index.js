const puppeteer = require('puppeteer');
const nodemailer = require("nodemailer");

var exit = false;
if (!process.env.IP) {
  console.log("Need to set environment variable IP");
  exit = true;
}
if (!process.env.PASS) {
  console.log("Need to set environment variable PASS");
  exit = true;
}

if (exit) {
  process.exit(-1);
}

(async() => {
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS == "true",
  });
  const page = await browser
    .pages()
    .then((x) => {
      return x[0]
    });

  await page.goto('http://' + process.env.IP + '/index.html#login')

  await page.waitForSelector('#loginContainer > #frmLogin > .row > .col-xs-4 > #btnLogin')
  await page.type('#txtPwd', process.env.PASS)
  await page.click('#loginContainer > #frmLogin > .row > .col-xs-4 > #btnLogin')

  await page.waitForSelector('#container > .row > a:nth-child(2) > .col-xs-2 > .center-block')
  await page.click('#container > .row > a:nth-child(2) > .col-xs-2 > .center-block')

  await page.waitForSelector('.table > #smslist-table > #smslist-item-72661 > .cursorhand > .sms-table-content')
  await page.click('.table > #smslist-table > #smslist-item-72661 > .cursorhand > .sms-table-content')

  await page.waitForSelector('#smsChatRoom > #inputpanel > .chatform > .chattextinput > #chat-input')

  page.waitFor(500);

  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll('.J_content'))
    return tds.map(td => td.textContent)
  })

  var lastsms = data[Math.max(data.length - 1, 0)];

  if (lastsms.includes("SNOOZE") && lastsms.includes("Tele2")) {
    console.log("Sending SMS");
    await page.type('#chat-input', 'SNOOZE');
    await page.click('#smsChatRoom > #inputpanel > .chatform > .chattextinput > #chat-input')

    await page.waitForSelector('.chatform > .chatfun > .col-xs-4 > span > #btn-send')
    await page.click('.chatform > .chatfun > .col-xs-4 > span > #btn-send')

    if (process.env.MAILSRV && process.env.MAILUSER && process.env.MAILPASS && process.env.MAILTO) {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: process.env.MAILSRV, port: 587, secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAILUSER,
          pass: process.env.MAILPASS
        }
      });

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Tele2 Autoladdning" <' + process.env.MAILUSER + '>', 
        to: process.env.MAILTO,
        subject: "Tele2 Autoladdnign", 
        text: "Nu har vi laddat på Tele2 igen!",
        html: "<b>Nu har vi laddat på Tele2 igen!</b>" 
      };

      // send mail with defined transport object
      let info = await transporter.sendMail(mailOptions)
    }
  } else {
    console.log("Not sending SMS");
  }

  await page.waitFor(5000);
  await browser.close()
})()