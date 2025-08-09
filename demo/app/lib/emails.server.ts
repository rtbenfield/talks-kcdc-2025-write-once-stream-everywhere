export async function sendOrderConfirmationEmail(
  orderId: number,
  idempotentId?: string,
) {
  // this function mocks an order confirmation email sending
  // unfortunately we're using an unreliable email provider that fails 25% of the time
  const success = Math.random() > 0.25;

  if (!success) {
    throw new EmailProviderError("Failed to send email");
  }

  console.info("[EMAILS] sendOrderConfirmationEmail", { orderId });
}

export async function cancelAbandonedCartEmail(
  cartId: number,
  idempotentId?: string,
) {
  // this function mocks the cancellation of an abandoned cart email
  // imagine this canceling an email that was scheduled by scheduledAbandonedCartEmail
  // it would call to a third party service that managed the email schedule

  // unfortunately, our third party is unreliable, and fails 25% of the time
  const success = Math.random() > 0.25;

  if (!success) {
    throw new EmailProviderError("Failed to cancel email");
  }

  console.info("[EMAILS] cancelAbandonedCartEmail", { cartId });
}

export async function scheduledAbandonedCartEmail(
  cartId: number,
  idempotentId?: string,
) {
  // this function mocks the scheduling of an abandoned cart email
  // imagine we call to a third party service to schedule the email for 2-days from now

  // unfortunately, our third party is unreliable, and fails 25% of the time
  const success = Math.random() > 0.25;

  if (!success) {
    throw new EmailProviderError("Failed to schedule email");
  }

  console.info("[EMAILS] scheduledAbandonedCartEmail", { cartId });
}

export class EmailProviderError extends Error {}
