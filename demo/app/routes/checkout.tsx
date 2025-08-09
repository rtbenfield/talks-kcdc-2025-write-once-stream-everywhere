import { data, Link, redirect, useLoaderData } from "react-router";
import { performCheckout } from "~/lib/checkout.server";
import { getCartWithItems } from "../lib/cart.server";
import {
  getCartIdFromSession,
  setCartIdInSession,
} from "../lib/session.server";
import type { Route } from "./+types/checkout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checkout | E-Commerce Demo" },
    { name: "description", content: "Complete your purchase" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Get cart ID from session or create a new cart
  const cartId = await getCartIdFromSession(request);
  const headers = new Headers();

  // Get the cart with all items and product details
  const cart = await getCartWithItems(cartId);

  // If we didn't have a cart ID or it changed, update the session
  if (!cartId || cartId !== cart.id) {
    headers.set("Set-Cookie", await setCartIdInSession(request, cart.id));
  }

  return data(
    {
      cartId: cart.id,
      items: cart.items,
      totalPrice: cart.totalPrice,
    },
    { headers },
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "complete") {
    // Get cart ID from session
    const cartId = await getCartIdFromSession(request);

    if (!cartId) {
      return redirect("/products");
    }

    // In a real app, we would process payment here
    const { orderId } = await performCheckout(cartId);

    // Clear cart from session after successful checkout
    const session = await getCartIdFromSession(request);
    const headers = {
      "Set-Cookie": await setCartIdInSession(request, null),
    };

    return data({ success: true, orderId }, { headers });
  } else {
    return data({ success: false });
  }
}

export default function Checkout() {
  const { items, totalPrice } = useLoaderData<typeof loader>();

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Checkout
        </h1>
        <div className="text-center py-8">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Your cart is empty
          </p>
          <Link
            to="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Order Summary
            </h2>

            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {item.product.description}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${item.product.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                Total
              </span>
              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Complete Order
            </h2>
            <form method="post">
              <input type="hidden" name="intent" value="complete" />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-medium"
              >
                Complete Purchase
              </button>
            </form>

            <div className="mt-4">
              <Link
                to="/cart"
                className="block w-full text-center border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 py-3 rounded font-medium dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
