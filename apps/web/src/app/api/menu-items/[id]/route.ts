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

const updateMenuItemSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional().nullable(),
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
    const parsed = updateMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const existing = await prisma.menuItem.findFirst({
      where: { id, businessId: user.businessId },
    });
    if (!existing) return notFoundResponse("Menu item not found");

    const item = await prisma.menuItem.update({
      where: { id },
      data: parsed.data,
      include: { category: { select: { id: true, name: true } } },
    });

    return Response.json({ item });
  } catch (error) {
    console.error("Update menu item error:", error);
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

    const existing = await prisma.menuItem.findFirst({
      where: { id, businessId: user.businessId },
    });
    if (!existing) return notFoundResponse("Menu item not found");

    await prisma.menuItem.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete menu item error:", error);
    return serverErrorResponse();
  }
}
