import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@smartmenu/db";
import { signToken } from "@/lib/jwt";
import { badRequestResponse, serverErrorResponse } from "@/lib/auth";

const registerSchema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  mobile: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(8),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let exists = await prisma.business.findUnique({ where: { slug } });
  let i = 1;
  while (exists) {
    slug = `${slugify(base)}-${i++}`;
    exists = await prisma.business.findUnique({ where: { slug } });
  }
  return slug;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.errors[0].message);
    }

    const { businessName, ownerName, mobile, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return badRequestResponse("Email already registered");
    }

    const passwordHash = await hash(password, 12);
    const slug = await uniqueSlug(businessName);

    const business = await prisma.business.create({
      data: {
        name: businessName,
        slug,
        phone: mobile,
      },
    });

    const user = await prisma.user.create({
      data: {
        businessId: business.id,
        name: ownerName,
        email,
        passwordHash,
        role: "owner",
      },
    });

    const token = await signToken({
      userId: user.id,
      businessId: business.id,
      email: user.email,
      role: user.role,
    });

    return Response.json(
      {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        business: { id: business.id, name: business.name, slug: business.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return serverErrorResponse();
  }
}
