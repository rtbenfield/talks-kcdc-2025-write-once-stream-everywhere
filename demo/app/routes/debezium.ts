import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  cancelAbandonedCartEmail,
  scheduledAbandonedCartEmail,
  sendOrderConfirmationEmail,
} from "~/lib/emails.server";

interface DebeziumEvent {
  /**
   * schema contains information about the Debezium payload structure.
   * Notably, `fields` will contain entries for `before` and `after` with table
   * schema information.
   */
  schema?: unknown;
  payload: {
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    source: {
      version: string;
      connector: string;
      name: string;
      ts_ms: number;
      snapshot: string;
      db: string;
      sequence: string;
      ts_us: number;
      ts_ns: number;
      schema: string;
      table: string;
      txId: number;
      lsn: number;
      xmin: number | null;
    };
    transaction: {
      id: number;
      total_order: number;
      data_collection_order: number;
    } | null;
    op: "c" | "u" | "d" | "r";
    ts_ms: number;
    ts_us: number;
    ts_ns: number;
  };
}

export async function loader({}: LoaderFunctionArgs) {
  return new Response("Expected POST method", { status: 405 });
}

/**
 * Endpoint to receive and log data from Debezium.
 */
export async function action({ request }: ActionFunctionArgs) {
  // REVIEW: endpoint to receive Debezium events
  const data: DebeziumEvent = await request.json();

  console.info(
    `[DEBEZIUM] ${data.payload.source.lsn} ${data.payload.source.table} ${data.payload.op}`,
    // after is null for deletes
    // before is null for creates
    data.payload.op === "d" ? data.payload.before : data.payload.after,
  );

  try {
    // TODO: enable Debezium event handling
    // await eventRouter(data);
  } catch (error) {
    // simplify the error message to reduce the noisy logs
    console.error("[DEBEZIUM] Error processing event", String(error));
    return new Response("Error processing event", { status: 500 });
  }

  return new Response("OK");
}

async function eventRouter(event: DebeziumEvent) {
  const idempotentId = event.payload.source.lsn.toString();
  switch (event.payload.source.table) {
    case "carts":
      switch (event.payload.op) {
        case "d":
          // cart was deleted
          // cancel any scheduled abandoned cart emails
          const cartId = event.payload.before!["id"] as number;
          await cancelAbandonedCartEmail(cartId, idempotentId);
          return;
      }
    case "cart_items":
      switch (event.payload.op) {
        case "c":
          // cart item was created
          // schedule an abandoned cart email
          const cartId = event.payload.after!["cart_id"] as number;
          await scheduledAbandonedCartEmail(cartId, idempotentId);
          return;
      }
    case "orders":
      switch (event.payload.op) {
        case "c":
          // order was created
          // send an order confirmation email
          const orderId = event.payload.after!["id"] as number;
          await sendOrderConfirmationEmail(orderId, idempotentId);
          return;
      }
  }
}
