import { NextRequest } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@smartmenu/db";
import { signToken } from "@/lib/jwt";
import { badRequestResponse, serverErrorResponse } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    });

    if (!user) {
      return badRequestResponse("Invalid email or password");
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return badRequestResponse("Invalid email or password");
    }

    const token = await signToken({
      userId: user.id,
      businessId: user.businessId,
      email: user.email,
      role: user.role,
    });

    return Response.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      business: {
        id: user.business.id,
        name: user.business.name,
        slug: user.business.slug,
        logoUrl: user.business.logoUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return serverErrorResponse();
  }
}
