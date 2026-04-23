"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const NAME_PARTS = /\s+/;

function initialsFromSession(
  email: string | null | undefined,
  name: string | null | undefined
) {
  if (name?.trim()) {
    const parts = name.trim().split(NAME_PARTS);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
        .toUpperCase()
        .slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (status === "loading") {
    return (
      <div
        aria-hidden
        className="size-9 shrink-0 animate-pulse rounded-full bg-gray-200"
      />
    );
  }

  if (!session?.user) {
    return (
      <Link
        className="shrink-0 rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-100"
        href="/login"
      >
        登录
      </Link>
    );
  }

  const { user } = session;
  const label = initialsFromSession(user.email, user.name);
  const imageUrl = user.image;

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 ring-offset-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {imageUrl ? (
          // 头像可能来自任意域名，使用原生 img 避免为每个域名配置 remotePatterns
          // biome-ignore lint/performance/noImgElement: 任意第三方头像 URL
          <img
            alt=""
            className="size-full object-cover"
            height={36}
            src={imageUrl}
            width={36}
          />
        ) : (
          <span className="font-medium text-gray-700 text-xs">{label}</span>
        )}
      </button>

      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          <div className="border-gray-100 border-b px-3 py-2">
            <p className="truncate font-medium text-gray-900 text-sm">
              {user.name ?? "用户"}
            </p>
            {user.email ? (
              <p className="truncate text-gray-500 text-xs">{user.email}</p>
            ) : null}
          </div>
          <Link
            className="block px-3 py-2 text-gray-700 text-sm hover:bg-gray-50"
            href="/settings"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            设置
          </Link>
          <button
            className="w-full px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" }).catch(() => {
                // ignore sign-out errors
              });
            }}
            role="menuitem"
            type="button"
          >
            退出登录
          </button>
        </div>
      ) : null}
    </div>
  );
}
