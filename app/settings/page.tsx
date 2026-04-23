import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-semibold text-2xl text-gray-900">设置</h1>
      <p className="mt-2 text-gray-600 text-sm">
        已登录为：{session.user.email ?? session.user.name ?? "用户"}
      </p>
      <p className="mt-4 text-gray-500 text-sm">
        用户相关选项可在此扩展（通知、资料等）。
      </p>
      <Link
        className="mt-8 inline-block text-gray-600 text-sm underline hover:text-gray-900"
        href="/"
      >
        返回编辑器
      </Link>
    </main>
  );
}
