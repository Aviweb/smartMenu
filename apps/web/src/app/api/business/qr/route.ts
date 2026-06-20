import { NextRequest } from "next/server";
import QRCode from "qrcode";
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

    const business = await prisma.business.findUnique({
      where: { id: user.businessId },
      select: { slug: true },
    });

    if (!business) return Response.json({ error: "Not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smartmenu.app";
    const menuUrl = `${appUrl}/menu/${business.slug}`;

    const format = req.nextUrl.searchParams.get("format") || "png";

    if (format === "svg") {
      const svg = await QRCode.toString(menuUrl, { type: "svg" });
      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="qr-${business.slug}.svg"`,
        },
      });
    }

    const pngBuffer = await QRCode.toBuffer(menuUrl, {
      type: "png",
      width: 400,
      margin: 2,
    });

    return new Response(pngBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-${business.slug}.png"`,
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return serverErrorResponse();
  }
}
