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

const res = await pay.transfer_bills({
    transfer_scene_id: '1000',
    out_bill_no: generateOrderCode(32),
    transfer_amount: 100,
    transfer_remark: `活动主办方给你发了一红包`,
    openid: 'o-MYE42l80oelYMDE34nYD456Xoy',
    transfer_scene_report_infos: [
      {
        info_type: '活动名称',
        info_content: '新会员有礼',
      },
      {
        info_type: '奖励说明',
        info_content: '注册会员抽奖一等奖',
      },
    ],
  });
console.log(res);
```

```js
// 商户通过转账接口发起付款后，在用户确认收款之前可以通过该接口撤销付款
const res = await pay.transfer_cancel()
// 商家转账用户确认模式下，根据商户单号查询转账单的详细信息
const res = await pay.transfer_out_bill_no()
// 商家转账用户确认模式下，根据微信转账单号查询转账单的详细信息
const res = await pay.transfer_bill_no()
```