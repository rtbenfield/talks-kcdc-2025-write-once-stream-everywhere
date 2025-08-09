import productsData from "../data/products.json";
import type { Product } from "../types";
import { sql } from "./db.server";

export type OrderItem = {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  createdAt: string;
  items: OrderItem[];
  totalPrice: number;
};

/**
 * Gets an order by ID with all its items and product details
 */
export async function getOrderById(orderId: number): Promise<Order | null> {
  // Get the order
  const orders = await sql<{ id: number; created_at: string }[]>`
    SELECT id, created_at
    FROM orders
    WHERE id = ${orderId}
  `;

  if (orders.length === 0) {
    return null;
  }

  const order = orders[0];

  // Get order items
  const orderItems = await sql<
    { id: number; product_id: number; price: string }[]
  >`
    SELECT id, product_id, price
    FROM order_items
    WHERE order_id = ${orderId}
  `;

  // Type assertion for our static JSON data
  const { products } = productsData satisfies { products: Product[] };

  // Map order items to include product details from our static JSON
  const itemsWithDetails: OrderItem[] = orderItems.map((item) => {
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
      quantity: 1,
      price: Number(item.price),
    };
  });

  // Calculate total price
  const totalPrice = itemsWithDetails.reduce(
    (sum, item) => sum + item.price,
    0,
  );

  return {
    id: order.id,
    createdAt: order.created_at,
    items: itemsWithDetails,
    totalPrice,
  };
}
