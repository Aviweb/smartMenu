import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@smartmenu/db";
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth";

const invoiceItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

const createInvoiceSchema = z.object({
  items: z.array(invoiceItemSchema).min(1),
});

async function generateInvoiceNumber(businessId: string): Promise<string> {
  const count = await prisma.invoice.count({ where: { businessId } });
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `INV-${year}${month}-${String(count + 1).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const search = req.nextUrl.searchParams.get("search");
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

    const invoices = await prisma.invoice.findMany({
      where: {
        businessId: user.businessId,
        ...(search ? { invoiceNumber: { contains: search, mode: "insensitive" } } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            menuItem: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.invoice.count({
      where: { businessId: user.businessId },
    });

    return Response.json({ invoices, total, page, limit });
  } catch (error) {
    console.error("Get invoices error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const totalAmount = parsed.data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const invoiceNumber = await generateInvoiceNumber(user.businessId);

    const invoice = await prisma.invoice.create({
      data: {
        businessId: user.businessId,
        invoiceNumber,
        totalAmount,
        items: {
          create: parsed.data.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: { select: { name: true } },
          },
        },
      },
    });

    return Response.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return serverErrorResponse();
  }
}
