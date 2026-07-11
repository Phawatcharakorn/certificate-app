import { loginStudent } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-xl font-semibold">เข้าสู่ระบบนิสิต</h1>
      <LoginForm action={loginStudent} submitLabel="เข้าสู่ระบบ" />
    </main>
  );
}
