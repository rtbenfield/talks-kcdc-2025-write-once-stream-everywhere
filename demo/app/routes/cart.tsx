import { data, Link, redirect, useLoaderData } from "react-router";
import { currency } from "~/lib/formatters";
import {
  addItemToCart,
  getCartWithItems,
  removeItemFromCart,
} from "../lib/cart.server";
import {
  getCartIdFromSession,
  setCartIdInSession,
} from "../lib/session.server";
import type { Route } from "./+types/cart";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shopping Cart | E-Commerce Demo" },
    { name: "description", content: "View your shopping cart" },
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

  const cartId = await getCartIdFromSession(request);

  if (intent === "add") {
    const productId = Number(formData.get("productId"));

    // Add item to cart and get the cart ID
    const newCartId = await addItemToCart(cartId, productId);

    // Set cookie header for the redirect
    const headers = {
      "Set-Cookie": await setCartIdInSession(request, newCartId),
    };

    return redirect("/cart", { headers });
  }

  if (intent === "remove") {
    const itemId = formData.get("itemId");

    if (typeof itemId !== "string") {
      return { error: "Invalid item ID" };
    }

    // Get cart ID from session
    const cartId = await getCartIdFromSession(request);

    if (!cartId) {
      return redirect("/products");
    }

    // Remove the item from the cart
    await removeItemFromCart(cartId, itemId);

    // Set cookie header for the redirect
    const headers = {
      "Set-Cookie": await setCartIdInSession(request, cartId),
    };

    // Redirect back to the cart page
    return redirect("/cart", { headers });
  }

  return redirect("/cart");
}

// Using the utility function from cart.server.ts

export default function Cart() {
  const { items, totalPrice } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Your Cart
      </h1>

      {items.length === 0 ? (
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
      ) : (
        <>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-4 text-gray-900 dark:text-gray-100">
                    Product
                  </th>
                  <th className="text-right p-4 text-gray-900 dark:text-gray-100">
                    Price
                  </th>
                  <th className="text-right p-4 text-gray-900 dark:text-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {item.product.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {item.product.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-900 dark:text-gray-100">
                      {currency.format(item.product.price)}
                    </td>
                    <td className="p-4 text-right">
                      <form method="post">
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="intent" value="remove" />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                    Total
                  </td>
                  <td className="p-4 text-right font-bold text-gray-900 dark:text-gray-100">
                    {currency.format(totalPrice)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-between">
            <Link
              to="/products"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded"
            >
              Continue Shopping
            </Link>
            <Link
              to="/checkout"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
