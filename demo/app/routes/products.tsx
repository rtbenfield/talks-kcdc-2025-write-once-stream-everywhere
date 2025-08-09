import { data, Link, useLoaderData } from "react-router";
import productsData from "../data/products.json";
import { getCartWithItems } from "../lib/cart.server";
import {
  getCartIdFromSession,
  setCartIdInSession,
} from "../lib/session.server";
import type { Product } from "../types";
import type { Route } from "./+types/products";

// Type assertion for our static JSON data
const { products } = productsData satisfies { products: Product[] };

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Products | E-Commerce Demo" },
    { name: "description", content: "Browse our products" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Get cart ID from session or create a new cart
  const cartId = await getCartIdFromSession(request);
  const headers = new Headers();

  // Get cart with items
  const cart = await getCartWithItems(cartId);

  // If we didn't have a cart ID or it changed, update the session
  if (!cartId || cartId !== cart.id) {
    headers.set("Set-Cookie", await setCartIdInSession(request, cart.id));
  }

  // Get product IDs in cart for disabling buttons
  const productsInCart = cart.items.map((item) => item.productId);

  return data(
    {
      products,
      cartItemCount: cart.items.length,
      productsInCart,
    },
    { headers },
  );
}

export default function Products() {
  const { products, cartItemCount, productsInCart } =
    useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Products
        </h1>
        <Link
          to="/cart"
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <span className="mr-2">Cart</span>
          {cartItemCount > 0 && (
            <span className="bg-white text-blue-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {product.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {product.description}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${product.price.toFixed(2)}
              </span>
              <form method="post" action="/cart">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="intent" value="add" />
                {productsInCart.includes(product.id) ? (
                  <button
                    type="button"
                    disabled
                    className="bg-gray-400 cursor-not-allowed text-white px-4 py-2 rounded"
                  >
                    In Cart
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Add to Cart
                  </button>
                )}
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
