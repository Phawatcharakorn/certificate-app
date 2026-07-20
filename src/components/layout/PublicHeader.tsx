import Link from "next/link";
import { Header, HeaderNavLink } from "@/components/layout/Header";
import { buttonHeaderCta } from "@/lib/ui";

/** Header used on every logged-out page: nav links + login/register CTA. */
export function PublicHeader({ active }: { active?: "projects" | "criteria" }) {
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
      }
    />
  );
}
