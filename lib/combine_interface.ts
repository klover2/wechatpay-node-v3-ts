// H5场景信息
interface Ih5Info {
  type: string;
  app_name: string;
  app_url?: string;
  bundle_id?: string;
  package_name?: string;
}
interface IsceneInfoNative {
  device_id?: string;
  payer_client_ip: string;
}
interface IsceneInfoH5 {
  payer_client_ip: string;
  device_id: string;
  h5_info: Ih5Info;
}
interface Iamount {
  total_amount: number;
  currency: string;
}
interface IsettleInfo {
  profit_sharing?: boolean;
  subsidy_amount?: number;
}
interface IsubOrders {
  mchid: string;
  attach: string;
  amount: Iamount;
  out_trade_no: string;
  sub_mchid?: string; // 直连商户不用传二级商户号。
  description: string;
  settle_info?: IsettleInfo;
}
interface IcombinePayerInfo {
  openid: string;
}

// 抛出
export interface IcombineH5 {
  combine_out_trade_no: string;
  scene_info: IsceneInfoH5;
  time_start?: string;
  time_expire?: string;
  notify_url: string;
  sub_orders: IsubOrders[];
}
export interface IcombineNative {
  combine_out_trade_no: string;
  scene_info: IsceneInfoNative;
  time_start?: string;
  time_expire?: string;
  notify_url: string;
  sub_orders: IsubOrders[];
}
export interface IcombineApp {
  combine_out_trade_no: string;
  scene_info: IsceneInfoNative;
  time_start?: string;
  time_expire?: string;
  notify_url: string;
  sub_orders: IsubOrders[];
  combine_payer_info?: IcombinePayerInfo;
}
export interface IcombineJsapi {
  combine_out_trade_no: string;
  scene_info: IsceneInfoNative;
  time_start?: string;
  time_expire?: string;
  notify_url: string;
  sub_orders: IsubOrders[];
  combine_payer_info: IcombinePayerInfo;
}
export interface IcloseSubOrders {
  mchid: string;
  out_trade_no: string;
  sub_mchid?: string;
}
