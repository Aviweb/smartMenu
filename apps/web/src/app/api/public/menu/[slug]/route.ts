import { NextRequest } from "next/server";
import { prisma } from "@smartmenu/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const business = await prisma.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        description: true,
        logoUrl: true,
        slug: true,
        categories: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            name: true,
            sortOrder: true,
            menuItems: {
              where: { status: "ACTIVE" },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      return Response.json({ error: "Menu not found" }, { status: 404 });
    }

    return Response.json({ business });
  } catch (error) {
    console.error("Public menu error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
