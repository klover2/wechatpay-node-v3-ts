## app支付
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
const params = {
    description: '测试',
    out_trade_no: '订单号',
    notify_url: '回调url',
    amount: {
      total: 1,
    },
    scene_info: {
      payer_client_ip: 'ip',
    },
  };
  console.log(params);
  const result = await pay.transactions_app(params);
  console.log(result);
#   {
#     status: 200,
#     appid: 'appid',
#     partnerid: '商户号',
#     prepayid: 'wx061559014727156ae9554bb17af9d30000',
#     package: 'Sign=WXPay',
#     noncestr: 'm8dbyuytqul',
#     timestamp: '1609919941',
#     sign: 'PLENslMbldtSbtj5mDpX0N78vMMSw7CFPEptSpm+6YktXDa5Qso6KJ/uRCbNCmvM7z5adLoEdTmzjB/mjr5Ow=='
#   }
```