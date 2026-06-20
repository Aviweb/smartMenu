import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth";
import { uploadFile, getStorageKey } from "@/lib/storage";

const uploadSchema = z.object({
  type: z.enum(["logo", "menu-item"]),
  filename: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;

    if (!file) return badRequestResponse("No file provided");

    const parsed = uploadSchema.safeParse({ type, filename: file.name });
    if (!parsed.success) return badRequestResponse(parsed.error.errors[0].message);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return badRequestResponse("Invalid file type. Only JPEG, PNG, WebP and GIF are allowed");
    }

    if (file.size > 5 * 1024 * 1024) {
      return badRequestResponse("File too large. Maximum size is 5MB");
    }

    const ext = file.name.split(".").pop() || "jpg";
    const storageType = parsed.data.type === "logo" ? "logos" : "menu-items";
    const key = getStorageKey(storageType, user.businessId, `${Date.now()}.${ext}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(key, buffer, file.type);

    return Response.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return serverErrorResponse();
  }
}
