import { NextResponse, type NextRequest } from "next/server";

// Password-protects /stats with HTTP Basic auth (any username, STATS_PASSWORD).
export function middleware(request: NextRequest) {
  const password = process.env.STATS_PASSWORD;
  const [scheme, encoded] = request.headers.get("authorization")?.split(" ") ?? [];
  if (password && scheme === "Basic" && encoded) {
    const supplied = atob(encoded).split(":").slice(1).join(":");
    if (supplied === password) return NextResponse.next();
  }
  return new NextResponse("Sign in to see stats.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Site stats"' },
  });
}

export const config = { matcher: "/stats" };
