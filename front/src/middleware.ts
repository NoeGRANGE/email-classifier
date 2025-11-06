import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "fr"] as const;
const DEFAULT_LOCALE = "en" as const;

function isHtmlNavigation(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  return req.method === "GET" && accept.includes("text/html");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const url = req.nextUrl.clone();

  const searchForInvite = (_url: URL, res: NextResponse) => {
    const inviteToken = _url.searchParams.get("inviteToken");
    if (inviteToken) {
      _url.searchParams.delete("inviteToken");
      res.cookies.set("inviteToken", inviteToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }
  };

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    /\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map|txt|webmanifest)$/.test(
      pathname
    ) ||
    !isHtmlNavigation(req)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const [maybeLocale] = segments;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (maybeLocale && LOCALES.includes(maybeLocale as any)) {
    const res = NextResponse.next();
    res.cookies.set("locale", maybeLocale, { path: "/" });
    searchForInvite(url, res);
    return res;
  }

  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set("locale", DEFAULT_LOCALE, { path: "/" });
  searchForInvite(url, res);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
