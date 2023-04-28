## 请求分账
```ts
// 使用的同学可以自己增加定时器去维护这个微信平台公钥证书
  // 使用最新的平台证书（即：证书启用时间较晚的证书）
  const certificates = await pay.get_certificates('APIv3密钥');
  // 我这里取最后一个
  const certificate = certificates.pop();

  const res = await pay.create_profitsharing_orders({
    transaction_id: '4208450740201411110007820472',
    out_order_no: 'P20150806125346',
    receivers: [
      {
        type: 'MERCHANT_ID',
        account: '86693852',
        name: pay.publicEncrypt('张三', certificate.publicKey),
        amount: 888,
        description: '分给商户A',
      },
    ],
    unfreeze_unsplit: true,
    wx_serial_no: certificate.serial_no, // 当你需要传name时 需要传当前参数
  });
```

## 查询分账结果

```ts
  const res = await pay.query_profitsharing_orders('4208450740201411110007820472', 'P20150806125346');
  // https://api.mch.weixin.qq.com/v3/profitsharing/orders/P20150806125346?transaction_id=4208450740201411110007820472
```

## 请求分账回退API

```ts
 const res = await pay.profitsharing_return_orders(...)
```

## 查询分账回退结果API

```ts
 const res = await pay.query_profitsharing_return_orders(...)
```

## 解冻剩余资金API

```ts
 const res = await pay.profitsharing_orders_unfreeze(...)
```

## 查询剩余待分金额API

```ts
 const res = await pay.query_profitsharing_amounts(...)
```

## 添加分账接收方API

```ts
// 使用的同学可以自己增加定时器去维护这个微信平台公钥证书
  // 使用最新的平台证书（即：证书启用时间较晚的证书）
  const certificates = await pay.get_certificates('APIv3密钥');
  // 我这里取最后一个
  const certificate = certificates.pop();

  const res = await pay.profitsharing_receivers_add({
    appid: 'wx8888888888888888',
    type: 'MERCHANT_ID',
    account: '86693852',
    name: pay.publicEncrypt('张三', certificate.publicKey),
    relation_type: 'STORE',
    custom_relation: '代理商',
  });
```

## 添加分账接收方API

```ts
 const res = await pay.profitsharing_receivers_delete(...)
```

## 分账动账通知API

[参考回调解签](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_h5.md)

```ts
const result = pay.decipher_gcm(ciphertext, associated_data, nonce, key);
```

## 申请分账账单API

```ts
 const res = await pay.profitsharing_bills(...)
```

## 下载账单API

[参考下载账单](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/downloadbill.md)

```ts
const data = await pay.downloadbill(download_url);
```