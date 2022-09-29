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
const res = await pay.batches_transfer({
    out_batch_no: 'plfk2020042013',
    batch_name: '2019年1月深圳分部报销单',
    batch_remark: '2019年1月深圳分部报销单',
    total_amount: 4000000,
    total_num: 200,
    transfer_detail_list: [
      {
        out_detail_no: 'x23zy545Bd5436',
        transfer_amount: 200000,
        transfer_remark: '2020年4月报销',
        openid: 'o-MYE42l80oelYMDE34nYD456Xoy',
        user_name: '757b340b45ebef5467rter35gf464344v3542sdf4t6re4tb4f54ty45t4yyry45',
      },
    ],
  });
  console.log(result);
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