/**
 * 支付渠道抽象接口。
 *
 * 当前线上跑的是 MOCK 模拟支付，用于先把网站流程跑通。
 * 后续接入国内支付时，按此接口实现：
 * - AlipayProvider: 接入支付宝电脑网站/手机网站支付（alipay.trade.page.pay）
 * - WechatPayProvider: 接入微信 Native/JSAPI 支付
 *
 * 需要的环境变量请参考 server/.env.example 中的 ALIPAY_* / WECHAT_PAY_*。
 */
export type PaymentChannel = "ALIPAY" | "WECHAT";

export interface CreatePaymentOrderInput {
  userId: string;
  orderNo: string;
  amountCoins: number;
  /** 支付金额，单位：分 */
  amountCents: number;
  subject: string;
}

export interface PaymentOrderResult {
  orderNo: string;
  channel: PaymentChannel;
  /** 支付宝：跳转收银台链接 */
  paymentUrl?: string;
  /** 微信：Native 支付 code_url，前端可生成二维码 */
  qrCodeUrl?: string;
  /** 微信 JSAPI：prepay_id */
  prepayId?: string;
}

export interface PaymentNotifyResult {
  success: boolean;
  orderNo?: string;
  raw?: unknown;
}

export interface PaymentProvider {
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyNotify(payload: unknown): Promise<PaymentNotifyResult>;
}

/**
 * 支付宝 Provider 占位实现。
 * 正式接入时替换为支付宝 SDK/OpenAPI 调用。
 */
export class AlipayProvider implements PaymentProvider {
  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    // TODO: 调用支付宝 alipay.trade.page.pay / alipay.trade.wap.pay
    return {
      orderNo: input.orderNo,
      channel: "ALIPAY",
      paymentUrl: `https://openapi.alipay.com/gateway.do?TODO_ORDER=${input.orderNo}`,
    };
  }

  async verifyNotify(_payload: unknown): Promise<PaymentNotifyResult> {
    // TODO: 验签 + 校验金额/订单号
    return { success: false, raw: _payload };
  }
}

/**
 * 微信支付 Provider 占位实现。
 * 正式接入时替换为微信支付 V3 API。
 */
export class WechatPayProvider implements PaymentProvider {
  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    // TODO: 调用微信支付 Native 下单 / JSAPI 下单
    return {
      orderNo: input.orderNo,
      channel: "WECHAT",
      qrCodeUrl: `weixin://wxpay/bizpayurl?pr=TODO_${input.orderNo}`,
    };
  }

  async verifyNotify(_payload: unknown): Promise<PaymentNotifyResult> {
    // TODO: 微信支付回调验签 + 解密
    return { success: false, raw: _payload };
  }
}
