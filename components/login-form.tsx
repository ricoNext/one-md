"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const OAUTH_CALLBACK = "/";

export function LoginForm({
  className,
  showGithub = false,
  showGoogle = false,
  ...props
}: React.ComponentProps<"div"> & {
  showGithub?: boolean;
  showGoogle?: boolean;
}) {
  const hasOAuth = showGithub || showGoogle;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">欢迎回来</CardTitle>
          <CardDescription>
            {hasOAuth
              ? "使用 GitHub 或 Google 登录。"
              : "尚未配置 OAuth：请在环境变量中设置 AUTH_GITHUB_* 或 AUTH_GOOGLE_*。"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {hasOAuth ? (
            <div className="flex flex-col gap-3">
              {showGithub ? (
                <Button
                  className="w-full justify-center gap-2"
                  onClick={async () => {
                    await signIn("github", {
                      callbackUrl: OAUTH_CALLBACK,
                    });
                  }}
                  type="button"
                  variant="outline"
                >
                  <Image
                    alt=""
                    className="size-4 shrink-0"
                    height={16}
                    src="/github.svg"
                    width={16}
                  />
                  使用 GitHub 登录
                </Button>
              ) : null}
              {showGoogle ? (
                <Button
                  className="w-full justify-center gap-2"
                  onClick={async () => {
                    await signIn("google", {
                      callbackUrl: OAUTH_CALLBACK,
                    });
                  }}
                  type="button"
                  variant="outline"
                >
                  <Image
                    alt=""
                    className="size-4 shrink-0"
                    height={16}
                    src="/google.svg"
                    width={16}
                  />
                  使用 Google 登录
                </Button>
              ) : null}
            </div>
          ) : (
            <FieldDescription className="text-center">
              至少配置一种 OAuth 提供商后重启开发服务器，即可在此登录。
            </FieldDescription>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
