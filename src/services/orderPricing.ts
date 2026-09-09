import type { OrderProductInput } from "../types";

// Keep two-decimal monetary values inside JavaScript's safe integer range when
// represented as cents.
export const MAX_ORDER_TOTAL = Math.floor(Number.MAX_SAFE_INTEGER / 100);

export class OrderTotalOutOfRangeError extends RangeError {
  constructor() {
    super("Calculated order total is outside the supported range");
    this.name = "OrderTotalOutOfRangeError";
  }
}

export function calculateOrderTotal(
  products: readonly OrderProductInput[],
  pricesByProductId: ReadonlyMap<string, number>,
): number {
  const total = products.reduce((sum, product) => {
    const price = pricesByProductId.get(product.productId);

    if (price === undefined) {
      throw new Error(`Missing price for product ${product.productId}`);
    }

    const nextTotal = sum + price * product.quantity;

    if (!Number.isFinite(nextTotal) || nextTotal < 0 || nextTotal > MAX_ORDER_TOTAL) {
      throw new OrderTotalOutOfRangeError();
    }

    return nextTotal;
  }, 0);

  const roundedTotal = Number(total.toFixed(2));

  if (!Number.isFinite(roundedTotal) || roundedTotal > MAX_ORDER_TOTAL) {
    throw new OrderTotalOutOfRangeError();
  }

  return roundedTotal;
}
