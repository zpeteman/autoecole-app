import { Handler } from "$fresh/server.ts";
import { Database } from "../db/kv.ts";

// In a real application, you would use a secure password hashing library
// and store the hashed password in a database
// For this simple example, we'll use a file to store the password
const PASSWORD_FILE = "password.txt";

export const handler: Handler = async (req) => {
  const formData = await req.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  // Initialize database if it's empty
  if (await Database.isDatabaseEmpty()) {
    await Database.initializeDatabase();
  }

  // Get user from database
  const user = await Database.getUser(username as string);
  
  if (user && user.password === password) {
    // Set a session cookie
    const headers = new Headers();
    headers.append("Set-Cookie", "session=authenticated; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400");
    
    // Redirect to the home page
    return new Response(null, {
      status: 302,
      headers: {
        ...Object.fromEntries(headers),
        "Location": "/",
      },
    });
  }

  // Authentication failed
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/login?error=1",
    },
  });
}; 