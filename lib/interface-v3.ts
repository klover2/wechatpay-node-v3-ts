/**
 * 商户转账，微信更新时间2025.03.21
 */
import { Output } from './interface-v2';

export declare namespace TransferBills {
  export interface TransferDataOutput {
    /** 商户单号 */
    out_bill_no: string;
    /** 微信转账单号 */
    transfer_bill_no: string;
    /** 单据状态 */
    state: string;
  }

  export interface TransferSceneReportInfo {
    /** 场景信息类型，如"活动名称"、"奖励说明"等 */
    info_type: string;
    /** 场景信息内容 */
    info_content: string;
  }

  export interface Input {
    /** 直连商户的appid -不传 默认使用初始化数据 */
    appid?: string;
    /** 商户单号 */
    out_bill_no: string;
    /** 转账场景ID */
    transfer_scene_id: string;
    /** 收款用户OpenID */
    openid: string;
    /** 收款用户姓名 */
    user_name?: number;
    /** 转账金额单位为"分" */
    transfer_amount: number;
    /** 转账备注 */
    transfer_remark: string;
    /** 通知地址 */
    notify_url?: string;
    /** 用户收款感知 */
    user_recv_perception?: string;
    /** 转账场景报备信息 */
    transfer_scene_report_infos: TransferSceneReportInfo[];
    /** 微信平台证书序列号-Wechatpay-Serial(当有敏感信息加密时,需要当前参数) */
    wx_serial_no?: string;
  }

  export interface DataOutput extends TransferDataOutput {
    /** 单据创建时间 */
    create_time: string;
    /** 失败原因 */
    fail_reason?: string;
    /** 跳转领取页面的package信息 */
    package_info?: string;
  }

  export interface IOutput extends Output {
    data?: DataOutput;
  }

  export interface CancelInput {
    /** 商户单号 */
    out_bill_no: string;
  }

  export interface CancelDataOutput extends TransferDataOutput {
    /** 单据创建时间 */
    update_time: string;
  }

  export interface CancelOutput extends Output {
    data?: CancelDataOutput;
  }

  export interface OutBillNoInput {
    /** 商户单号 */
    out_bill_no: string;
  }

  export interface BillNoInput {
    /** 微信转账单号 */
    transfer_bill_no: string;
  }

  export interface BillDataOutput extends TransferDataOutput {
    /** 商户号 */
    mch_id: string;
    /** 商户AppID */
    appid: string;
    /** 转账金额单位为"分"*/
    transfer_amount: number;
    /** 转账备注 */
    transfer_remark: string;
    /** 失败原因 */
    fail_reason?: string;
    /** 收款用户OpenID */
    openid?: string;
    /** 收款用户姓名 */
    user_name?: string;
    /** 单据创建时间 */
    create_time: string;
    /** 最后一次状态变更时间 */
    update_time: string;
  }

  export interface BillOutput extends Output {
    data?: BillDataOutput;
  }
}
