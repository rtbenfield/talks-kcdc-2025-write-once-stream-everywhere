import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export async function loader({}: LoaderFunctionArgs) {
  return new Response("Expected POST method", { status: 405 });
}

/**
 * Endpoint to receive and log data from Debezium.
 */
export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json();

  console.info("Debezium data", data);

  return new Response("OK");
}
