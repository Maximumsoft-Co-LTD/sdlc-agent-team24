export type PaymentMethod = 'mock' | 'coin' | 'card' | 'promptpay';

export interface RevenueSplitInput {
  gross: number;
  gatewayFeeRate: number;
  paymentMethod: PaymentMethod;
  publisherRevenueShare: number;
}

export interface RevenueSplit {
  gross: number;
  gateway_fee: number;
  net: number;
  platform_cut: number;
  publisher_share: number;
}

/**
 * DevSpec Full §9 — revenue split calculation.
 * Coin payments have gateway_fee = 0 (PRD A-8).
 */
export function calculateRevenueSplit(input: RevenueSplitInput): RevenueSplit {
  const { gross, gatewayFeeRate, paymentMethod, publisherRevenueShare } = input;

  if (gross < 0) {
    throw new Error('gross must be non-negative');
  }
  if (publisherRevenueShare < 0 || publisherRevenueShare > 1) {
    throw new Error('publisherRevenueShare must be between 0 and 1');
  }

  const gateway_fee =
    paymentMethod === 'coin' ? 0 : Math.round(gross * gatewayFeeRate);
  const net = gross - gateway_fee;
  const platform_cut = Math.round(net * (1 - publisherRevenueShare));
  const publisher_share = net - platform_cut;

  return { gross, gateway_fee, net, platform_cut, publisher_share };
}

/** NFR-5: platform_cut + publisher_share must equal net */
export function isRevenueSplitBalanced(split: RevenueSplit): boolean {
  return split.platform_cut + split.publisher_share === split.net;
}
