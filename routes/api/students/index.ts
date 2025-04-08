import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";
import { Student } from "../../../db/types.ts";

async function saveImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = new Uint8Array(bytes);
  
  // Create a unique filename
  const filename = `${crypto.randomUUID()}-${file.name}`;
  const path = `./static/uploads/${filename}`;
  
  // Ensure the uploads directory exists
  try {
    await Deno.mkdir("./static/uploads", { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
  
  // Save the file
  await Deno.writeFile(path, buffer);
  
  // Return the public URL
  return `/uploads/${filename}`;
}

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

  async POST(req, _ctx) {
    try {
      const formData = await req.formData();
      
      // Handle image upload
      let image_url: string | undefined;
      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile.size > 0) {
        image_url = await saveImage(imageFile);
      }

      // Create the new student
      const newStudent: Omit<Student, "id"> = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        national_id: formData.get("national_id") as string,
        status: formData.get("status") as "active" | "inactive",
        payment_status: formData.get("payment_status") as "complete" | "partial" | "not_defined",
        total_fees: formData.get("total_fees") ? parseFloat(formData.get("total_fees") as string) : undefined,
        birthday: formData.get("birthday") as string,
        date_of_registration: new Date().toISOString().split('T')[0],
        image_url,
      };

      const student = await Database.createStudent(newStudent);
      
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/students/${student.id}`,
        },
      });
    } catch (error) {
      console.error("Error creating student:", error);
      return new Response("Error creating student", { status: 500 });
    }
  },
}; 