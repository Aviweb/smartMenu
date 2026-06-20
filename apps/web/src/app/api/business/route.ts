import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@smartmenu/db";
import {
  getAuthUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/auth";

const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const business = await prisma.business.findUnique({
      where: { id: user.businessId },
    });

    if (!business) return Response.json({ error: "Not found" }, { status: 404 });

    return Response.json({ business });
  } catch (error) {
    console.error("Get business error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();
    const parsed = updateBusinessSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const business = await prisma.business.update({
      where: { id: user.businessId },
      data: parsed.data,
    });

    return Response.json({ business });
  } catch (error) {
    console.error("Update business error:", error);
    return serverErrorResponse();
  }
}
