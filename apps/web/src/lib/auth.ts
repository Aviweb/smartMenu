import { NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "./jwt";

export async function getAuthUser(
  req: NextRequest
): Promise<JWTPayload | null> {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("token")?.value;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function badRequestResponse(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function notFoundResponse(message = "Not found") {
  return Response.json({ error: message }, { status: 404 });
}

export function serverErrorResponse(message = "Internal server error") {
  return Response.json({ error: message }, { status: 500 });
}
