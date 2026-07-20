export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  coverImage?: string | null;
  quantity: number;
};

export const CART_KEY = "evtinko_cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const cart = readCart();
  const existing = cart.find((c) => c.productId === item.productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  writeCart(cart);
  return cart;
}

export function updateCartQty(productId: string, quantity: number) {
  let cart = readCart();
  if (quantity <= 0) {
    cart = cart.filter((c) => c.productId !== productId);
  } else {
    cart = cart.map((c) => (c.productId === productId ? { ...c, quantity } : c));
  }
  writeCart(cart);
  return cart;
}

export function removeFromCart(productId: string) {
  const cart = readCart().filter((c) => c.productId !== productId);
  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart([]);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
