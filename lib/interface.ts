// 订单金额信息
interface Iamount {
  total: number;
  currency?: string;
}
// 优惠功能
interface Idetail {
  cost_price?: number;
  invoice_id?: string;
  goods_detail?: IgoodsDetail[];
}
// 单品列表信息
interface IgoodsDetail {
  merchant_goods_id: string;
  wechatpay_goods_id?: string;
  goods_name?: string;
  quantity: number;
  unit_price: number;
}
// 支付者
interface Ipayer {
  openid: string;
}
// 支付场景描述
interface IsceneInfoH5 {
  payer_client_ip: string;
  device_id?: string;
  store_info?: IstoreInfo;
  h5_info: Ih5Info;
}
interface IsceneInfoNative {
  payer_client_ip: string;
  device_id?: string;
  store_info?: IstoreInfo;
}
// 商户门店信息
interface IstoreInfo {
  id: string;
  name?: string;
  area_code?: string;
  address?: string;
}
// H5场景信息
interface Ih5Info {
  type: string;
  app_name: string;
  app_url?: string;
  bundle_id?: string;
  package_name?: string;
}

// 抛出
export interface Ioptions {
  userAgent?: string;
  authType?: string;
  key?: string;
  serial_no?: string;
  wxPayPublicKey?: Buffer; // 支付平台公钥
  wxPayPublicId?: string; // 支付平台密钥
}
export interface Ipay {
  appid: string; //  直连商户申请的公众号或移动应用appid。
  mchid: string; // 商户号
  serial_no?: string; // 证书序列号
  publicKey: Buffer; // 公钥
  privateKey: Buffer; // 密钥
  authType?: string; // 认证类型，目前为WECHATPAY2-SHA256-RSA2048
  userAgent?: string;
  key?: string;
  wxPayPublicKey?: Buffer; // 支付平台公钥
  wxPayPublicId?: string; // 支付平台密钥
}
export interface Ih5 {
  appid?: string;
  mchid?: string;
  description: string;
  out_trade_no: string;
  time_expire?: string;
  attach?: string;
  notify_url: string;
  goods_tag?: string;
  amount: Iamount;
  detail?: Idetail;
  scene_info: IsceneInfoH5;
}
export interface Inative {
  appid?: string;
  mchid?: string;
  description: string;
  out_trade_no: string;
  time_expire?: string;
  attach?: string;
  notify_url: string;
  goods_tag?: string;
  support_fapiao?: boolean;
  amount: Iamount;
  detail?: Idetail;
  scene_info?: IsceneInfoNative;
  settle_info?: { profit_sharing?: boolean };
}
export interface Ijsapi {
  appid?: string;
  mchid?: string;
  description: string;
  out_trade_no: string;
  time_expire?: string;
  attach?: string;
  notify_url: string;
  goods_tag?: string;
  amount: Iamount;
  payer: Ipayer;
  detail?: Idetail;
  scene_info?: IsceneInfoNative;
}
export interface Iapp {
  appid?: string;
  mchid?: string;
  description: string;
  out_trade_no: string;
  time_expire?: string;
  attach?: string;
  notify_url: string;
  goods_tag?: string;
  amount: Iamount;
  detail?: Idetail;
  scene_info?: IsceneInfoNative;
}
export interface Iquery1 {
  transaction_id: string;
  out_trade_no?: string;
}
export interface Iquery2 {
  transaction_id?: string;
  out_trade_no: string;
}
export interface Itradebill {
  bill_date: string;
  sub_mchid?: string;
  bill_type: string;
  tar_type?: string;
}
export interface Ifundflowbill {
  bill_date: string;
  account_type: string;
  tar_type?: string;
}
export interface Irefunds {
  out_refund_no: string;
  reason?: string;
  notify_url?: string;
  funds_account?: string;
  amount: IRamount;
  goods_detail?: IRgoodsDetail[];
}
export interface Irefunds1 extends Irefunds {
  transaction_id: string;
  out_trade_no?: string;
}
export interface Irefunds2 extends Irefunds {
  transaction_id?: string;
  out_trade_no: string;
}
interface IRamount {
  total: number;
  currency: string;
  refund: number;
}
interface IRgoodsDetail {
  merchant_goods_id: string;
  wechatpay_goods_id?: string;
  goods_name?: string;
  refund_quantity: number;
  unit_price: number;
  refund_amount: number;
}

/**
 * 证书信息
 */
export interface ICertificates {
  effective_time: string;
  expire_time: string;
  serial_no: string;
  publicKey?: string;
  encrypt_certificate: {
    algorithm: string;
    associated_data: string;
    ciphertext: string;
    nonce: string;
  };
}
