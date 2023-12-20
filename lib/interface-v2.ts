/**
 * 统一返回格式
 */
export interface Output {
  /** http 状态 */
  status: number;
  /** 报错时返回的 text */
  error?: any;
  /** 原错误信息 */
  errRaw?: any;
  /** body 返回参数 */
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
    /** 转账场景ID */
    transfer_scene_id?: string;
    /** 微信平台证书序列号-Wechatpay-Serial(当有敏感信息加密时,需要当前参数) */
    wx_serial_no?: string;
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

/**
 * 分账
 */
export declare namespace ProfitSharing {
  export interface ProfitSharingOrdersReceiversOutput {
    /** 分账接收方类型 */
    type: 'MERCHANT_ID' | 'PERSONAL_OPENID';
    /** 分账接收方账号 */
    account: string;
    /** 分账金额 */
    amount: number;
    /** 分账描述 */
    description: string;
    /** 分账结果 */
    result: string;
    /** 分账失败原因 */
    fail_reason: string;
    /** 分账创建时间 */
    create_time: string;
    /** 分账完成时间 */
    finish_time: string;
    /** 分账明细单号 */
    detail_id: string;
  }

  export interface ProfitSharingOrderDetailOutput {
    /** 微信订单号 */
    transaction_id: string;
    /** 商户分账单号 */
    out_order_no: string;
    /** 微信分账单号 */
    order_id: string;
    /** 分账单状态 */
    state: string;
    /** 分账接收方列表 */
    receivers?: ProfitSharingOrdersReceiversOutput[];
  }

  /**
   * 请求分账
   */
  export namespace CreateProfitSharingOrders {
    export interface Input {
      /** 微信分配的商户appid 不传 使用默认 */
      appid?: string;
      /** 微信订单号 */
      transaction_id: string;
      /** 商户分账单号 */
      out_order_no: string;
      /** 分账接收方列表 */
      receivers: CreateProfitSharingOrdersReceivers[];
      /** 是否解冻剩余未分资金 */
      unfreeze_unsplit: boolean;
      /** 当有敏感信息加密 必填 */
      wx_serial_no?: string;
    }

    export interface CreateProfitSharingOrdersReceivers {
      /** 分账接收方类型 */
      type: 'MERCHANT_ID' | 'PERSONAL_OPENID';
      /** 分账接收方账号 */
      account: string;
      /** 分账个人接收方姓名 */
      name?: string;
      /** 分账金额 */
      amount: number;
      /** 分账描述 */
      description: string;
    }

    export interface IOutput extends Output {
      data?: ProfitSharingOrderDetailOutput;
    }
  }

  /**
   * 分账回退
   */
  export namespace ProfitSharingReturnOrders {
    export interface Input {
      /** 微信分账单号 */
      order_id?: string;
      /** 商户分账单号 */
      out_order_no?: string;
      /** 商户回退单号 */
      out_return_no: string;
      /** 回退商户号 */
      return_mchid: string;
      /** 回退金额 */
      amount: number;
      /** 回退描述 */
      description: string;
    }

    export interface IOutput extends Output {
      data?: IDetail;
    }
    export interface IDetail {
      /** 微信分账单号 */
      order_id: string;
      /** 商户分账单号 */
      out_order_no: string;
      /** 商户回退单号 */
      out_return_no: string;
      /** 微信回退单号 */
      return_id: string;
      /** 回退商户号 */
      return_mchid: string;
      /** 回退金额 */
      amount: number;
      /** 回退描述 */
      description: string;
      /** 回退结果 */
      result: string;
      /** 失败原因 */
      fail_reason: string;
      /** 创建时间 */
      create_time: string;
      /** 完成时间 */
      finish_time: string;
    }
  }

  /**
   * 解冻剩余资金
   */
  export namespace ProfitsharingOrdersUnfreeze {
    export interface Input {
      /** 微信订单号 */
      transaction_id: string;
      /** 商户分账单号 */
      out_order_no: string;
      /** 分账描述 */
      description: string;
    }

    export type IOutput = ProfitSharing.CreateProfitSharingOrders.IOutput;
  }

  export namespace QueryProfitSharingAmounts {
    export interface IOutput extends Output {
      data?: {
        transaction_id: string;
        unsplit_amount: number;
      };
    }
  }

  export namespace ProfitSharingReceiversAdd {
    export interface Input {
      /** 应用ID */
      appid?: string;
      /** 分账接收方类型 */
      type: string;
      /** 分账接收方账号 */
      account: string;
      /** 分账个人接收方姓名 */
      name?: string;
      /** 与分账方的关系类型 */
      relation_type: string;
      /** 自定义的分账关系 */
      custom_relation?: string;
      /** 当有敏感信息加密 必填 */
      wx_serial_no?: string;
    }

    export interface IOutput extends Output {
      data?: {
        /** 分账接收方类型 */
        type: string;
        /** 分账接收方账号 */
        account: number;
        /** 分账个人接收方姓名 */
        name?: string;
        /** 与分账方的关系类型 */
        relation_type: string;
        /** 自定义的分账关系 */
        custom_relation?: string;
      };
    }
  }

  export namespace ProfitSharingReceiversDelete {
    export interface Input {
      /** 应用ID */
      appid?: string;
      /** 分账接收方类型 */
      type: string;
      /** 分账接收方账号 */
      account: string;
    }

    export interface IOutput extends Output {
      data?: {
        /** 分账接收方类型 */
        type: string;
        /** 分账接收方账号 */
        account: string;
      };
    }
  }

  export namespace ProfitSharingBills {
    export interface IOutput extends Output {
      data?: {
        /** 哈希类型 */
        hash_type: string;
        /** 哈希值 */
        hash_value: string;
        /** 账单下载地址 */
        download_url: string;
      };
    }
  }
}

export declare namespace Refunds {
  export interface DataOutput {
    refund_id: string;
    out_refund_no: string;
    transaction_id: string;
    out_trade_no: string;
    channel: string;
    user_received_account: string;
    success_time: string;
    create_time: string;
    status: string;
    funds_account: string;
    amount: {
      total: number;
      refund: number;
      from: { account: string; amount: number }[];
      payer_total: number;
      payer_refund: number;
      settlement_refund: number;
      settlement_total: number;
      discount_refund: number;
      currency: string;
      refund_fee: number;
    };
    promotion_detail: {
      promotion_id: string;
      scope: string;
      type: string;
      amount: number;
      refund_amount: number;
      goods_detail: {
        merchant_goods_id: string;
        wechatpay_goods_id: string;
        goods_name: string;
        unit_price: number;
        refund_amount: number;
        refund_quantity: number;
      }[];
    }[];
  }

  export interface IOutput extends Output {
    data?: DataOutput;
  }
}

export declare namespace FindRefunds {
  export interface DataOutput {
    refund_id: string;
    out_refund_no: string;
    transaction_id: string;
    out_trade_no: string;
    channel: string;
    user_received_account: string;
    success_time: string;
    create_time: string;
    status: string;
    funds_account: string;
    amount: {
      total: number;
      refund: number;
      from: { account: string; amount: number }[];
      payer_total: number;
      payer_refund: number;
      settlement_refund: number;
      settlement_total: number;
      discount_refund: number;
      currency: string;
      refund_fee: number;
    };
    promotion_detail: {
      promotion_id: string;
      scope: string;
      type: string;
      amount: number;
      refund_amount: number;
      goods_detail: {
        merchant_goods_id: string;
        wechatpay_goods_id: string;
        goods_name: string;
        unit_price: number;
        refund_amount: number;
        refund_quantity: number;
      }[];
    }[];
  }

  export interface IOutput extends Output {
    data?: DataOutput;
  }
}
