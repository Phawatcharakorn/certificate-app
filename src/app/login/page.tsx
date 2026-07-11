import { loginStudent } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className={`${card} anim-slide-up w-full max-w-sm`}>
          <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">
            เข้าสู่ระบบนิสิต
          </h1>
          {error === "not-student" && (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              บัญชีนี้ไม่มีข้อมูลนิสิตในระบบ (อาจเป็นบัญชีแอดมิน) กรุณาสมัครสมาชิกนิสิตที่หน้าลงทะเบียน หรือเข้าสู่ระบบด้วยบัญชีนิสิตของคุณ
            </p>
          )}
          <LoginForm action={loginStudent} submitLabel="เข้าสู่ระบบ" />
        </div>
      </main>
    </>
  );
}
