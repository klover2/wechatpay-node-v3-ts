## h5 支付
```bash
import WxPay from 'wechatpay-node-v3';
import fs from 'fs';
import request from 'superagent';

const pay = new WxPay({
  appid: '直连商户申请的公众号或移动应用appid',
  mchid: '商户号',
  serial_no: '证书序列号',
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
      h5_info: {
        type: 'Wap',
        app_name: '网页名称 例如 百度',
        app_url: '网页域名 例如 https://www.baidu.com',
      },
    },
  };
  console.log(params);
  const result = await pay.transactions_h5(params);
  console.log(result);
  # 返回
  # {
  # status: 200,
  # h5_url: 'https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=wx051840206120147833cf4bcfcef12b0000&package=2056162962'
  # }
```

## 回调解密
```bash
# key 用商户平台上设置的APIv3密钥【微信商户平台—>账户设置—>API安全—>设置APIv3密钥】，记为key；
const result = pay.decipher_gcm(ciphertext, associated_data, nonce, key);
# 返回
# {
#   mchid: '商户号',
#   appid: 'appid',
#   out_trade_no: '1610419296553',
#   transaction_id: '4200000848202101120290526543',
#   trade_type: 'NATIVE',
#   trade_state: 'SUCCESS',
#   trade_state_desc: '支付成功',
#   bank_type: 'OTHERS',
#   attach: '',
#   success_time: '2021-01-12T10:43:43+08:00',
#   payer: { openid: '' },
#   amount: { total: 1, payer_total: 1, currency: 'CNY', payer_currency: 'CNY' }
# }
```