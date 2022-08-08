## 下载账单
```bash
import WxPay from 'wechatpay-node-v3';
import fs from 'fs';

const pay = new WxPay({
  appid: '直连商户申请的公众号或移动应用appid',
  mchid: '商户号',  
  publicKey: fs.readFileSync('./apiclient_cert.pem'), // 公钥
  privateKey: fs.readFileSync('./apiclient_key.pem'), // 秘钥
});
```
## 使用
```bash
  const result = await pay.query({out_trade_no: '1609914303237'});
  # 或者 const result = await pay.query({transaction_id: ''});
  console.log(result);
  {
    status: 200,
    appid: 'appid',
    attach: '',
    mchid: '商户号',
    out_trade_no: '1609899981750',
    payer: {},
    promotion_detail: [],
    trade_state: 'CLOSED',
    trade_state_desc: '订单已关闭'
  }
```