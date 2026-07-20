import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Header } from "@/components/layout/Header";
import { HomeIcon, LogOutIcon } from "@/components/icons";
import { Breadcrumb, type Crumb } from "./Breadcrumb";
import { BackButton } from "./BackButton";

export function AdminHeader({
  crumbs,
  backHref,
}: {
  /** Trail rendered under the header, starting after "Admin" — e.g. [{ label: "จัดการนิสิต" }] */
  crumbs: Crumb[];
  /** Where the back button goes when there's no in-app history to return to (e.g. opened via bookmark). */
  backHref?: string;
}) {
  const allCrumbs: Crumb[] = [{ label: "Admin", href: "/admin" }, ...crumbs];

  return (
    <>
      <Header
        homeHref="/admin"
        right={
          <>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-teal-50/85 hover:text-white"
              title="กลับสู่หน้าเว็บหลัก"
            >
              <HomeIcon width={16} height={16} />
              <span className="hidden sm:inline">หน้าเว็บหลัก</span>
            </Link>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium">
              Manager
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
              >
                <LogOutIcon width={14} height={14} />
                ออกจากระบบ
              </button>
            </form>
          </>
        }
      />
      <Breadcrumb
        items={allCrumbs}
        leading={backHref ? <BackButton fallbackHref={backHref} /> : undefined}
      />
    </>
  );
}
