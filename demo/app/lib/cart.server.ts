import productsData from "../data/products.json";
import type { Cart, CartItem, Product } from "../types";
import { ENABLE_SIDE_EFFECTS } from "./config";
import { sql } from "./db.server";
import { scheduledAbandonedCartEmail } from "./emails.server";

type MaybeCartId = number | null | undefined;

/**
 * Gets a cart by ID or creates a new one if ID is not provided
 */
export async function getOrCreateCart(cartId: MaybeCartId) {
  // If we have a cart ID, try to get that cart
  if (cartId) {
    const existingCart = await sql<
      { id: number }[]
    >`SELECT id FROM carts WHERE id = ${cartId}`;
    if (existingCart.length > 0) {
      return existingCart[0];
    }
  }

  // If no cart found or no ID provided, create a new one
  const [cart] = await sql<
    { id: number }[]
  >`INSERT INTO carts DEFAULT VALUES RETURNING id`;
  return cart;
}

/**
 * Gets the current cart item count
 */
export async function getCartItemCount(cartId: MaybeCartId) {
  const cart = await getOrCreateCart(cartId);

  const [{ count }] = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM cart_items
    WHERE cart_id = ${cart.id}
  `;

  return count;
}

/**
 * Gets a list of product IDs currently in the cart
 */
export async function getCartProductIds(cartId: MaybeCartId) {
  const cart = await getOrCreateCart(cartId);

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
export async function getCartWithItems(cartId: MaybeCartId): Promise<Cart> {
  // Get the current cart
  const cart = await getOrCreateCart(cartId);

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

/**
 * Adds an item to the cart or increments its quantity if it already exists
 */
export async function addItemToCart(cartId: MaybeCartId, productId: number) {
  // Get or create a cart
  const cart = await getOrCreateCart(cartId);

  // Upsert the item into the cart
  await sql`
    INSERT INTO cart_items (cart_id, product_id)
    VALUES (${cart.id}, ${productId})
    ON CONFLICT (cart_id, product_id) DO NOTHING
  `;

  if (ENABLE_SIDE_EFFECTS) {
    // schedule an abandoned cart email for this cart if the user does not check out
    // FIXME: 1. what happens if scheduling the email fails?
    await scheduledAbandonedCartEmail(cart.id);
  }

  return cart.id;
}

/**
 * Removes an item from the cart
 */
export async function removeItemFromCart(cartId: MaybeCartId, itemId: string) {
  if (!cartId) {
    return;
  }

  // Delete the item from the cart
  await sql`DELETE FROM cart_items WHERE id = ${itemId} AND cart_id = ${cartId}`;
}

/**
 * Adds multiple items to the cart at once
 * Useful for adding bundles or collections of products
 */
export async function addMultipleItemsToCart(
  cartId: MaybeCartId,
  productIds: number[],
) {
  // Get or create a cart
  const cart = await getOrCreateCart(cartId);

  // Bulk insert cart items using postgres-js dynamic inserts
  const inserts = productIds.map((id) => {
    return { cart_id: cart.id, product_id: id };
  });
  await sql`
    INSERT INTO cart_items
    ${sql(inserts)}
    ON CONFLICT (cart_id, product_id) DO NOTHING
  `;

  // FIXME: 99. we forgot side effects here

  return cart.id;
}
