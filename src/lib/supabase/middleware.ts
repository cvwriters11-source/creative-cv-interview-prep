import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) {
      return supabaseResponse;
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isAuthPage = path === "/login" || path === "/register";
    const isAdminPath =
      path.startsWith("/admin") || path.startsWith("/api/admin");
    const isProtected =
      isAdminPath ||
      path.startsWith("/interviews") ||
      path.startsWith("/interview/") ||
      path.startsWith("/results/") ||
      path.startsWith("/ats") ||
      path.startsWith("/api/interviews") ||
      path.startsWith("/api/realtime") ||
      path.startsWith("/api/ats");

    if (!user && isProtected) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 });
      }
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("next", path);
      return NextResponse.redirect(redirect);
    }

    if (user && isAdminPath) {
      const adminList = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const email = (user.email || "").toLowerCase();
      const isAdmin =
        user.app_metadata?.role === "admin" ||
        (adminList.length > 0 && adminList.includes(email));
      if (!isAdmin) {
        if (path.startsWith("/api/")) {
          return NextResponse.json({ error: "Admin only" }, { status: 403 });
        }
        const redirect = request.nextUrl.clone();
        redirect.pathname = "/interviews";
        redirect.search = "";
        return NextResponse.redirect(redirect);
      }
    }

    if (user && isAuthPage) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/interviews";
      redirect.search = "";
      return NextResponse.redirect(redirect);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[middleware]", err);
    return NextResponse.next({ request });
  }
}
