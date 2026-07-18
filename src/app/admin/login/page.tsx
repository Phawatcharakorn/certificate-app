import { loginAdmin } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

export default function AdminLoginPage() {
  return (
    <>
      <Header subtitle="เข้าสู่ระบบสำหรับผู้ดูแลระบบ" />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className={`${card} anim-slide-up w-full max-w-sm`}>
          <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">
            เข้าสู่ระบบแอดมิน
          </h1>
          <LoginForm
            action={loginAdmin}
            submitLabel="เข้าสู่ระบบแอดมิน"
            identifierName="identifier"
            identifierLabel="ชื่อผู้ใช้ หรือ อีเมล"
            identifierType="text"
          />
        </div>
      </main>
    </>
  );
}
