import { NextRequest } from "next/server";
import { prisma } from "@smartmenu/db";
import {
  getAuthUser,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayInvoices, recentInvoices, topItems] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          businessId: user.businessId,
          createdAt: { gte: todayStart, lte: todayEnd },
        },
        select: { totalAmount: true },
      }),
      prisma.invoice.findMany({
        where: { businessId: user.businessId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: {
            include: { menuItem: { select: { name: true } } },
          },
        },
      }),
      prisma.invoiceItem.groupBy({
        by: ["menuItemId"],
        where: {
          invoice: { businessId: user.businessId },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const todayRevenue = todayInvoices.reduce(
      (sum: number, inv) => sum + Number(inv.totalAmount),
      0
    );
    const billsToday = todayInvoices.length;

    const topItemIds = topItems.map((t) => t.menuItemId);
    const topItemDetails = await prisma.menuItem.findMany({
      where: { id: { in: topItemIds } },
      select: { id: true, name: true, price: true },
    });

    const mostSoldItems = topItems.map((t) => ({
      menuItemId: t.menuItemId,
      totalQuantity: t._sum.quantity,
      menuItem: topItemDetails.find((d) => d.id === t.menuItemId),
    }));

    return Response.json({
      todayRevenue,
      billsToday,
      recentInvoices,
      mostSoldItems,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return serverErrorResponse();
  }
}
