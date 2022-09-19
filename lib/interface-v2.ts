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


  /**
   * 商家批次单号查询参数
   */
  export interface QueryParam {
    /**商户系统内部的商家批次单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一 */
    out_batch_no: string;
    /**商户可选择是否查询指定状态的转账明细单，当转账批次单状态为“FINISHED”（已完成）时，才会返回满足条件的转账明细单 */
    need_query_detail: boolean;
    /**次请求资源（转账明细单）的起始位置，从0开始，默认值为0 */
    offset?: number;
    /**该次请求可返回的最大资源（转账明细单）条数，最小20条，最大100条，不传则默认20条。不足20条按实际条数返回 */
    limit?: number;
    /**查询指定状态的转账明细单，当need_query_detail为true时，该字段必填 */
    detail_status: 'ALL' | 'SUCCESS' | 'FAIL';
  }
}
