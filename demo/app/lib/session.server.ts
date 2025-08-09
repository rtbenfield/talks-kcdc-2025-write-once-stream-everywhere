import { createCookieSessionStorage } from "react-router";

// Create a session storage that uses cookies
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "cart_session",
    // Secure in production, not in development
    secure: process.env.NODE_ENV === "production",
    secrets: ["s3cr3t"], // In production, use a proper secret from env vars
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

// Get the session from the request
export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

// Commit the session and get the headers
export async function commitSession(session: any) {
  return sessionStorage.commitSession(session);
}

// Cart session utilities
export async function getCartIdFromSession(
  request: Request,
): Promise<number | null> {
  const session = await getSession(request);
  const cartId = session.get("cartId");
  return cartId ? Number(cartId) : null;
}

export async function setCartIdInSession(
  request: Request,
  cartId: number | null,
) {
  const session = await getSession(request);
  if (cartId === null) {
    session.unset("cartId");
  } else {
    session.set("cartId", cartId);
  }
  return commitSession(session);
}
