import Link from "next/link";
import { ORG_INFO, SOCIAL_LINKS } from "@/lib/site-config";
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  XIcon,
} from "@/components/icons";

const QUICK_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/certificate-criteria", label: "หลักเกณฑ์ Certificate" },
  { href: "/faq", label: "คำถามที่พบบ่อย" },
];

const ADMIN_LINK = { href: "/admin", label: "Admin" };

const LEGAL_LINKS = [
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/terms", label: "ข้อกำหนดการใช้งาน" },
  { href: "/contact", label: "ติดต่อเรา" },
];

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  x: XIcon,
};

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-slate-400 transition hover:text-teal-300 hover:underline hover:underline-offset-4"
    >
      {label}
    </Link>
  );
}

export function Footer({ isAdmin = false }: { isAdmin?: boolean }) {
  const quickLinks = isAdmin ? [...QUICK_LINKS, ADMIN_LINK] : QUICK_LINKS;

  return (
    <footer className="border-t border-white/10 bg-slate-900 text-sm text-slate-400">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* Organization info */}
        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-semibold text-white">{ORG_INFO.name}</p>
          <p className="text-xs text-slate-500">{ORG_INFO.nameEn}</p>
          <ul className="mt-1 flex flex-col gap-2 text-xs leading-relaxed">
            <li className="flex items-start gap-2">
              <MapPinIcon width={15} height={15} className="mt-0.5 shrink-0" />
              <span>{ORG_INFO.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon width={15} height={15} className="shrink-0" />
              <a href={`tel:${ORG_INFO.phoneHref}`} className="hover:text-teal-300">
                {ORG_INFO.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MailIcon width={15} height={15} className="shrink-0" />
              <a href={`mailto:${ORG_INFO.email}`} className="hover:text-teal-300">
                {ORG_INFO.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            ลิงก์ด่วน
          </p>
          <nav className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <FooterLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        {/* Legal links */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            ข้อมูลทางกฎหมาย
          </p>
          <nav className="flex flex-col gap-2">
            {LEGAL_LINKS.map((link) => (
              <FooterLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        {/* Social */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            ติดตามเรา
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-teal-400/40 hover:bg-white/10 hover:text-teal-300"
                >
                  <Icon width={16} height={16} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <p className="mx-auto w-full max-w-4xl px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
          &copy; {new Date().getFullYear()} {ORG_INFO.nameEn}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
