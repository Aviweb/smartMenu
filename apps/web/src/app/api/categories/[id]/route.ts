import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@smartmenu/db";
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/auth";

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const existing = await prisma.category.findFirst({
      where: { id, businessId: user.businessId },
    });
    if (!existing) return notFoundResponse("Category not found");

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    return Response.json({ category });
  } catch (error) {
    console.error("Update category error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.category.findFirst({
      where: { id, businessId: user.businessId },
    });
    if (!existing) return notFoundResponse("Category not found");

    await prisma.category.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return serverErrorResponse();
  }
}
