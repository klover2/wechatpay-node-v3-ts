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
   * 转账批次单
   */
  export interface QueryTransferBatch {
    /** 微信支付分配的商户号 */
    mchid: string;
    /** 商户系统内部的商家批次单号，在商户系统内部唯一 */
    out_batch_no: string;
    /** 微信批次单号，微信商家转账系统返回的唯一标识 */
    batch_id: string;
    /** 申请商户号的appid或商户号绑定的appid（企业号corpid即为此appid） */
    appid: string;
    /** 批次状态 */
    batch_status: string;
    /** 批次类型 */
    batch_type: string;
    /** 该笔批量转账的名称 */
    batch_name: string;
    /** 转账说明，UTF8编码，最多允许32个字符 */
    batch_remark: string;
    /** 批次关闭原因 */
    close_reason?: string;
    /** 转账总金额 */
    total_amount: number;
    /** 转账总笔数 */
    total_num: number;
    /** 批次创建时间	 */
    create_time?: Date;
    /** 批次更新时间 */
    update_time?: Date;
    /** 转账成功金额 */
    success_amount?: number;
    /** 转账成功笔数 */
    success_num?: number;
    /** 转账失败金额 */
    fail_amount?: number;
    /** 转账失败笔数 */
    fail_num?: number;
  }

  /**
   * 转账明细单列表
   */
  export interface QueryTransferDetailList {
    /** 微信明细单号 */
    detail_id: string;
    /** 商家明细单号 */
    out_detail_no: string;
    /** 明细状态 */
    detail_status: string;
  }

  /**
   * 商家批次单号查询批次单API
   */
  export namespace QueryBatchesTransferList {
    /**
     * 商家批次单号查询参数
     */
    export interface Input {
      /**商户系统内部的商家批次单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一 */
      out_batch_no: string;
      /**商户可选择是否查询指定状态的转账明细单，当转账批次单状态为“FINISHED”（已完成）时，才会返回满足条件的转账明细单 */
      need_query_detail: boolean;
      /**该次请求资源（转账明细单）的起始位置，从0开始，默认值为0 */
      offset?: number;
      /**该次请求可返回的最大资源（转账明细单）条数，最小20条，最大100条，不传则默认20条。不足20条按实际条数返回 */
      limit?: number;
      /**查询指定状态的转账明细单，当need_query_detail为true时，该字段必填 */
      detail_status?: 'ALL' | 'SUCCESS' | 'FAIL';
    }

    export interface IOutput extends Output {
      data?: {
        limit: number;
        offset: number;
        transfer_batch: QueryTransferBatch;
        transfer_detail_list: QueryTransferDetailList[];
      };
    }
  }

  /**
   * 微信批次单号查询批次单API
   */
  export namespace QueryBatchesTransferByWx {
    export interface Input {
      /** 微信批次单号，微信商家转账系统返回的唯一标识 */
      batch_id: string;
      /**商户可选择是否查询指定状态的转账明细单，当转账批次单状态为“FINISHED”（已完成）时，才会返回满足条件的转账明细单 */
      need_query_detail: boolean;
      /**该次请求资源（转账明细单）的起始位置，从0开始，默认值为0 */
      offset?: number;
      /**该次请求可返回的最大资源（转账明细单）条数，最小20条，最大100条，不传则默认20条。不足20条按实际条数返回 */
      limit?: number;
      /**查询指定状态的转账明细单，当need_query_detail为true时，该字段必填 */
      detail_status?: 'ALL' | 'SUCCESS' | 'FAIL';
    }

    export interface IOutput extends Output {
      data?: {
        limit: number;
        offset: number;
        transfer_batch: QueryTransferBatch;
        transfer_detail_list: QueryTransferDetailList[];
      };
    }
  }

  /**
   * 微信明细单号查询明细单API
   */
  export namespace QueryBatchesTransferDetailByWx {
    export interface Input {
      /** 微信批次单号 */
      batch_id: string;
      /** 微信明细单号 */
      detail_id: string;
    }

    export interface DetailOutput {
      /** 商户号 */
      mchid: string;
      /** 商家批次单号 */
      out_batch_no: string;
      /** 微信批次单号 */
      batch_id: string;
      /** 直连商户的appid */
      appid: string;
      /** 商家明细单号 */
      out_detail_no: string;
      /** 微信明细单号 */
      detail_id: string;
      /** 明细状态 */
      detail_status: string;
      /** 转账金额 */
      transfer_amount: number;
      /** 转账备注 */
      transfer_remark: string;
      /** 明细失败原因 */
      fail_reason?: string;
      /** 用户在直连商户应用下的用户标示 */
      openid: string;
      /** 收款用户姓名 */
      user_name?: string;
      /** 转账发起时间 */
      initiate_time: Date;
      /** 明细更新时间 */
      update_time: Date;
    }

    export interface IOutput extends Output {
      data?: DetailOutput;
    }
  }

  /**
   * 商家明细单号查询明细单API
   */
  export namespace QueryBatchesTransferDetail {
    export interface Input {
      /** 商家明细单号 */
      out_detail_no: string;
      /** 商家批次单号 */
      out_batch_no: string;
    }

    export interface DetailOutput {
      /** 商户号 */
      mchid: string;
      /** 商家批次单号 */
      out_batch_no: string;
      /** 微信批次单号 */
      batch_id: string;
      /** 直连商户的appid */
      appid: string;
      /** 商家明细单号 */
      out_detail_no: string;
      /** 微信明细单号 */
      detail_id: string;
      /** 明细状态 */
      detail_status: string;
      /** 转账金额 */
      transfer_amount: number;
      /** 转账备注 */
      transfer_remark: string;
      /** 明细失败原因 */
      fail_reason?: string;
      /** 用户在直连商户应用下的用户标示 */
      openid: string;
      /** 收款用户姓名 */
      user_name?: string;
      /** 转账发起时间 */
      initiate_time: Date;
      /** 明细更新时间 */
      update_time: Date;
    }

    export interface IOutput extends Output {
      data?: DetailOutput;
    }
  }
}
