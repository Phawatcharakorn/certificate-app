import Link from "next/link";

const LINKS = [
  { href: "/certificate-criteria", label: "ระบบสารสนเทศนิสิต" },
  { href: "/certificate-criteria", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/certificate-criteria", label: "ติดต่อสอบถาม" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-900 px-4 py-5 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-3 text-xs text-slate-400 sm:flex-row sm:text-sm">
        <p>&copy; 2026 Kasetsart University Sriracha Campus. All rights reserved.</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-teal-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
