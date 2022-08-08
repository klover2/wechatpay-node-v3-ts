## 申请资金账单
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
const result = await pay.fundflowbill({
    bill_date: '2020-11-11',
    account_type: 'BASIC',
  });
  console.log(result);
#   {
#     status: 200,
#     download_url: 'https://api.mch.weixin.qq.com/v3/billdownload/file?token=VThw-I-E1f2yVLIAzsYPKnkmoyR9f3oYZ',
#     hash_type: 'SHA1',
#     hash_value: '5f424569fc2adc7ee06531ec796b7bb9457df004'
#   }
```