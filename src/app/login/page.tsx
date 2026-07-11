import { loginStudent } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Header } from "@/components/layout/Header";
import { card } from "@/lib/ui";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className={`${card} w-full max-w-sm`}>
          <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">
            เข้าสู่ระบบนิสิต
          </h1>
          <LoginForm action={loginStudent} submitLabel="เข้าสู่ระบบ" />
        </div>
      </main>
    </>
  );
}
