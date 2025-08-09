import productsData from "../data/products.json";
import type { Cart, CartItem, Product } from "../types";
import { sql } from "./db.server";

/**
 * Gets or creates a cart and returns it
 */
export async function getOrCreateCart() {
  // Check if we have an existing cart
  let carts = await sql`SELECT * FROM carts ORDER BY created_at DESC LIMIT 1`;

  // If no cart exists, create one
  if (carts.length === 0) {
    carts = await sql`INSERT INTO carts DEFAULT VALUES RETURNING *`;
  }

  return carts[0];
}

/**
 * Gets the current cart item count
 */
export async function getCartItemCount() {
  const cart = await getOrCreateCart();

  const result = await sql`
    SELECT COUNT(*) as count
    FROM cart_items
    WHERE cart_id = ${cart.id}
  `;

  return result[0]?.count || 0;
}

/**
 * Gets a list of product IDs currently in the cart
 */
export async function getCartProductIds() {
  const cart = await getOrCreateCart();

  const items = await sql<{ product_id: number }[]>`
    SELECT product_id
    FROM cart_items
    WHERE cart_id = ${cart.id}
  `;

  return items.map((item) => item.product_id);
}

/**
 * Gets the cart with all items and product details
 */
export async function getCartWithItems(): Promise<Cart> {
  // Get the current cart
  const cart = await getOrCreateCart();

  // Get cart items
  const cartItems = await sql<{ id: number; product_id: number }[]>`
    SELECT id, product_id
    FROM cart_items
    WHERE cart_id = ${cart.id}
  `;

  // Type assertion for our static JSON data
  const { products } = productsData satisfies { products: Product[] };

  // Map cart items to include product details from our static JSON
  const itemsWithDetails: CartItem[] = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return {
      id: item.id,
      productId: item.product_id,
      product: product || {
        id: item.product_id,
        name: "Unknown Product",
        price: 0,
        description: "",
      },
    };
  });

  // Calculate total price
  const totalPrice = itemsWithDetails.reduce(
    (sum, item) => sum + item.product.price,
    0,
  );

  return {
    id: cart.id,
    items: itemsWithDetails,
    totalPrice,
  };
}
