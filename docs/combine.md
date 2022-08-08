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
## 合单h5
```bash
  const params = {
    combine_out_trade_no: '主订单号',
    scene_info: {
      payer_client_ip: 'ip',
      device_id: '1',
      h5_info: {
        type: 'Wap',
        app_name: '网页名称 例如 百度',
        app_url: '网页域名 例如 https://www.baidu.com',
      },
    },
    sub_orders: [
      {
        mchid: '商户ID',
        amount: {
          total_amount: 1,
          currency: 'CNY',
        },
        out_trade_no: '子订单号',
        description: '测试1',
        attach: '测试',
      },
    ],
    notify_url: '回调url',
  };
  const result = await pay.combine_transactions_h5(params);
  console.log(result);
```

## 查询订单
```bash
const result = await pay.combine_query(combine_out_trade_no);
console.log(result);
```

## 关闭订单
```bash
 const result = await pay.combine_close(combine_out_trade_no, [
    {
      mchid: '商户号',
      out_trade_no: '子订单号',
    },
  ]);

  console.log(result);
```