import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, CardHeader, CardTitle, StatusChip } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CampaignDetail({ params }: { params: { id: string } }) {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });
  if (!brand) return notFound();
  const c = await prisma.campaign.findFirst({
    where: { id: params.id, brandId: brand.id },
    include: {
      contents: true,
      tasks: true,
      goal: true,
      targetPersona: true,
    },
  });
  if (!c) return notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1"><StatusChip status={c.status} /></div>
          <h1 className="text-2xl font-bold">{c.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(c.startDate)} – {formatDate(c.endDate)} · Kanäle: {c.channels.join(", ") || "—"}
          </p>
        </div>
      </div>

      {c.brief && (
        <Card>
          <CardHeader><CardTitle>Briefing</CardTitle></CardHeader>
          <CardBody className="text-sm whitespace-pre-wrap">{c.brief}</CardBody>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Verbundener Content ({c.contents.length})</CardTitle></CardHeader>
        <CardBody className="p-0">
          {c.contents.length === 0 ? (
            <p className="text-sm text-gray-500 p-4">Noch kein Content in dieser Kampagne.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {c.contents.map((ct) => (
                <li key={ct.id} className="p-4 flex items-center justify-between">
                  <Link href={`/app/content/${ct.id}`} className="font-medium hover:text-brand-600">
                    {ct.title}
                  </Link>
                  <StatusChip status={ct.status} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tasks ({c.tasks.length})</CardTitle></CardHeader>
        <CardBody className="p-0">
          {c.tasks.length === 0 ? (
            <p className="text-sm text-gray-500 p-4">Keine Tasks.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {c.tasks.map((t) => (
                <li key={t.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{t.title}</div>
                    <div className="text-xs text-gray-500">
                      {t.dueDate ? `Fällig ${formatDate(t.dueDate)}` : "Kein Termin"}
                    </div>
                  </div>
                  <StatusChip status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
