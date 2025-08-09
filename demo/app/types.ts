// Define product type
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

// Define cart item type
export interface CartItem {
  id: number;
  productId: number;
  product: Product;
}

// Define cart type
export interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
}
