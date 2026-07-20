import { Header, HeaderNavLink } from "@/components/layout/Header";
import {
  ProfileMenu,
  ProfileMenuButton,
  ProfileMenuLink,
} from "@/components/layout/ProfileMenu";
import { signOut } from "@/app/actions/auth";

/** Header used on every page a logged-in student can reach — keeps the nav
 *  and profile menu visible everywhere so navigating never looks like a
 *  forced logout (see: /projects previously always showing the logged-out
 *  login/register CTA even with an active session). */
export function StudentHeader({
  active,
  name,
  subtitle,
}: {
  active?: "dashboard" | "projects" | "certificates";
  name: string;
  subtitle?: string;
}) {
  return (
    <Header
      homeHref="/dashboard"
      nav={
        <>
          <HeaderNavLink href="/dashboard" active={active === "dashboard"}>
            หน้าหลัก
          </HeaderNavLink>
          <HeaderNavLink href="/projects" active={active === "projects"}>
            โครงการ
          </HeaderNavLink>
          <HeaderNavLink
            href="/certificates"
            active={active === "certificates"}
          >
            สถานะ Certificate
          </HeaderNavLink>
        </>
      }
      right={
        <ProfileMenu name={name} subtitle={subtitle}>
          {active === "certificates" ? (
            <ProfileMenuLink href="/dashboard">กลับหน้าหลัก</ProfileMenuLink>
          ) : (
            <ProfileMenuLink href="/certificates">
              สถานะใบ Certificate
            </ProfileMenuLink>
          )}
          <div className="my-1 border-t border-slate-100" />
          <form action={signOut}>
            <ProfileMenuButton type="submit" danger>
              ออกจากระบบ
            </ProfileMenuButton>
          </form>
        </ProfileMenu>
      }
    />
  );
}
