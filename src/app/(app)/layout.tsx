import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CopilotDock } from "@/components/layout/CopilotDock";
import { SessionProvider } from "next-auth/react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Onboarding-Check: wenn kein Brand existiert, zum Onboarding
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session.user.organizationId },
    select: { id: true },
  });
  if (!brand) redirect("/onboarding");

  return (
    <SessionProvider>
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar userName={session.user.name ?? session.user.email ?? "User"} role={session.user.role} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
        <CopilotDock />
      </div>
    </SessionProvider>
  );
}
