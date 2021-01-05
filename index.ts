'use strict';
interface Ipay {
  appid: string; //  直连商户申请的公众号或移动应用appid。
  mchid: string; // 商户号
  serial_no: string; // 证书序列号
  publicKey: Buffer; // 公钥
  privateKey: Buffer; // 密钥
  authType?: string;
}
import crypto from 'crypto';

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
    if (body) str = str + JSON.stringify(body) + '\n';
    return this.sha256WithRsa(str);
  }
  /**
   * SHA256withRSA
   * @param data 待加密字符
   * @param privatekey 私钥key  key.pem   fs.readFileSync(keyPath)
   */
  public sha256WithRsa(data: string): string {
    if (!this.privateKey) throw '缺少秘钥文件';
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
}

export = Pay;
