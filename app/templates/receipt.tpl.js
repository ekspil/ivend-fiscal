const QRCode = require("qrcode")

const snos = {
    osn: "ОСН",
    usn_income: "УСН",
    usn_income_outcome: "УСН Д-Р",
    envd: "ЕНВД",
    esn: "ЕСН",
    patent: "ПАТЕНТ"
}

const getQrDataUrl = async (str) => {
    return new Promise((resolve, reject) => {
        QRCode.toDataURL(str, (err, url) => {
            if (err) {
                reject(err)
            } else {
                resolve(url)
            }
        })
    })
}

const render = async (replacements) => {
    const {
        companyName,
        inn,
        fiscalReceiptNumber,
        receiptNumberInShift,
        receiptDate,
        address,
        productName,
        productPrice,
        incomeAmountCash,
        incomeAmountCashless,
        fnsSite,
        sno,
        regKKT,
        hwIdKKT,
        FD,
        FPD,
        sqr
    } = replacements

    const snoMapped = snos[sno] || ""

    const qrcodeDataUrl = await getQrDataUrl(sqr)

    return (`

<html>
    <head>
        <meta charset="utf-8">
        
<style>
body {background:#fff;}
    .check_example {
      position: relative;
      width: 540px;
      margin-left: 40px;
      font-family: 'OpenSansCondensedLight', sans-serif;
      font-size: 18px;
      font-weight: 300;
      padding: 10px;
      line-height: 1.2;
      color: #000;
	}
  	.check_example > p {
      margin: 0 0 0 !important;
      margin-bottom: 0px;
      line-height: 1.6 !important;
      margin-bottom: 0 !important;
      font-size: 18px !important;
  	}
  	.check_example .left {
      text-align: left;
      margin-bottom: 0;
  	}
    .check_example .right {
      border-radius: 3px;
      float: right;
      font-size: 18px;
      font-weight: 300;
      line-height: 1px;
      margin-top: -14px;
      text-align: right;
    }
    .check_example .center {
      margin-top: -27px !important;
      text-align: center;
    }
    .check_example .left_bold {
      font-size: 20px;
      font-weight: 800;
      text-align: left;
      margin-bottom: 0;
    }
    .check_example .right_bold {
      border-radius: 3px;
      float: right;
      font-size: 20px;
      font-weight: 800;
      text-align: right;
    }
    .check_bottom {
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 100%;
      height: 3px;
    }
  	.check-left {
      width: 308px;
      float: left;
      margin-right: 20px;
  	}
  	.check-right {
      width: 308px;
      float: left;
      margin-left: 20px;
  	}
  	.check-left > p {
      padding-bottom: 50px;
    }
</style>
    </head>
    <body>
     
     
     <div class="check_example">
                            <p class="left1">${companyName}</p>
                            <p class="left">${address}</p>
                            
                            <p class="left">КАССОВЫЙ ЧЕК №${fiscalReceiptNumber}</p>
                            <span class="right" id="dateExample">${receiptDate}</span>
                            
                            <p class="left">КАССИР СИСТ.АДМИН</p>
                            <span class="right">ИНН ${inn}</span>
                            
                            <p class="left">НОМЕР СМЕНЫ:</p>
                            <span class="right">${receiptNumberInShift}</span>
                            
                            <p class="left"><b>КАССОВЫЙ ЧЕК/ПРИХОД</b></p>
                            <span class="right"></span>
                            
                            <p class="left">Сайт налогового органа</p>
                            <span class="right">${fnsSite}</span>
                            
                            <p class="left">ПОРЯДКОВЫЙ НОМЕР ЗА СМЕНУ:</p>
                            <span class="right">${fiscalReceiptNumber}</span>
                            <br>
                            
                            <p class="left1">${productName}</p>
                            <p class="center">1 X ${productPrice}</p>
                            <span class="right">${productPrice}</span>
                            <p class="left">СУММА</p>
                            <span class="right">= ${productPrice}</span>
                            <p class="left">НДС 0%</p>
                            <span class="right">= 0.00</span>
                            <div><p class="left_bold">ИТОГО <span class="right_bold" id="sumExample">= ${productPrice}</span></p></div>
                            <p class="left">НАЛИЧНЫМИ</p>
                            <span class="right">= ${incomeAmountCash}</span>
                            <p class="left">БЕЗНАЛИЧНЫМИ</p>
                            <span class="right">= ${incomeAmountCashless}</span>
                            <p class="left">СИСТЕМА НАЛОГООБЛОЖЕНИЯ</p>
                            <span class="right">${snoMapped}</span><br><br>
                            <p class="left">РН ККТ ${regKKT}</p>
                            <p class="left">ФН ${hwIdKKT}</p>
                            <p class="left">ФД ${FD}</p>
                            <p class="left">ФПД ${FPD}</p>
                            
                             <span class="right">
                                 <img class="qr" src="${qrcodeDataUrl}" style="margin-top:-130px;height: 230px; width: 230px;">
                            </span>
                            <div class="check_bottom"></div>
                        </div>
  
   
    </body>
</html>
`.replace(/\s+/g, " "))
}


module.exports = {render}
