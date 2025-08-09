import { data, Link, useLoaderData } from "react-router";
import { currency, date } from "~/lib/formatters";
import { getOrderById } from "../lib/order.server";
import type { Route } from "./+types/order.$orderId";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Order #${data?.order?.id || "Not Found"} | E-Commerce Demo` },
    { name: "description", content: "Order confirmation details" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const orderId = Number(params.orderId);

  if (isNaN(orderId)) {
    throw new Response("Invalid order ID", { status: 400 });
  }

  const order = await getOrderById(orderId);

  if (!order) {
    throw new Response("Order not found", { status: 404 });
  }

  return data({ order });
}

export default function OrderConfirmation() {
  const { order } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Order Confirmation
          </h1>
          <span className="text-gray-600 dark:text-gray-400">#{order.id}</span>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Date:</span>{" "}
            {date.format(new Date(order.createdAt))}
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Order Items
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {currency.format(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Total
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {currency.format(order.totalPrice)}
          </span>
        </div>

        <div className="flex justify-between">
          <Link
            to="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
