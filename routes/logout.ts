import { Handler } from "$fresh/server.ts";

export const handler: Handler = async (req) => {
  // Clear the session cookie
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    "session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
  );
  
  // Redirect to the login page
  return new Response(null, {
    status: 302,
    headers: {
      ...Object.fromEntries(headers),
      "Location": "/login",
    },
  });
}; 