import productsData from "../data/products.json";
import type { Product } from "../types";
import { sql } from "./db.server";

export async function performCheckout(cartId: number) {
  // Type assertion for our static JSON data
  const { products } = productsData satisfies { products: Product[] };

  return sql.begin(async (tx) => {
    // Retrieve and lock cart items
    const cartItems = await tx<{ product_id: number }[]>`
      SELECT product_id
      FROM cart_items
      WHERE cart_id = ${cartId}
      FOR UPDATE
    `;

    // Create a new order
    const orderResult = await tx<{ id: number }[]>`
      INSERT INTO orders DEFAULT VALUES RETURNING id
    `;

    const orderId = orderResult[0].id;

    // Insert all cart items into order_items
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.product_id);
      await tx`
        INSERT INTO order_items (order_id, product_id, price)
        VALUES (${orderId}, ${item.product_id}, ${product!.price})
      `;
    }

    // Clear the cart items
    await tx`DELETE FROM cart_items WHERE cart_id = ${cartId}`;

    return { orderId };
  });
}
