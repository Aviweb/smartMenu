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

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const existing = await prisma.menuItem.findFirst({
      where: { id, businessId: user.businessId },
    });
    if (!existing) return notFoundResponse("Menu item not found");

    const item = await prisma.menuItem.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return Response.json({ item });
  } catch (error) {
    console.error("Update status error:", error);
    return serverErrorResponse();
  }
}
