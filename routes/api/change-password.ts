import { Handler } from "$fresh/server.ts";
import { Database } from "../../db/kv.ts";

// In a real application, you would use a secure password hashing library
// and store the hashed password in a database
// For this simple example, we'll use a file to store the password
const PASSWORD_FILE = "password.txt";

export const handler: Handler = async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the request body
    const { currentPassword, newPassword } = await req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ message: "Current password and new password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the current password is correct
    // In a real application, you would compare with a hashed password
    const storedPassword = await Deno.readTextFile(PASSWORD_FILE).catch(() => "password");
    
    if (currentPassword !== storedPassword) {
      return new Response(
        JSON.stringify({ message: "Current password is incorrect" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update the password
    // In a real application, you would hash the password before storing
    await Deno.writeTextFile(PASSWORD_FILE, newPassword);

    // Return success
    return new Response(
      JSON.stringify({ message: "Password updated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return new Response(
      JSON.stringify({ message: "An error occurred while changing the password" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}; 