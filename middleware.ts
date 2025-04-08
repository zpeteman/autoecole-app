import { MiddlewareHandlerContext } from "$fresh/server.ts";

// List of paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/auth", "/logout", "/api/students"];

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Check if the path is public
  if (PUBLIC_PATHS.some(p => path === p || path.startsWith(p + "/"))) {
    return ctx.next();
  }
  
  // Check for session cookie
  const sessionCookie = req.headers.get("cookie")?.includes("session=authenticated");
  
  if (!sessionCookie) {
    // Redirect to login page if not authenticated
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/login",
      },
    });
  }
  
  // Continue to the requested page
  return ctx.next();
} 