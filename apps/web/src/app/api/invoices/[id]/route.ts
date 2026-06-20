import { NextRequest } from "next/server";
import { prisma } from "@smartmenu/db";
import {
  getAuthUser,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, businessId: user.businessId },
      include: {
        items: {
          include: {
            menuItem: { select: { name: true, imageUrl: true } },
          },
        },
      },
    });

    if (!invoice) return notFoundResponse("Invoice not found");

    return Response.json({ invoice });
  } catch (error) {
    console.error("Get invoice error:", error);
    return serverErrorResponse();
  }
}
