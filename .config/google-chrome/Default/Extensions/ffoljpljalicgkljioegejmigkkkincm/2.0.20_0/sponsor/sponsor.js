const MsgZh = {
  "title": "赞助软件开发者",
  "paypalTitle": "PayPal 支付（国际用户）",
  "wechatTitle": "微信支付（中国用户）",
  "footerNote": "* 感谢您的支持！请自行输入赞助金额。此费用用于支持软件作者，而非购买软件或服务，无论是否赞助都不影响软件的功能。"
}

function i18n() {
  // default is english
  if (navigator.language === "zh-CN") {
    let list = document.querySelectorAll('[data-i18n]');
    for (const label of list) {
      label.textContent = MsgZh[label.dataset.i18n];
    }
  }
}
i18n();