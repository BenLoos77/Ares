import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, StatusChip } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });

  const contents = await prisma.content.findMany({
    where: {
      brandId: brand!.id,
      scheduledAt: { not: null },
    },
    orderBy: { scheduledAt: "asc" },
    take: 200,
  });

  // group by week
  const grouped = new Map<string, typeof contents>();
  for (const c of contents) {
    if (!c.scheduledAt) continue;
    const d = new Date(c.scheduledAt);
    const key = `${d.getFullYear()}-W${Math.ceil((d.getDate() + (d.getDay() || 7) - 1) / 7)}-${d.getMonth() + 1}`;
    const arr = grouped.get(key) || [];
    arr.push(c);
    grouped.set(key, arr);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Redaktionskalender</h1>
      <p className="text-sm text-gray-500">
        MVP-Ansicht: nach Datum sortiert. Monats-Grid + Drag & Drop kommt in Phase 2.
      </p>
      {contents.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center text-gray-600">
            Kein geplanter Content. Öffne einen Content-Eintrag und setze ein Veröffentlichungsdatum.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100">
              {contents.map((c) => (
                <li key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.type}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusChip status={c.status} />
                    <span className="text-xs text-gray-600">{formatDate(c.scheduledAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
