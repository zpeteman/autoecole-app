import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";
import { Exam } from "../../../db/types.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    return await handleExamUpdate(req, ctx.params.id);
  },
  async PUT(req, ctx) {
    return await handleExamUpdate(req, ctx.params.id);
  },
  async DELETE(_req, ctx) {
    try {
      console.log('Server: Attempting to delete exam:', ctx.params.id);
      await Database.deleteExam(ctx.params.id);
      console.log('Server: Exam deleted successfully');
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error("Server: Error deleting exam:", error);
      return new Response(JSON.stringify({ message: "Error deleting exam" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};

async function handleExamUpdate(req: Request, id: string) {
  const formData = await req.formData();

  const exam = await Database.getExam(id);
  if (!exam) {
    return new Response("Exam not found", { status: 404 });
  }

  const updatedExam: Partial<Exam> = {
    exam_type: formData.get("exam_type") as string,
    exam_date: formData.get("exam_date") as string,
    result: formData.get("result") as string,
    notes: formData.get("notes") as string,
  };

  try {
    await Database.updateExam(id, updatedExam);
    return new Response(null, {
      status: 303,
      headers: { Location: "/exams" },
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return new Response("Error updating exam", { status: 500 });
  }
} 