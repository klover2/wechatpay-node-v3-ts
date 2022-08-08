## JSAPI支付
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
    payer: {
      openid: 'drEc8QfY',
    },
    scene_info: {
      payer_client_ip: 'ip',
    },
  };
  console.log(params);
  const result = await pay.transactions_jsapi(params);
  console.log(result);
#   {
#     appId: 'appid',
#     timeStamp: '1609918952',
#     nonceStr: 'y8aw9vrmx8c',
#     package: 'prepay_id=wx0615423208772665709493edbb4b330000',
#     signType: 'RSA',
#     paySign: 'JnFXsT4VNzlcamtmgOHhziw7JqdnUS9qJ5W6vmAluk3Q2nska7rxYB4hvcl0BTFAB1PBEnHEhCsUbs5zKPEig=='
#   }
```