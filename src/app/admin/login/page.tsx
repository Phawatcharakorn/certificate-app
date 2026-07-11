import { loginAdmin } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-xl font-semibold">เข้าสู่ระบบแอดมิน</h1>
      <LoginForm action={loginAdmin} submitLabel="เข้าสู่ระบบแอดมิน" />
    </main>
  );
}
