import { randomChance } from "./random";

export async function processOrderFulfillment(
  orderId: number,
  idempotentId?: string,
) {
  // this function mocks the fulfillment of an order
  // imagine we call to another service to process the order

  // unfortunately, our service is unreliable, and fails 30% of the time
  const success = randomChance(0.3);

  if (!success) {
    throw new FulfillmentProviderError("Failed to fulfill order");
  }

  console.info("[FULFILLMENT] processOrderFulfillment", { orderId });
}

export class FulfillmentProviderError extends Error {}
