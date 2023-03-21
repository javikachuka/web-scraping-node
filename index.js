require('dotenv').config();
const { chromium } = require("playwright");
const nodemailer = require("nodemailer");
const {EMAIL, PASS_EMAIL} = process.env
const shops = [
  // {
  //     name: 'Mercado Libre',
  //     url: 'https://listado.mercadolibre.com.ar/jbl-flip-6#D[A:jbl%20flip%206]'
  // },
  {
    name: "Prune",
    url: "https://www.prune.com.ar/carteras-aw23/categorias/bandoleras.html",
  },
  // {
  //     name: 'Solo Deportes',
  //     url: 'https://www.solodeportes.com.ar/catalogsearch/result/index/?modelo=Futbol&q=camiseta+argentina'
  // }
];

const colors = ["negro", "verde", "amarillo", 'peltre', 'blanco'];

async function checkProducts(browser, shop) {
  const page = await browser.newPage();
  // await page.goto(shop.url)
  // await page.screenshot({path: `${shop.name}.png`})
  // await page.waitForSelector('price-tag-fraction')
  // const list = await page.$$('.product.name.product-item-name >> a:has-text("Bond En Cuero")')

  for (let index = 1; index <= 10; index++) {
    console.log("page ", index);
    let fullUrl = index === 1 ? shop.url : `${shop.url}?p=${index}`;
    await page.goto(fullUrl);
    // await page.waitForSelector('price-tag-fraction')
    const list = await page.$$(
      '.product.name.product-item-name >> a:has-text("Bandolera Penny")'
    );
    let i = 0;
    for (const data of list) {
      let text = await data.innerText();
      const href = await data.getAttribute("href");

      let subpage = await browser.newPage();
      await subpage.goto(href);

      let isAvaible = await subpage.$(
        ".action.primary.tocart.block-show.type-regularorder"
      );
      let colorSelector = await subpage.$(".swatch-attribute-selected-option");
      if (isAvaible) {
        console.log("AVAIBLE --> ", text);
        if (colorSelector) {
          let color = await colorSelector.innerText();
          console.log("   Color: ", color);
          if (colors.includes(color.toLowerCase())) {
            console.log("   BUY NOWWWW!!!");
            console.log("     ACCESS", href);
            sendEmail('Bandolera Penny',color, href)
          }
        }
      } else {
        console.log("Not avaible :/ --> ", text);
        if (colorSelector) {
          console.log("    Color: ", await colorSelector.innerText());
        }
      }

      i++;
    }
  }
  // console.log(await prices[0].innerText());
}

async function init() {
  try {
    const browser = await chromium.launch();

    await Promise.all(shops.map((shop) => checkProducts(browser, shop)));

    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

async function sendEmail(product, color, link) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASS_EMAIL,
    },
  });

  let mailOptions = {
    from: "Remitente",
    to: "kachuka99@gmail.com",
    subject: "Info de disponibilidad 2",
    text: "prueba",
    html: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Detalles del producto</title>
          </head>
          <body>
            <h1>Producto: ${product}</h1>
            <p>Color: ${color}</p>
            <p>Puedes comprar este producto haciendo click en el siguiente enlace:</p>
            <a href="${link}">Comprar ahora</a>
          </body>
        </html>
    `
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
        console.log(error.message);
    }else{
        console.log('email enviado');
    }
  })
}

try {
  init();
} catch (error) {
  console.log(error);
}
