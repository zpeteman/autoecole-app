import { Handlers } from "$fresh/server.ts";
import { Database } from "../../../db/kv.ts";
import { Student } from "../../../db/types.ts";

async function saveImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = new Uint8Array(bytes);
  
  // Convert image to base64
  const base64 = btoa(String.fromCharCode(...buffer));
  const imageId = crypto.randomUUID();
  
  // Store in Deno KV
  await Database.kv.set(["images", imageId], {
    name: file.name,
    type: file.type,
    data: base64
  });
  
  // Return the image ID that can be used to fetch the image later
  return imageId;
}

// Add a new endpoint to serve images
export const handler: Handlers = {
  async GET(req, _ctx) {
    const url = new URL(req.url);
    const imageId = url.searchParams.get("image");
    
    if (imageId) {
      // Serve image if image ID is provided
      const result = await Database.kv.get(["images", imageId]);
      if (result.value) {
        const image = result.value as { type: string; data: string };
        const binaryData = Uint8Array.from(atob(image.data), c => c.charCodeAt(0));
        return new Response(binaryData, {
          headers: {
            "Content-Type": image.type,
            "Cache-Control": "public, max-age=31536000",
          },
        });
      }
      return new Response("Image not found", { status: 404 });
    }

    // List students if no image ID
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
      
      // Log received form data
      console.log("Received form data:", Object.fromEntries(formData.entries()));
      
      // Handle image upload
      let image_url: string | undefined;
      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile.size > 0) {
        try {
          image_url = await saveImage(imageFile);
          console.log("Image saved successfully:", image_url);
        } catch (error) {
          console.error("Error saving image:", error);
          // Continue without image if there's an error
        }
      }

      // Get required fields
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const national_id = formData.get("national_id") as string;
      const status = formData.get("status") as "active" | "inactive";
      const payment_status = formData.get("payment_status") as "complete" | "partial" | "not_defined";
      const birthday = formData.get("birthday") as string;

      // Validate required fields
      if (!name || !phone || !national_id || !status || !payment_status) {
        console.error("Missing required fields:", { name, phone, national_id, status, payment_status });
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Create the new student
      const newStudent: Omit<Student, "id"> = {
        name,
        phone,
        national_id,
        status,
        payment_status,
        total_fees: formData.get("total_fees") ? parseFloat(formData.get("total_fees") as string) : undefined,
        birthday,
        date_of_registration: new Date().toISOString().split('T')[0],
        image_url,
      };

      console.log("Creating student with data:", newStudent);

      const student = await Database.createStudent(newStudent);
      console.log("Student created successfully:", student);
      
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/students/${student.id}`,
        },
      });
    } catch (error) {
      console.error("Error creating student:", error);
      return new Response(JSON.stringify({ 
        error: "Error creating student", 
        details: error instanceof Error ? error.message : String(error)
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 