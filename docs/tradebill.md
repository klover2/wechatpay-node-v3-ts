## 申请交易账单
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
const result: any = await pay.tradebill({
    bill_date: '2020-11-11',
    bill_type: 'ALL',
  });
  console.log(result);
#   {
#     status: 200,
#     download_url: 'https://api.mch.weixin.qq.com/v3/billdownload/file?token=oMmUqPjv_pgVEbq41QjzZawTaL_HQeJu54e91h4q-Sq',
#     hash_type: 'SHA1',
#     hash_value: '8d185400ac11439e7352294bed99be36c621878c'
#   }
```