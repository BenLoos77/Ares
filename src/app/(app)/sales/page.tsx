import Link from "next/link";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LEAD_STAGE_LABEL, LEAD_STAGE_ORDER } from "@/lib/constants";
import { relativeTime } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });

  const leads = await prisma.lead.findMany({
    where: { brandId: brand!.id, stage: { not: "lost" } },
    include: {
      owner: { select: { id: true, name: true } },
      persona: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const grouped = LEAD_STAGE_ORDER.reduce<Record<string, typeof leads>>((acc, s) => {
    acc[s] = leads.filter((l) => l.stage === s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">{leads.length} aktive Leads</p>
        </div>
        <Link href="/app/sales?new=1">
          <Button>
            <Plus className="h-4 w-4" /> Lead anlegen
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {LEAD_STAGE_ORDER.filter((s) => s !== "lost").map((stage) => (
          <div key={stage}>
            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
              <span>{LEAD_STAGE_LABEL[stage]}</span>
              <span className="text-gray-400 text-xs">{grouped[stage].length}</span>
            </div>
            <div className="space-y-2 min-h-[50vh]">
              {grouped[stage].map((l) => (
                <Link key={l.id} href={`/app/sales/leads/${l.id}`}>
                  <Card className="hover:shadow-md transition">
                    <CardBody className="p-3">
                      <div className="font-medium text-sm text-gray-900">
                        {l.firstName} {l.lastName}
                      </div>
                      {l.company && <div className="text-xs text-gray-500 mt-0.5">{l.company}</div>}
                      <div className="flex items-center gap-2 mt-2">
                        {typeof l.personaMatchScore === "number" && l.personaMatchScore >= 80 && (
                          <Badge tone="amber">🔥 Hot</Badge>
                        )}
                        {l.persona && <Badge tone="gray">{l.persona.name}</Badge>}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {l.lastActivityAt ? relativeTime(l.lastActivityAt) : "—"}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
              {grouped[stage].length === 0 && (
                <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-md p-3 text-center">
                  keine Leads
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
