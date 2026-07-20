import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Header, HeaderNavLink } from "@/components/layout/Header";
import { LogOutIcon } from "@/components/icons";
import { buttonHeaderCta } from "@/lib/ui";

/** Header for logged-out visitors, plus an admin-aware variant.
 *  isAdmin=true replaces the login/register CTA with "กลับสู่ Admin" +
 *  sign out — otherwise an admin browsing the public site (e.g. via the
 *  AdminHeader's "หน้าเว็บหลัก" link) would see login/register buttons and
 *  it'd look like they'd been logged out, even though the session is
 *  still active. */
export function PublicHeader({
  active,
  isAdmin = false,
}: {
  active?: "projects" | "criteria";
  isAdmin?: boolean;
}) {
  return (
    <Header
      nav={
        <>
          <HeaderNavLink href="/projects" active={active === "projects"}>
            โครงการที่เปิดรับ
          </HeaderNavLink>
          <HeaderNavLink
            href="/certificate-criteria"
            active={active === "criteria"}
          >
            หลักเกณฑ์ Certificate
          </HeaderNavLink>
        </>
      }
      right={
        isAdmin ? (
          <>
            <Link
              href="/admin"
              className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              กลับสู่ Admin
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-teal-50/90 transition hover:bg-white/10"
              >
                <LogOutIcon width={14} height={14} />
                ออกจากระบบ
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden text-sm font-medium text-teal-50/85 hover:text-white sm:inline"
            >
              เข้าสู่ระบบนิสิต
            </Link>
            <Link href="/register" className={buttonHeaderCta}>
              สมัครสมาชิก
            </Link>
          </>
        )
      }
    />
  );
}
