import { Handlers } from "$fresh/server.ts";
import { Database } from "../../db/kv.ts";
import { Student } from "../../db/types.ts";

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
  async POST(req) {
    const formData = await req.formData();
    
    // Handle image upload
    let image_url: string | undefined;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      image_url = await saveImage(imageFile);
    }

    const student: Omit<Student, "id"> = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      national_id: formData.get("national_id") as string,
      status: formData.get("status") as "active" | "inactive",
      payment_status: formData.get("payment_status") as "complete" | "partial" | "not_defined",
      date_of_registration: new Date().toISOString(),
      total_fees: formData.get("total_fees") ? parseFloat(formData.get("total_fees") as string) : undefined,
      image_url,
      birthday: formData.get("birthday") as string,
    };

    try {
      await Database.createStudent(student);
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/students",
        },
      });
    } catch (error) {
      console.error("Error creating student:", error);
      return new Response("Error creating student", { status: 500 });
    }
  },
}; 