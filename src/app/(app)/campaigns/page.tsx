import Link from "next/link";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, StatusChip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });

  const campaigns = await prisma.campaign.findMany({
    where: { brandId: brand!.id },
    include: { _count: { select: { contents: true, tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampagnen</h1>
          <p className="text-sm text-gray-500 mt-1">{campaigns.length} Einträge</p>
        </div>
        <Link href="/app/campaigns/new">
          <Button><Plus className="h-4 w-4" /> Neue Kampagne</Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center text-gray-600">
            Noch keine Kampagnen. Lege eine an, um Content in einem Container zu gruppieren.
          </CardBody>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/app/campaigns/${c.id}`}>
              <Card className="hover:shadow-md transition">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(c.startDate)} – {formatDate(c.endDate)}
                      </div>
                    </div>
                    <StatusChip status={c.status} />
                  </div>
                  <div className="flex gap-4 mt-4 text-xs text-gray-600">
                    <span>{c._count.contents} Content</span>
                    <span>{c._count.tasks} Tasks</span>
                    <span>{c.channels.join(", ") || "—"}</span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
