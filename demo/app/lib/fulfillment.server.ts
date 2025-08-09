export async function processOrderFulfillment(
  orderId: number,
  idempotentId?: string,
) {
  // this function mocks the fulfillment of an order
  // imagine we call to another service to process the order

  // unfortunately, our service is unreliable, and fails 25% of the time
  const success = Math.random() > 0.25;

  if (!success) {
    throw new FulfillmentProviderError("Failed to fulfill order");
  }

  console.info("[FULFILLMENT] processOrderFulfillment", { orderId });
}

export class FulfillmentProviderError extends Error {}
