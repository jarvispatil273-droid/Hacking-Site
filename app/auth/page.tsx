import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Access your AEGIS console.",
  path: "/auth",
  noindex: true,
});

export default function AuthPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12 sm:px-6">
      <div className="w-full">
        <AuthPanel />
      </div>
    </div>
  );
}
