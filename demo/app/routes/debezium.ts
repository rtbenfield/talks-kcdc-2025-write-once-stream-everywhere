import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

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
  const data: DebeziumEvent = await request.json();

  console.info(
    `[DEBEZIUM] ${data.payload.source.lsn} ${data.payload.source.table} ${data.payload.op}`,
    // after is null for deletes
    // before is null for creates
    data.payload.op === "d" ? data.payload.before : data.payload.after,
  );

  return new Response("OK");
}
