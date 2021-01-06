'use strict';
import crypto from 'crypto';
import request from 'superagent';

import {
  Ipay,
  Ih5,
  Inative,
  Ijsapi,
  Iquery1,
  Iquery2,
  Itradebill,
  Ifundflowbill,
} from './lib/interface';

class Pay {
  private appid: string; //  直连商户申请的公众号或移动应用appid。
  private mchid: string; // 商户号
  private serial_no: string; // 证书序列号
  private publicKey?: Buffer; // 公钥
  private privateKey?: Buffer; // 密钥
  private authType = 'WECHATPAY2-SHA256-RSA2048'; // 认证类型，目前为WECHATPAY2-SHA256-RSA2048
  /**
   * 构造器
   * @param appid 直连商户申请的公众号或移动应用appid。
   * @param mchid 商户号
   * @param serial_no  证书序列号
   * @param publicKey 公钥
   * @param privateKey 密钥
   * @param authType 认证类型，目前为WECHATPAY2-SHA256-RSA2048
   */
  public constructor(
    appid: string,
    mchid: string,
    serial_no: string,
    publicKey: Buffer,
    privateKey: Buffer,
    authType?: string
  );
  /**
   * 构造器
   * @param obj object类型 包括下面参数
   *
   * @param appid 直连商户申请的公众号或移动应用appid。
   * @param mchid 商户号
   * @param serial_no  证书序列号
   * @param publicKey 公钥
   * @param privateKey 密钥
   * @param authType 认证类型，目前为WECHATPAY2-SHA256-RSA2048
   */
  public constructor(obj: Ipay);
  constructor(
    arg1: Ipay | string,
    mchid?: string,
    serial_no?: string,
    publicKey?: Buffer,
    privateKey?: Buffer,
    authType?: string
  ) {
    if (arg1 instanceof Object) {
      this.appid = arg1.appid;
      this.mchid = arg1.mchid;
      this.serial_no = arg1.serial_no;
      this.publicKey = arg1.publicKey;
      this.privateKey = arg1.privateKey;
      this.authType = arg1.authType || 'WECHATPAY2-SHA256-RSA2048';
    } else {
      this.appid = arg1;
      this.mchid = mchid || '';
      this.serial_no = serial_no || '';
      this.publicKey = publicKey;
      this.privateKey = privateKey;
      this.authType = authType || 'WECHATPAY2-SHA256-RSA2048';
    }
  }
  /**
   * 构建请求签名参数
   * @param method Http 请求方式
   * @param url 请求接口 例如/v3/certificates
   * @param timestamp 获取发起请求时的系统当前时间戳
   * @param nonceStr 随机字符串
   * @param body 请求报文主体
   */
  public getSignature(
    method: string,
    nonce_str: string,
    timestamp: string,
    url: string,
    body?: string | object
  ): string {
    let str = method + '\n' + url + '\n' + timestamp + '\n' + nonce_str + '\n';
    if (body && body instanceof Object) body = JSON.stringify(body);
    if (body) str = str + body + '\n';
    if (method === 'GET') str = str + '\n';
    return this.sha256WithRsa(str);
  }
  // jsapi 和 app 支付参数签名
  private sign(params: any) {
    let str = '';
    for (const key in params) {
      if (!(key === 'signType' || key === 'paySign' || key === 'status')) {
        str = str + params[key] + '\n';
      }
    }
    console.log(str);
    return this.sha256WithRsa(str);
  }
  /**
   * SHA256withRSA
   * @param data 待加密字符
   * @param privatekey 私钥key  key.pem   fs.readFileSync(keyPath)
   */
  public sha256WithRsa(data: string): string {
    if (!this.privateKey) throw new Error('缺少秘钥文件');
    return crypto.createSign('RSA-SHA256').update(data).sign(this.privateKey, 'base64');
  }
  /**
   * 获取授权认证信息
   * @param nonceStr  请求随机串
   * @param timestamp 时间戳
   * @param signature 签名值
   */
  public getAuthorization(nonce_str: string, timestamp: string, signature: string): string {
    const _authorization =
      'mchid="' +
      this.mchid +
      '",' +
      'nonce_str="' +
      nonce_str +
      '",' +
      'timestamp="' +
      timestamp +
      '",' +
      'serial_no="' +
      this.serial_no +
      '",' +
      'signature="' +
      signature +
      '"';
    return this.authType.concat(' ').concat(_authorization);
  }
  /**
   * 参数初始化
   */
  private init(method: string, url: string, params?: object) {
    const nonce_str = Math.random().toString(36).substr(2, 15),
      timestamp = parseInt(+new Date() / 1000 + '').toString();

    const signature = this.getSignature(
      method,
      nonce_str,
      timestamp,
      url.replace('https://api.mch.weixin.qq.com', ''),
      params
    );
    const authorization = this.getAuthorization(nonce_str, timestamp, signature);
    return authorization;
  }
  /**
   * post 请求
   * @param url  请求接口
   * @param params 请求参数
   */
  private async postRequest(url: string, params: object, authorization: string): Promise<object> {
    try {
      const result = await request.post(url).send(params).set({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        Authorization: authorization,
      });
      return {
        status: result.status,
        ...result.body,
      };
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: error.status,
        ...(err.response.text && JSON.parse(err.response.text)),
      };
    }
  }
  /**
   * get 请求
   * @param url  请求接口
   * @param params 请求参数
   */
  private async getRequest(url: string, authorization: string): Promise<object> {
    try {
      const result = await request.get(url).set({
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        Authorization: authorization,
      });

      let data = {};
      switch (result.type) {
        case 'application/json':
          data = {
            status: result.status,
            ...result.body,
          };
          break;
        case 'text/plain':
          data = {
            status: result.status,
            data: result.text,
          };
          break;
        case 'application/x-gzip':
          data = {
            status: result.status,
            data: result.body,
          };
          break;
        default:
          data = {
            status: result.status,
            ...result.body,
          };
      }
      return data;
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: error.status,
        ...(err.response.text && JSON.parse(err.response.text)),
      };
    }
  }
  // ---------------支付相关接口--------------//
  /**
   * h5支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml
   */
  public async transactions_h5(params: Ih5): Promise<object> {
    // 请求参数
    const _params = {
      appid: this.appid,
      mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/h5';

    const authorization = this.init('POST', url, _params);

    return await this.postRequest(url, _params, authorization);
  }
  /**
   * native支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_4_1.shtml
   */
  public async transactions_native(params: Inative): Promise<object> {
    // 请求参数
    const _params = {
      appid: this.appid,
      mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native';

    const authorization = this.init('POST', url, _params);

    return await this.postRequest(url, _params, authorization);
  }
  /**
   * JSAPI支付 或者 小程序支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_4.shtml
   */
  public async transactions_jsapi(params: Ijsapi): Promise<object> {
    // 请求参数
    const _params = {
      appid: this.appid,
      mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';

    const authorization = this.init('POST', url, _params);

    const result: any = await this.postRequest(url, _params, authorization);
    if (result.status === 200 && result.prepay_id) {
      const data = {
        status: result.status,
        appId: this.appid,
        timeStamp: parseInt(+new Date() / 1000 + '').toString(),
        nonceStr: Math.random().toString(36).substr(2, 15),
        package: `prepay_id=${result.prepay_id}`,
        signType: 'RSA',
        paySign: '',
      };
      data.paySign = this.sign(data);
      return data;
    }
    return result;
  }
  /**
   * 查询订单
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_2.shtml
   */
  public async query(params: Iquery1 | Iquery2): Promise<object> {
    let url = '';
    if (params.transaction_id) {
      url = `https://api.mch.weixin.qq.com/v3/pay/transactions/id/${params.transaction_id}?mchid=${this.mchid}`;
    } else if (params.out_trade_no) {
      url = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${params.out_trade_no}?mchid=${this.mchid}`;
    } else {
      throw new Error('缺少transaction_id或者out_trade_no');
    }

    const authorization = this.init('GET', url);
    return await this.getRequest(url, authorization);
  }
  /**
   * 关闭订单
   * @param out_trade_no 请求参数 商户订单号 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_3.shtml
   */
  public async close(out_trade_no: string): Promise<object> {
    if (!out_trade_no) throw new Error('缺少out_trade_no');

    // 请求参数
    const _params = {
      mchid: this.mchid,
    };
    const url = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${out_trade_no}/close`;
    const authorization = this.init('POST', url, _params);

    return await this.postRequest(url, _params, authorization);
  }
  /**
   * 申请交易账单
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_6.shtml
   */
  public async tradebill(params: Itradebill): Promise<object> {
    let url = 'https://api.mch.weixin.qq.com/v3/bill/tradebill';
    const _params: any = {
      ...params,
    };
    const querystring = Object.keys(_params)
      .filter(function (key) {
        return !!_params[key];
      })
      .sort()
      .map(function (key) {
        return key + '=' + _params[key]; // 中文需要转码
      })
      .join('&');
    url = url + `?${querystring}`;
    const authorization = this.init('GET', url);
    return await this.getRequest(url, authorization);
  }
  /**
   * 申请资金账单
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_7.shtml
   */
  public async fundflowbill(params: Ifundflowbill): Promise<object> {
    let url = 'https://api.mch.weixin.qq.com/v3/bill/fundflowbill';
    const _params: any = {
      ...params,
    };
    const querystring = Object.keys(_params)
      .filter(function (key) {
        return !!_params[key];
      })
      .sort()
      .map(function (key) {
        return key + '=' + _params[key]; // 中文需要转码
      })
      .join('&');
    url = url + `?${querystring}`;
    const authorization = this.init('GET', url);
    return await this.getRequest(url, authorization);
  }
  /**
   * 下载账单
   * @param download_url 请求参数 路径 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_8.shtml
   */
  public async downloadbill(download_url: string) {
    const authorization = this.init('GET', download_url);
    return await this.getRequest(download_url, authorization);
  }
}

export = Pay;
