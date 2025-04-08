import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    try {
      const students = await Database.listStudents();
      return new Response(JSON.stringify(students), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch students" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 