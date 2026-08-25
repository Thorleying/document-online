import { NextResponse, type NextRequest } from "next/server";
import { decryptSession } from "@/server/auth/session";
import { config as appConfig } from "@/config";

const ADMIN_PREFIX = "/admin";
const PUBLIC_ADMIN_PATHS = [`${ADMIN_PREFIX}/login`];

/**
 * 管理端路由的乐观鉴权：仅基于 Cookie 中的会话 JWT 重定向，不作数据库校验。
 * 每个受保护操作仍须在服务端独立调用 verifySession。
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  const isPublicAdmin = PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const token = request.cookies.get(appConfig.sessionCookieName)?.value;
  const session = await decryptSession(token);
  const isLoggedIn = Boolean(session?.userId);

  if (!isLoggedIn && !isPublicAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === `${ADMIN_PREFIX}/login`) {
    return NextResponse.redirect(new URL("/admin/documents", request.url));
  }

  if (pathname === ADMIN_PREFIX || pathname === `${ADMIN_PREFIX}/`) {
    return NextResponse.redirect(new URL("/admin/documents", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
