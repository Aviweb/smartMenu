import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@smartmenu/db";
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth";

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const categories = await prisma.category.findMany({
      where: { businessId: user.businessId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return Response.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const category = await prisma.category.create({
      data: {
        businessId: user.businessId,
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder,
      },
    });

    return Response.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return serverErrorResponse();
  }
}
