import { FileText } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const showGithub = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
  );
  const showGoogle = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
  );

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText aria-hidden className="size-4" />
          </div>
          One MD
        </Link>
        <LoginForm showGithub={showGithub} showGoogle={showGoogle} />
      </div>
    </div>
  );
}
