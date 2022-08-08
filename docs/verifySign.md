```typescript
import WxPay from 'wechatpay-node-v3';
import fs from 'fs';

const pay = new WxPay({
  appid: '直连商户申请的公众号或移动应用appid',
  mchid: '商户号',
  publicKey: fs.readFileSync('./apiclient_cert.pem'), // 公钥
  privateKey: fs.readFileSync('./apiclient_key.pem'), // 秘钥
  // key: 'APIv3密钥', // APIv3密钥，可选参数
});
```

## 签名验证
```typescript
const headers = req.headers; // 请求头信息
const params = {
  apiSecret: 'APIv3密钥', // 如果在构造中传入了 key, 这里可以不传该值，否则需要传入该值
  body: req.body, // 请求体 body
  signature: headers['wechatpay-signature'],
  serial: headers['wechatpay-serial'],
  nonce: headers['wechatpay-nonce'],
  timestamp: headers['wechatpay-timestamp'],
};

const ret = await pay.verifySign(params);

console.log('验签结果(bool类型)：' + ret);

return ret;
```
