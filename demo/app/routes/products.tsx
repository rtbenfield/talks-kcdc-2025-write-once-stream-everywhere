import { data, Link, redirect, useLoaderData } from "react-router";
import productsData from "../data/products.json";
import {
  addItemToCart,
  addMultipleItemsToCart,
  getCartWithItems,
} from "../lib/cart.server";
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

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const headers = new Headers();

  // Get cart ID from session
  const cartId = await getCartIdFromSession(request);

  if (intent === "add") {
    const productId = Number(formData.get("productId"));

    // Add item to cart and get the cart ID
    const newCartId = await addItemToCart(cartId, productId);

    // Set cookie header for the redirect
    headers.set("Set-Cookie", await setCartIdInSession(request, newCartId));
  } else if (intent === "add-bundle") {
    const bundleItems = formData.get("bundleItems");
    if (bundleItems) {
      const productIds = bundleItems.toString().split(",").map(Number);

      // Add multiple items to cart and get the cart ID
      const newCartId = await addMultipleItemsToCart(cartId, productIds);

      // Set cookie header for the redirect
      headers.set("Set-Cookie", await setCartIdInSession(request, newCartId));
    }
  }

  return redirect("/products", { headers });
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

// Define our bundle products - Keyboard, Mouse, and Laptop Stand
const BUNDLE_PRODUCT_IDS = [1, 2, 8];

export default function Products() {
  const { products, cartItemCount, productsInCart } =
    useLoaderData<typeof loader>();

  // Get the bundle products
  const bundleProducts = products.filter((product) =>
    BUNDLE_PRODUCT_IDS.includes(product.id),
  );

  // Calculate bundle total price
  const bundleTotalPrice = bundleProducts.reduce(
    (sum, product) => sum + product.price,
    0,
  );

  // Check if all bundle products are already in cart
  const allBundleItemsInCart = BUNDLE_PRODUCT_IDS.every((id) =>
    productsInCart.includes(id),
  );
  
  // Count how many bundle items are already in cart
  const bundleItemsInCartCount = BUNDLE_PRODUCT_IDS.filter((id) =>
    productsInCart.includes(id),
  ).length;

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

      {/* Suggested Bundle Section - only show if not all items are in cart */}
      {!allBundleItemsInCart && (
        <div className="mb-10 p-6 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/30">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Suggested Bundle: Workstation Essentials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {bundleProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {product.description}
              </p>
              <div className="mt-4">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ${product.price.toFixed(2)}
                </span>
                {productsInCart.includes(product.id) && (
                  <span className="ml-3 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                    In Cart
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bundle Price:{" "}
              <span className="text-xl">${bundleTotalPrice.toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get all three items for your perfect workstation setup!
            </p>
          </div>
          <form method="post" className="mt-4 md:mt-0">
            <input
              type="hidden"
              name="bundleItems"
              value={BUNDLE_PRODUCT_IDS.join(",")}
            />
            <input type="hidden" name="intent" value="add-bundle" />
            <button
              type="submit"
              disabled={allBundleItemsInCart}
              className={`px-6 py-2 rounded-lg font-medium ${
                allBundleItemsInCart
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {bundleItemsInCartCount > 0
                ? `Add ${BUNDLE_PRODUCT_IDS.length - bundleItemsInCartCount} Remaining Items`
                : "Add Bundle to Cart"}
            </button>
          </form>
        </div>
      </div>
      )}

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
              <form method="post">
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
