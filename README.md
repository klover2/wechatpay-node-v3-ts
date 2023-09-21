

<p style="text-align: center;">
  <h1 align="center"><a href="javascript:void(0);">wechatpay-node-v3</a></h1>
</p>

[![OSCS Status](https://www.oscs1024.com/platform/badge/klover2/wechatpay-node-v3-ts.svg?size=small)](https://www.oscs1024.com/project/klover2/wechatpay-node-v3-ts?ref=badge_small)
[![npm version](https://badgen.net/npm/v/wechatpay-node-v3)](https://www.npmjs.com/package/wechatpay-node-v3)
[![npm downloads](https://badgen.net/npm/dm/wechatpay-node-v3)](https://www.npmjs.com/package/wechatpay-node-v3)
[![contributors](https://img.shields.io/github/contributors/klover2/wechatpay-node-v3-ts)](https://github.com/klover2/wechatpay-node-v3-ts/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# 微信支付v3 支持在ts和js中使用

## 欢迎大家加入一起完善这个api
## 前言
微信官方在2020-12-25正式开放了[v3](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)版本的接口,相比较旧版本[v2](https://pay.weixin.qq.com/wiki/doc/api/index.html)有了不少改变,例如：
* 遵循统一的Restful的设计风格
* 使用JSON作为数据交互的格式，不再使用XML
* 使用基于非对称密钥的SHA256-RSA的数字签名算法，不再使用MD5或HMAC-SHA256
* 不再要求HTTPS客户端证书
* 使用AES-256-GCM，对回调中的关键信息进行加密保护

由于官方文档只支持java和php,所以我在这里使用ts简单的封装了一个版本,支持在js或者ts中使用,后续会更加完善这个npm包，谢谢。

## 使用
`yarn add wechatpay-node-v3`(也可以用npm)

```bash
import WxPay from 'wechatpay-node-v3'; // 支持使用require
import fs from 'fs';
import request from 'superagent';

const pay = new WxPay({
  appid: '直连商户申请的公众号或移动应用appid',
  mchid: '商户号',
  publicKey: fs.readFileSync('./apiclient_cert.pem'), // 公钥
  privateKey: fs.readFileSync('./apiclient_key.pem'), // 秘钥
});

# 这里以h5支付为例
try {
    # 参数介绍请看h5支付文档 https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml
    const params = {
      appid: '直连商户申请的公众号或移动应用appid',
      mchid: '商户号',
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
    const nonce_str = Math.random().toString(36).substr(2, 15), // 随机字符串
      timestamp = parseInt(+new Date() / 1000 + '').toString(), // 时间戳 秒
      url = '/v3/pay/transactions/h5';

    # 获取签名
    const signature = pay.getSignature('POST', nonce_str, timestamp, url, params); # 如果是get 请求 则不需要params 参数拼接在url上 例如 /v3/pay/transactions/id/12177525012014?mchid=1230000109
    # 获取头部authorization 参数
    const authorization = pay.getAuthorization(nonce_str, timestamp, signature);

    const result = await request
      .post('https://api.mch.weixin.qq.com/v3/pay/transactions/h5')
      .send(params)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        Authorization: authorization,
      });

    console.log('result==========>', result.body);
  } catch (error) {
    console.log(error);
  }
```
如果你使用的是nest框架，请结合`nest-wechatpay-node-v3`一起使用。

## WxPay 介绍
`import WxPay from 'wechatpay-node-v3';` 或者 `const WxPay = require('wechatpay-node-v3')`

参数介绍
|参数名称  |参数介绍  |是否必须|
|--|--|--|
|  appid|   直连商户申请的公众号或移动应用appid|是|
|mchid|商户号|是
|serial_no|证书序列号|否|
|publicKey|公钥|是|
|privateKey|密钥|是|
|authType|认证类型，目前为WECHATPAY2-SHA256-RSA2048|否|
|userAgent|自定义User-Agent|否|
|key|APIv3密钥|否 有验证回调必须|

## 注意
1. serial_no是证书序列号 请在命令窗口使用 `openssl x509 -in apiclient_cert.pem -noout -serial` 获取
2. 头部参数需要添加 User-Agent 参数
3. 需要在商户平台设置APIv3密钥才会有回调，详情参看文档指引http://kf.qq.com/faq/180830E36vyQ180830AZFZvu.html

## 使用介绍
以下函数是我针对微信相关接口进行进一步封装，可以直接使用。
| api名称 | 函数名 |
|--|--|
| [h5支付](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml) |[transactions_h5](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_h5.md)  |
| [native支付](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_4_1.shtml) |[transactions_native](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_native.md)  |
| [app支付](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_1.shtml) |[transactions_app](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_app.md)  |
| [JSAPI支付 或者 小程序支付](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml) |[transactions_jsapi](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_jsapi.md)  |
| [查询订单](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml) |[query](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/query.md)  |
| [关闭订单](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml) |[close](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/close.md)  |
| [申请交易账单](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_6.shtml) |[tradebill](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/tradebill.md)  |
| [申请资金账单](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_7.shtml) |[fundflowbill](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/fundflowbill.md)  |
| [下载账单](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_8.shtml) |[downloadbill](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/downloadbill.md)  |
| [回调解密](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_5.shtml) |[decipher_gcm](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_h5.md)  |
|[合单h5支付](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_2.shtml)|[combine_transactions_h5](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/combine.md)|
|[合单native支付](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_5.shtml)|[combine_transactions_native](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/combine.md)|
|[合单app支付](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_1.shtml)|[combine_transactions_app](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/combine.md)|
|[合单JSAPI支付 或者 小程序支付](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_3.shtml)|[combine_transactions_jsapi](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/combine.md)|
|[查询合单](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_11.shtml)|[combine_query](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/combine.md)|
|[关闭合单](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_12.shtml)|[combine_close](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/combine.md)|
|[获取序列号]()|[getSN](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_h5.md)|
|[申请退款](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_9.shtml)|[refunds](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_h5.md)|
|[查询退款](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_10.shtml)|[find_refunds](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/transactions_h5.md)|
|[签名验证](https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_1.shtml)|[verifySign](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/verifySign.md)|
|[微信提现到零钱](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter4_3_1.shtml)|[batches_transfer](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/batches_transfer.md)|
|[分账](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_1.shtml)|[create_profitsharing_orders](https://github.com/klover2/wechatpay-node-v3-ts/blob/master/docs/profitsharing.md)|



## 版本介绍
| 版本号 | 版本介绍 |
|--|--|
| v0.0.1 | 仅支持签名和获取头部参数Authorization |
|v1.0.0|增加了支付(不包括合单支付)、查询订单、关闭订单、申请交易账单、申请资金账单、下载账单|
|v1.2.0|增加了回调解密，合单支付、合单关闭、合单查询|
|v1.2.1|修改app、jsapi、native支付字段scene_info 改为可选|
|v1.2.2|增加获取序列号方法|
|v1.2.3|修改小程序支付签名错误和取消serial_no字段必填|
|v1.3.0|增加普通订单的退款和查询|
|v1.3.1|修复APP调起支付时出现“支付验证签名失败“的问题|
|v1.3.2|增加请求成功后的签名验证|
|v1.3.3|修复superagent post请求异常 Z_DATA_ERROR|
|v1.3.4|修复superagent get请求异常 Z_DATA_ERROR|
|v1.3.5|修复APP支付签名错误|
|v2.0.0|增加提现到零钱和优化接口参数，规定返回参数格式，其他接口会后续优化|
|v2.0.1|增加请求头Wechatpay-Serial和完善转账其他接口|
|v2.0.2|增加敏感信息加密方法(publicEncrypt)|
|v2.0.3|修复get请求无参时的签名|
|v2.0.4|修复敏感信息加密方法(publicEncrypt)使用微信平台公钥|
|v2.0.6|修复发起商家转账零钱参数wx_serial_no(自定义参数，即http请求头Wechatpay-Serial的值)为可选参数|
|v2.1.0|升级superagent依赖6.1.0到8.0.6|
|v2.1.1|商家转账API支持场景参数|
|v2.1.2|基础支付接口支持传appid|
|v2.1.3|支持分账相关接口|
|v2.1.4|修复错误原因存在空值bug|
|v2.1.5|修复动态 appid 签名错误|
|v2.1.6|Native下单API支持support_fapiao字段|

## 文档
[v2支付文档](https://pay.weixin.qq.com/wiki/doc/api/index.html)
[v3支付文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)


## 贡献
<a href="https://github.com/klover2/wechatpay-node-v3-ts/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=klover2/wechatpay-node-v3-ts" />
</a>

欢迎提[存在的Bug或者意见](https://github.com/klover2/wechatpay-node-v3-ts/issues)。



