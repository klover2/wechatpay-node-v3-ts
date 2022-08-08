/**
 * 统一返回格式
 */
export interface Output {
  status: number;
  error?: any;
  data?: any;
}

/**
 * 发起商家转账零钱
 */
export declare namespace BatchesTransfer {
  export interface TransferDetailList {
    /** 商家明细单号 */
    out_detail_no: string;
    /** 转账金额 */
    transfer_amount: number;
    /** 转账备注 */
    transfer_remark: string;
    /** 用户在直连商户应用下的用户标示 */
    openid: string;
    /** 收款用户姓名 */
    user_name?: string;
  }

  /**
   * 发起商家转账API 请求参数
   */
  export interface Input {
    /** 直连商户的appid -不传 默认使用初始化数据 */
    appid?: string;
    /** 商家批次单号 */
    out_batch_no: string;
    /** 批次名称 */
    batch_name: string;
    /** 批次备注 */
    batch_remark: string;
    /** 转账总金额 */
    total_amount: number;
    /** 转账总笔数 */
    total_num: number;
    /** 转账明细列表 */
    transfer_detail_list: TransferDetailList[];
  }

  export interface DataOutput {
    out_batch_no: string;
    batch_id: string;
    create_time: Date;
  }

  /**
   * 发起商家转账API 返回参数
   */
  export interface IOutput extends Output {
    data?: DataOutput;
  }
}
