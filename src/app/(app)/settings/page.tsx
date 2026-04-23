import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    where: { organizationId: session!.user.organizationId },
    orderBy: { createdAt: "asc" },
  });
  const org = await prisma.organization.findUnique({
    where: { id: session!.user.organizationId },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Organisation</CardTitle></CardHeader>
        <CardBody className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span>{org?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Plan</span>
            <Badge tone="blue">{org?.plan}</Badge>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Team ({users.length})</CardTitle></CardHeader>
        <CardBody className="p-0">
          <ul className="divide-y divide-gray-100">
            {users.map((u) => (
              <li key={u.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <Badge tone="gray">{u.role}</Badge>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dein Account</CardTitle></CardHeader>
        <CardBody className="text-sm text-gray-700 space-y-1">
          <div>Name: {session?.user.name}</div>
          <div>E-Mail: {session?.user.email}</div>
          <div>Rolle: <Badge tone="gray">{session?.user.role}</Badge></div>
        </CardBody>
      </Card>
    </div>
  );
}
