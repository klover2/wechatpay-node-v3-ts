## 微信提现到零钱
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
```js
// 使用的同学可以自己增加定时器去维护这个微信平台公钥证书
// 使用最新的平台证书（即：证书启用时间较晚的证书）
const certificates = await pay.get_certificates("APIv3密钥");
// 我这里取最后一个 
const certificate = certificates.pop();

const res = await pay.batches_transfer({
    out_batch_no: 'plfk2020042013',
    batch_name: '2019年1月深圳分部报销单',
    batch_remark: '2019年1月深圳分部报销单',
    total_amount: 4000000,
    total_num: 200,
    wx_serial_no: certificate.serial_no, // 当你需要传user_name时 需要传当前参数
    transfer_detail_list: [
      {
        out_detail_no: 'x23zy545Bd5436',
        transfer_amount: 200000,
        transfer_remark: '2020年4月报销',
        openid: 'o-MYE42l80oelYMDE34nYD456Xoy',
        user_name: pay.publicEncrypt('张三', Buffer.from(certificate.publicKey)),
      }
    ],
  });
console.log(res);
```

```js
// 微信批次单号查询批次单API
const res = await pay.query_batches_transfer_list_wx()
// 微信明细单号查询明细单API
const res = await pay.query_batches_transfer_detail_wx()
// 商家批次单号查询批次单API
const res = await pay.query_batches_transfer_list()
// 商家明细单号查询明细单API
const res = await pay.query_batches_transfer_detail()
```