import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@smartmenu/db";
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth";

const createMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const categoryId = req.nextUrl.searchParams.get("categoryId");
    const status = req.nextUrl.searchParams.get("status");

    const items = await prisma.menuItem.findMany({
      where: {
        businessId: user.businessId,
        ...(categoryId ? { categoryId } : {}),
        ...(status ? { status: status as "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED" } : { status: { not: "ARCHIVED" } }),
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return Response.json({ items });
  } catch (error) {
    console.error("Get menu items error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, businessId: user.businessId },
    });
    if (!category) return badRequestResponse("Category not found");

    const item = await prisma.menuItem.create({
      data: {
        businessId: user.businessId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        imageUrl: parsed.data.imageUrl,
        sortOrder: parsed.data.sortOrder,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return Response.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Create menu item error:", error);
    return serverErrorResponse();
  }
}
