import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, CardHeader, CardTitle, StatusChip } from "@/components/ui/Card";
import { formatCurrencyEUR, formatDateTime, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const brand = await prisma.brand.findFirst({
    where: { organizationId: session.user.organizationId },
    select: { id: true, name: true },
  });
  if (!brand) return null;

  const brandId = brand.id;
  const nowMinus30d = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  const [recs, myTasks, activeCampaigns, qualifiedLeads, pipelineValue, goals, published, planned] = await Promise.all([
    prisma.recommendation.findMany({
      where: { brandId, status: "open" },
      orderBy: { priorityScore: "desc" },
      take: 3,
    }),
    prisma.task.findMany({
      where: { brandId, assigneeId: session.user.id, status: { in: ["todo", "in_progress"] } },
      include: { relatedContent: { select: { title: true, type: true } } },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.campaign.count({ where: { brandId, status: "active" } }),
    prisma.lead.count({ where: { brandId, stage: { in: ["qualified", "proposal"] } } }),
    prisma.opportunity.aggregate({
      _sum: { amount: true },
      where: { stage: { in: ["qualified", "proposal", "negotiation"] }, lead: { brandId } },
    }),
    prisma.goal.findMany({ where: { brandId, status: "active" }, orderBy: { periodEnd: "asc" } }),
    prisma.content.count({ where: { brandId, status: "published", publishedAt: { gte: nowMinus30d } } }),
    prisma.content.count({ where: { brandId, createdAt: { gte: nowMinus30d } } }),
  ]);

  const executionRate = planned > 0 ? Math.round((published / planned) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{brand.name}</p>
      </div>

      {/* Next Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Actions</CardTitle>
        </CardHeader>
        <CardBody>
          {recs.length === 0 ? (
            <p className="text-sm text-gray-500">Keine offenen Empfehlungen. Alles im Plan.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {recs.map((r) => (
                <Link
                  key={r.id}
                  href={r.ctaTarget}
                  className="block border border-gray-200 rounded-md p-4 hover:border-brand-400 hover:shadow-sm transition"
                >
                  <div className="font-semibold text-sm text-gray-900">{r.title}</div>
                  <p className="text-xs text-gray-600 mt-2">{r.reasoning}</p>
                  <div className="text-xs font-medium text-brand-600 mt-3">Anpacken →</div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* KPI Row */}
      <div className="grid md:grid-cols-4 gap-4">
        <Kpi label="Execution-Rate (30T)" value={`${executionRate}%`} sub={`${published}/${planned}`} />
        <Kpi label="Aktive Kampagnen" value={String(activeCampaigns)} />
        <Kpi label="Qualifizierte Leads" value={String(qualifiedLeads)} />
        <Kpi label="Pipeline" value={formatCurrencyEUR(pipelineValue._sum.amount?.toString() ?? "0")} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Meine Aufgaben</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            {myTasks.length === 0 ? (
              <p className="text-sm text-gray-500 px-5 py-4">Keine offenen Aufgaben.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {myTasks.map((t) => (
                  <li key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{t.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {t.dueDate ? `Fällig ${formatDateTime(t.dueDate)}` : "Kein Termin"}
                      </div>
                    </div>
                    <StatusChip status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Ziele</CardTitle>
          </CardHeader>
          <CardBody>
            {goals.length === 0 ? (
              <p className="text-sm text-gray-500">Noch keine aktiven Ziele.</p>
            ) : (
              <div className="space-y-4">
                {goals.map((g) => {
                  const target = Number(g.targetValue);
                  const current = Number(g.currentValue);
                  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                  return (
                    <div key={g.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="font-medium text-gray-900">{g.title}</div>
                        <div className="text-gray-600">
                          {current} / {target} {g.unit}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {sub && <div className="text-xs text-gray-500">{sub}</div>}
        </div>
      </CardBody>
    </Card>
  );
}
