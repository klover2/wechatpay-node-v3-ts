'use strict';
import crypto from 'crypto';
const x509_1 = require('@fidm/x509');

import {
  Ipay,
  Ih5,
  Inative,
  Ijsapi,
  Iquery1,
  Iquery2,
  Itradebill,
  Ifundflowbill,
  Iapp,
  Ioptions,
  Irefunds1,
  Irefunds2,
  ICertificates,
} from './lib/interface';
import { IcombineH5, IcombineNative, IcombineApp, IcombineJsapi, IcloseSubOrders } from './lib/combine_interface';
import { BatchesTransfer, FindRefunds, ProfitSharing, Refunds, UploadImages } from './lib/interface-v2';
import { Base } from './lib/base';
import { IPayRequest } from './lib/pay-request.interface';
import { PayRequest } from './lib/pay-request';

class Pay extends Base {
  protected appid: string; //  直连商户申请的公众号或移动应用appid。
  protected mchid: string; // 商户号
  protected serial_no = ''; // 证书序列号
  protected publicKey?: Buffer; // 公钥
  protected privateKey?: Buffer; // 密钥
  protected authType = 'WECHATPAY2-SHA256-RSA2048'; // 认证类型，目前为WECHATPAY2-SHA256-RSA2048
  protected httpService: IPayRequest;

  protected key?: string; // APIv3密钥
  protected static certificates: { [key in string]: string } = {}; // 微信平台证书 key 是 serialNo, value 是 publicKey
  /**
   * 构造器
   * @param appid 直连商户申请的公众号或移动应用appid。
   * @param mchid 商户号
   * @param publicKey 公钥
   * @param privateKey 密钥
   * @param options 可选参数 object 包括下面参数
   *
   * @param serial_no  证书序列号
   * @param authType 可选参数 认证类型，目前为WECHATPAY2-SHA256-RSA2048
   * @param userAgent 可选参数 User-Agent
   * @param key 可选参数 APIv3密钥
   */
  public constructor(appid: string, mchid: string, publicKey: Buffer, privateKey: Buffer, options?: Ioptions);
  /**
   * 构造器
   * @param obj object类型 包括下面参数
   *
   * @param appid 直连商户申请的公众号或移动应用appid。
   * @param mchid 商户号
   * @param serial_no  可选参数 证书序列号
   * @param publicKey 公钥
   * @param privateKey 密钥
   * @param authType 可选参数 认证类型，目前为WECHATPAY2-SHA256-RSA2048
   * @param userAgent 可选参数 User-Agent
   * @param key 可选参数 APIv3密钥
   */
  public constructor(obj: Ipay);
  public constructor(arg1: Ipay | string, mchid?: string, publicKey?: Buffer, privateKey?: Buffer, options?: Ioptions) {
    super();

    if (arg1 instanceof Object) {
      this.appid = arg1.appid;
      this.mchid = arg1.mchid;
      if (arg1.serial_no) this.serial_no = arg1.serial_no;
      this.publicKey = arg1.publicKey;
      if (!this.publicKey) throw new Error('缺少公钥');
      this.privateKey = arg1.privateKey;
      if (!arg1.serial_no) this.serial_no = this.getSN(this.publicKey);

      this.authType = arg1.authType || 'WECHATPAY2-SHA256-RSA2048';
      this.userAgent = arg1.userAgent || '127.0.0.1';
      this.key = arg1.key;
    } else {
      const _optipns = options || {};
      this.appid = arg1;
      this.mchid = mchid || '';
      this.publicKey = publicKey;
      this.privateKey = privateKey;

      this.authType = _optipns.authType || 'WECHATPAY2-SHA256-RSA2048';
      this.userAgent = _optipns.userAgent || '127.0.0.1';
      this.key = _optipns.key;
      this.serial_no = _optipns.serial_no || '';
      if (!this.publicKey) throw new Error('缺少公钥');
      if (!this.serial_no) this.serial_no = this.getSN(this.publicKey);
    }

    this.httpService = new PayRequest();
  }
  /**
   * 自定义创建http 请求
   */
  public createHttp(service: IPayRequest) {
    this.httpService = service;
  }
  /**
   * 获取微信平台key
   * @param apiSecret APIv3密钥
   * @returns
   */
  public async get_certificates(apiSecret: string): Promise<ICertificates[]> {
    const url = 'https://api.mch.weixin.qq.com/v3/certificates';
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);

    const result = await this.httpService.get(url, headers);

    if (result.status === 200) {
      const data = result?.data?.data as ICertificates[];

      for (const item of data) {
        const decryptCertificate = this.decipher_gcm<string>(
          item.encrypt_certificate.ciphertext,
          item.encrypt_certificate.associated_data,
          item.encrypt_certificate.nonce,
          apiSecret,
        );
        item.publicKey = x509_1.Certificate.fromPEM(Buffer.from(decryptCertificate)).publicKey.toPEM();
      }

      return data;
    } else {
      throw new Error('拉取平台证书失败');
    }
  }
  /**
   * 拉取平台证书到 Pay.certificates 中
   * @param apiSecret APIv3密钥
   * https://pay.weixin.qq.com/wiki/doc/apiv3/apis/wechatpay5_1.shtml
   */
  private async fetchCertificates(apiSecret = this.key) {
    const url = 'https://api.mch.weixin.qq.com/v3/certificates';
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    const result = await this.httpService.get(url, headers);

    if (result.status === 200) {
      const data = result?.data?.data as {
        effective_time: string;
        expire_time: string;
        serial_no: string;
        encrypt_certificate: {
          algorithm: string;
          associated_data: string;
          ciphertext: string;
          nonce: string;
        };
      }[];

      const newCertificates = {} as { [key in string]: string };

      data.forEach(item => {
        const decryptCertificate = this.decipher_gcm<string>(
          item.encrypt_certificate.ciphertext,
          item.encrypt_certificate.associated_data,
          item.encrypt_certificate.nonce,
          apiSecret,
        );

        newCertificates[item.serial_no] = x509_1.Certificate.fromPEM(Buffer.from(decryptCertificate)).publicKey.toPEM();
      });

      Pay.certificates = {
        ...Pay.certificates,
        ...newCertificates,
      };
    } else {
      throw new Error('拉取平台证书失败');
    }
  }
  /**
   * 验证签名，提醒：node 取头部信息时需要用小写，例如：req.headers['wechatpay-timestamp']
   * @param params.timestamp HTTP头Wechatpay-Timestamp 中的应答时间戳
   * @param params.nonce HTTP头Wechatpay-Nonce 中的应答随机串
   * @param params.body 应答主体（response Body），需要按照接口返回的顺序进行验签，错误的顺序将导致验签失败。
   * @param params.serial HTTP头Wechatpay-Serial 证书序列号
   * @param params.signature HTTP头Wechatpay-Signature 签名
   * @param params.apiSecret APIv3密钥，如果在 构造器 中有初始化该值(this.key)，则可以不传入。当然传入也可以
   */
  public async verifySign(params: {
    timestamp: string | number;
    nonce: string;
    body: Record<string, any> | string;
    serial: string;
    signature: string;
    apiSecret?: string;
  }) {
    const { timestamp, nonce, body, serial, signature, apiSecret = this.key } = params;

    let publicKey = Pay.certificates[serial];

    if (!publicKey) {
      await this.fetchCertificates(apiSecret);
    }

    publicKey = Pay.certificates[serial];

    if (!publicKey) {
      throw new Error('平台证书序列号不相符，未找到平台序列号');
    }

    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const data = `${timestamp}\n${nonce}\n${bodyStr}\n`;
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);

    return verify.verify(publicKey, signature, 'base64');
  }
  /**
   * 敏感信息加密
   * @param str 敏感信息字段（如用户的住址、银行卡号、手机号码等）
   * @returns
   */
  public publicEncrypt(str: string, wxPublicKey: Buffer, padding = crypto.constants.RSA_PKCS1_OAEP_PADDING) {
    if (![crypto.constants.RSA_PKCS1_PADDING, crypto.constants.RSA_PKCS1_OAEP_PADDING].includes(padding)) {
      throw new Error(`Doesn't supported the padding mode(${padding}), here's only support RSA_PKCS1_OAEP_PADDING or RSA_PKCS1_PADDING.`);
    }
    const encrypted = crypto.publicEncrypt({ key: wxPublicKey, padding, oaepHash: 'sha1' }, Buffer.from(str, 'utf8')).toString('base64');
    return encrypted;
  }
  /**
   * 敏感信息解密
   * @param str 敏感信息字段（如用户的住址、银行卡号、手机号码等）
   * @returns
   */
  public privateDecrypt(str: string, padding = crypto.constants.RSA_PKCS1_OAEP_PADDING) {
    if (![crypto.constants.RSA_PKCS1_PADDING, crypto.constants.RSA_PKCS1_OAEP_PADDING].includes(padding)) {
      throw new Error(`Doesn't supported the padding mode(${padding}), here's only support RSA_PKCS1_OAEP_PADDING or RSA_PKCS1_PADDING.`);
    }
    const decrypted = crypto.privateDecrypt({ key: this.privateKey as Buffer, padding, oaepHash: 'sha1' }, Buffer.from(str, 'base64'));
    return decrypted.toString('utf8');
  }
  /**
   * 构建请求签名参数
   * @param method Http 请求方式
   * @param url 请求接口 例如/v3/certificates
   * @param timestamp 获取发起请求时的系统当前时间戳
   * @param nonceStr 随机字符串
   * @param body 请求报文主体
   */
  public getSignature(method: string, nonce_str: string, timestamp: string, url: string, body?: string | Record<string, any>): string {
    let str = method + '\n' + url + '\n' + timestamp + '\n' + nonce_str + '\n';
    if (body && body instanceof Object) body = JSON.stringify(body);
    if (body) str = str + body + '\n';
    if (method === 'GET') str = str + '\n';
    return this.sha256WithRsa(str);
  }
  // jsapi 和 app 支付参数签名 加密自动顺序如下 不能错乱
  // 应用id
  // 时间戳
  // 随机字符串
  // 预支付交易会话ID
  protected sign(str: string) {
    return this.sha256WithRsa(str);
  }
  // 获取序列号
  public getSN(fileData?: string | Buffer): string {
    if (!fileData && !this.publicKey) throw new Error('缺少公钥');
    if (!fileData) fileData = this.publicKey;
    if (typeof fileData == 'string') {
      fileData = Buffer.from(fileData);
    }

    const certificate = x509_1.Certificate.fromPEM(fileData);
    return certificate.serialNumber;
  }
  /**
   * SHA256withRSA
   * @param data 待加密字符
   * @param privatekey 私钥key  key.pem   fs.readFileSync(keyPath)
   */
  public sha256WithRsa(data: string): string {
    if (!this.privateKey) throw new Error('缺少秘钥文件');
    return crypto
      .createSign('RSA-SHA256')
      .update(data)
      .sign(this.privateKey, 'base64');
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
   * 回调解密
   * @param ciphertext  Base64编码后的开启/停用结果数据密文
   * @param associated_data 附加数据
   * @param nonce 加密使用的随机串
   * @param key  APIv3密钥
   */
  public decipher_gcm<T extends any>(ciphertext: string, associated_data: string, nonce: string, key?: string): T {
    if (!key) key = this.key;
    if (!key) throw new Error('缺少key');

    const _ciphertext = Buffer.from(ciphertext, 'base64');

    // 解密 ciphertext字符  AEAD_AES_256_GCM算法
    const authTag: any = _ciphertext.slice(_ciphertext.length - 16);
    const data = _ciphertext.slice(0, _ciphertext.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associated_data));
    const decoded = decipher.update(data, undefined, 'utf8');

    try {
      return JSON.parse(decoded);
    } catch (e) {
      return decoded as T;
    }
  }
  /**
   * 参数初始化
   */
  protected buildAuthorization(method: string, url: string, params?: Record<string, any>) {
    const nonce_str = Math.random()
        .toString(36)
        .substr(2, 15),
      timestamp = parseInt(+new Date() / 1000 + '').toString();

    const signature = this.getSignature(method, nonce_str, timestamp, url.replace('https://api.mch.weixin.qq.com', ''), params);
    const authorization = this.getAuthorization(nonce_str, timestamp, signature);
    return authorization;
  }
  //#region 支付相关接口
  /**
   * h5支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml
   */
  public async transactions_h5(params: Ih5) {
    // 请求参数
    const _params = {
      appid: this.appid,
      mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/h5';

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 合单h5支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_2.shtml
   */
  public async combine_transactions_h5(params: IcombineH5) {
    // 请求参数
    const _params = {
      combine_appid: this.appid,
      combine_mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/combine-transactions/h5';

    const authorization = this.buildAuthorization('POST', url, _params);

    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });

    return await this.httpService.post(url, _params, headers);
  }
  /**
   * native支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_4_1.shtml
   */
  public async transactions_native(params: Inative) {
    // 请求参数
    const _params = {
      appid: this.appid,
      mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native';

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 合单native支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_5.shtml
   */
  public async combine_transactions_native(params: IcombineNative) {
    // 请求参数
    const _params = {
      combine_appid: this.appid,
      combine_mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/combine-transactions/native';

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * app支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_1.shtml
   */
  public async transactions_app(params: Iapp) {
    // 请求参数
    const _params = {
      appid: this.appid,
      mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/app';

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    const result = await this.httpService.post(url, _params, headers);
    if (result.status === 200 && result.data.prepay_id) {
      const data = {
        appid: _params.appid,
        partnerid: _params.mchid,
        package: 'Sign=WXPay',
        timestamp: parseInt(+new Date() / 1000 + '').toString(),
        noncestr: Math.random()
          .toString(36)
          .substr(2, 15),
        prepayid: result.data.prepay_id,
        sign: '',
      };
      const str = [data.appid, data.timestamp, data.noncestr, data.prepayid, ''].join('\n');
      data.sign = this.sign(str);
      result.data = data;
    }
    return result;
  }
  /**
   * 合单app支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_1.shtml
   */
  public async combine_transactions_app(params: IcombineApp) {
    // 请求参数
    const _params = {
      combine_appid: this.appid,
      combine_mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/combine-transactions/app';

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    const result = await this.httpService.post(url, _params, headers);
    if (result.status === 200 && result.data.prepay_id) {
      const data = {
        appid: _params.combine_appid,
        partnerid: _params.combine_mchid,
        package: 'Sign=WXPay',
        timestamp: parseInt(+new Date() / 1000 + '').toString(),
        noncestr: Math.random()
          .toString(36)
          .substr(2, 15),
        prepayid: result.data.prepay_id,
        sign: '',
      };
      const str = [data.appid, data.timestamp, data.noncestr, data.prepayid, ''].join('\n');
      data.sign = this.sign(str);
      result.data = data;
    }
    return result;
  }
  /**
   * JSAPI支付 或者 小程序支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
   */
  public async transactions_jsapi(params: Ijsapi) {
    // 请求参数
    const _params = {
      appid: this.appid,
      mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    const result = await this.httpService.post(url, _params, headers);
    if (result.status === 200 && result.data.prepay_id) {
      const data = {
        appId: _params.appid,
        timeStamp: parseInt(+new Date() / 1000 + '').toString(),
        nonceStr: Math.random()
          .toString(36)
          .substr(2, 15),
        package: `prepay_id=${result.data.prepay_id}`,
        signType: 'RSA',
        paySign: '',
      };
      const str = [data.appId, data.timeStamp, data.nonceStr, data.package, ''].join('\n');
      data.paySign = this.sign(str);
      result.data = data;
    }
    return result;
  }
  /**
   * 合单JSAPI支付 或者 小程序支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_3.shtml
   */
  public async combine_transactions_jsapi(params: IcombineJsapi) {
    // 请求参数
    const _params = {
      combine_appid: this.appid,
      combine_mchid: this.mchid,
      ...params,
    };
    const url = 'https://api.mch.weixin.qq.com/v3/combine-transactions/jsapi';

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    const result = await this.httpService.post(url, _params, headers);
    if (result.status === 200 && result.data.prepay_id) {
      const data = {
        appId: _params.combine_appid,
        timeStamp: parseInt(+new Date() / 1000 + '').toString(),
        nonceStr: Math.random()
          .toString(36)
          .substr(2, 15),
        package: `prepay_id=${result.data.prepay_id}`,
        signType: 'RSA',
        paySign: '',
      };
      const str = [data.appId, data.timeStamp, data.nonceStr, data.package, ''].join('\n');
      data.paySign = this.sign(str);
      result.data = data;
    }
    return result;
  }
  /**
   * 查询订单
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_2.shtml
   */
  public async query(params: Iquery1 | Iquery2) {
    let url = '';
    if (params.transaction_id) {
      url = `https://api.mch.weixin.qq.com/v3/pay/transactions/id/${params.transaction_id}?mchid=${this.mchid}`;
    } else if (params.out_trade_no) {
      url = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${params.out_trade_no}?mchid=${this.mchid}`;
    } else {
      throw new Error('缺少transaction_id或者out_trade_no');
    }

    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 合单查询订单
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_11.shtml
   */
  public async combine_query(combine_out_trade_no: string) {
    if (!combine_out_trade_no) throw new Error('缺少combine_out_trade_no');
    const url = `https://api.mch.weixin.qq.com/v3/combine-transactions/out-trade-no/${combine_out_trade_no}`;

    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 关闭订单
   * @param out_trade_no 请求参数 商户订单号 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_3.shtml
   */
  public async close(out_trade_no: string) {
    if (!out_trade_no) throw new Error('缺少out_trade_no');

    // 请求参数
    const _params = {
      mchid: this.mchid,
    };
    const url = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${out_trade_no}/close`;
    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 合单关闭订单
   * @param combine_out_trade_no 请求参数 总订单号 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter5_1_12.shtml
   * @param sub_orders array 子单信息
   */
  public async combine_close(combine_out_trade_no: string, sub_orders: IcloseSubOrders[]) {
    if (!combine_out_trade_no) throw new Error('缺少out_trade_no');

    // 请求参数
    const _params = {
      combine_appid: this.appid,
      sub_orders,
    };
    const url = `https://api.mch.weixin.qq.com/v3/combine-transactions/out-trade-no/${combine_out_trade_no}/close`;
    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 申请交易账单
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_6.shtml
   */
  public async tradebill(params: Itradebill) {
    let url = 'https://api.mch.weixin.qq.com/v3/bill/tradebill';
    const _params: any = {
      ...params,
    };
    const querystring = Object.keys(_params)
      .filter(key => {
        return !!_params[key];
      })
      .sort()
      .map(key => {
        return key + '=' + _params[key];
      })
      .join('&');
    url = url + `?${querystring}`;
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 申请资金账单
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_7.shtml
   */
  public async fundflowbill(params: Ifundflowbill) {
    let url = 'https://api.mch.weixin.qq.com/v3/bill/fundflowbill';
    const _params: any = {
      ...params,
    };
    const querystring = Object.keys(_params)
      .filter(key => {
        return !!_params[key];
      })
      .sort()
      .map(key => {
        return key + '=' + _params[key];
      })
      .join('&');
    url = url + `?${querystring}`;
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 下载账单
   * @param download_url 请求参数 路径 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_8.shtml
   */
  public async downloadBill(download_url: string) {
    const authorization = this.buildAuthorization('GET', download_url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(download_url, headers);
  }
  /**
   * 申请退款
   * @param params 请求参数 路径 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_9.shtml
   */
  public async refunds(params: Irefunds1 | Irefunds2): Promise<Refunds.IOutput> {
    const url = 'https://api.mch.weixin.qq.com/v3/refund/domestic/refunds';
    // 请求参数
    const _params = {
      ...params,
    };

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 查询单笔退款
   * @documentation 请求参数 路径 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_2_10.shtml
   */
  public async find_refunds(out_refund_no: string): Promise<FindRefunds.IOutput> {
    if (!out_refund_no) throw new Error('缺少out_refund_no');
    const url = `https://api.mch.weixin.qq.com/v3/refund/domestic/refunds/${out_refund_no}`;

    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  //#endregion 支付相关接口
  //#region 商家转账到零钱
  /**
   * 发起商家转账零钱
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter4_3_1.shtml
   */
  public async batches_transfer(params: BatchesTransfer.Input): Promise<BatchesTransfer.IOutput> {
    const url = 'https://api.mch.weixin.qq.com/v3/transfer/batches';
    // 请求参数
    const _params = {
      appid: this.appid,
      ...params,
    };

    const serial_no = _params?.wx_serial_no;
    delete _params.wx_serial_no;
    const authorization = this.buildAuthorization('POST', url, _params);

    const headers = this.getHeaders(authorization, { 'Wechatpay-Serial': serial_no || this.serial_no, 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 微信批次单号查询批次单API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter4_3_2.shtml
   */
  public async query_batches_transfer_list_wx(
    params: BatchesTransfer.QueryBatchesTransferByWx.Input,
  ): Promise<BatchesTransfer.QueryBatchesTransferByWx.IOutput> {
    const baseUrl = `https://api.mch.weixin.qq.com/v3/transfer/batches/batch-id/${params.batch_id}`;
    const url = baseUrl + this.objectToQueryString(params, ['batch_id']);
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 微信明细单号查询明细单API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter4_3_3.shtml
   */
  public async query_batches_transfer_detail_wx(
    params: BatchesTransfer.QueryBatchesTransferDetailByWx.Input,
  ): Promise<BatchesTransfer.QueryBatchesTransferDetailByWx.IOutput> {
    const baseUrl = `https://api.mch.weixin.qq.com/v3/transfer/batches/batch-id/${params.batch_id}/details/detail-id/${params.detail_id}`;
    const url = baseUrl + this.objectToQueryString(params, ['batch_id', 'detail_id']);
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 商家批次单号查询批次单API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter4_3_5.shtml
   */
  public async query_batches_transfer_list(
    params: BatchesTransfer.QueryBatchesTransferList.Input,
  ): Promise<BatchesTransfer.QueryBatchesTransferList.IOutput> {
    const baseUrl = `https://api.mch.weixin.qq.com/v3/transfer/batches/out-batch-no/${params.out_batch_no}`;
    const url = baseUrl + this.objectToQueryString(params, ['out_batch_no']);
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 商家明细单号查询明细单API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter4_3_6.shtml
   */
  public async query_batches_transfer_detail(
    params: BatchesTransfer.QueryBatchesTransferDetail.Input,
  ): Promise<BatchesTransfer.QueryBatchesTransferDetail.IOutput> {
    const baseUrl = `https://api.mch.weixin.qq.com/v3/transfer/batches/out-batch-no/${params.out_batch_no}/details/out-detail-no/${params.out_detail_no}`;
    const url = baseUrl + this.objectToQueryString(params, ['out_batch_no', 'out_detail_no']);
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  //#endregion 商家转账到零钱
  //#region 分账
  /**
   * 请求分账API
   * @param params
   * @returns
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_1.shtml
   */
  public async create_profitsharing_orders(
    params: ProfitSharing.CreateProfitSharingOrders.Input,
  ): Promise<ProfitSharing.CreateProfitSharingOrders.IOutput> {
    const url = 'https://api.mch.weixin.qq.com/v3/profitsharing/orders';
    // 请求参数
    const _params = {
      appid: this.appid,
      ...params,
    };

    const serial_no = _params?.wx_serial_no;
    delete _params.wx_serial_no;
    const authorization = this.buildAuthorization('POST', url, _params);

    const headers = this.getHeaders(authorization, { 'Wechatpay-Serial': serial_no || this.serial_no, 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 查询分账结果API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_2.shtml
   */
  public async query_profitsharing_orders(transaction_id: string, out_order_no: string): Promise<ProfitSharing.CreateProfitSharingOrders.IOutput> {
    if (!transaction_id) throw new Error('缺少transaction_id');
    if (!out_order_no) throw new Error('缺少out_order_no');
    let url = `https://api.mch.weixin.qq.com/v3/profitsharing/orders/${out_order_no}`;
    url = url + this.objectToQueryString({ transaction_id });
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 请求分账回退API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_3.shtml
   */
  public async profitsharing_return_orders(
    params: ProfitSharing.ProfitSharingReturnOrders.Input,
  ): Promise<ProfitSharing.ProfitSharingReturnOrders.IOutput> {
    const url = 'https://api.mch.weixin.qq.com/v3/profitsharing/return-orders';
    // 请求参数
    const _params = {
      ...params,
    };

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 查询分账回退结果API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_4.shtml
   */
  public async query_profitsharing_return_orders(
    out_return_no: string,
    out_order_no: string,
  ): Promise<ProfitSharing.ProfitSharingReturnOrders.IOutput> {
    if (!out_return_no) throw new Error('缺少out_return_no');
    if (!out_order_no) throw new Error('缺少out_order_no');
    let url = `https://api.mch.weixin.qq.com/v3/profitsharing/return-orders/${out_return_no}`;
    url = url + this.objectToQueryString({ out_order_no });
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 解冻剩余资金API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_5.shtml
   */
  public async profitsharing_orders_unfreeze(
    params: ProfitSharing.ProfitsharingOrdersUnfreeze.Input,
  ): Promise<ProfitSharing.ProfitsharingOrdersUnfreeze.IOutput> {
    const url = 'https://api.mch.weixin.qq.com/v3/profitsharing/orders/unfreeze';
    // 请求参数
    const _params = {
      ...params,
    };

    const authorization = this.buildAuthorization('POST', url, _params);
    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 查询剩余待分金额API
   * @documentation 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_6.shtml
   */
  public async query_profitsharing_amounts(transaction_id: string): Promise<ProfitSharing.QueryProfitSharingAmounts.IOutput> {
    if (!transaction_id) throw new Error('缺少transaction_id');
    const url = `https://api.mch.weixin.qq.com/v3/profitsharing/transactions/${transaction_id}/amounts`;
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  /**
   * 添加分账接收方API
   * @documentation https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_8.shtml
   */
  public async profitsharing_receivers_add(
    params: ProfitSharing.ProfitSharingReceiversAdd.Input,
  ): Promise<ProfitSharing.ProfitSharingReceiversAdd.IOutput> {
    const url = 'https://api.mch.weixin.qq.com/v3/profitsharing/receivers/add';
    // 请求参数
    const _params = {
      appid: this.appid,
      ...params,
    };

    const serial_no = _params?.wx_serial_no;
    delete _params.wx_serial_no;
    const authorization = this.buildAuthorization('POST', url, _params);

    const headers = this.getHeaders(authorization, { 'Wechatpay-Serial': serial_no || this.serial_no, 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 删除分账接收方API
   * @documentation https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_9.shtml
   */
  public async profitsharing_receivers_delete(
    params: ProfitSharing.ProfitSharingReceiversDelete.Input,
  ): Promise<ProfitSharing.ProfitSharingReceiversDelete.IOutput> {
    const url = 'https://api.mch.weixin.qq.com/v3/profitsharing/receivers/delete';
    // 请求参数
    const _params = {
      appid: this.appid,
      ...params,
    };

    const authorization = this.buildAuthorization('POST', url, _params);

    const headers = this.getHeaders(authorization, { 'Content-Type': 'application/json' });
    return await this.httpService.post(url, _params, headers);
  }
  /**
   * 申请分账账单API
   * @documentation https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter8_1_11.shtml
   */
  public async profitsharing_bills(bill_date: string, tar_type?: string): Promise<ProfitSharing.ProfitSharingBills.IOutput> {
    if (!bill_date) throw new Error('缺少bill_date');
    let url = `https://api.mch.weixin.qq.com/v3/profitsharing/bills`;
    url = url + this.objectToQueryString({ bill_date, ...(tar_type && { tar_type }) });
    const authorization = this.buildAuthorization('GET', url);
    const headers = this.getHeaders(authorization);
    return await this.httpService.get(url, headers);
  }
  //#endregion 分账
  public async upload_images(pic_buffer: Buffer, filename: string): Promise<UploadImages.IOutput> {
    //meta信息
    const fileinfo = {
      filename,
      sha256: '',
    };
    const sign = crypto.createHash('sha256');
    sign.update(pic_buffer);
    fileinfo.sha256 = sign.digest('hex');

    const url = '/v3/merchant/media/upload';

    const authorization = this.buildAuthorization('POST', url, fileinfo);

    const headers = this.getHeaders(authorization, { 'Content-Type': 'multipart/form-data;boundary=boundary' });
    return await this.httpService.post(
      url,
      {
        fileinfo,
        pic_buffer,
      },
      headers,
    );
  }
}

export = Pay;
