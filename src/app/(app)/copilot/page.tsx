import Link from "next/link";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });

  const recs = await prisma.recommendation.findMany({
    where: { brandId: brand!.id },
    orderBy: [{ status: "asc" }, { priorityScore: "desc" }],
    take: 50,
  });

  const open = recs.filter((r) => r.status === "open");
  const closed = recs.filter((r) => r.status !== "open");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-500" />
            Copilot
          </h1>
          <p className="text-sm text-gray-500 mt-1">Aktive Empfehlungen & Historie</p>
        </div>
        <form action="/api/recommendations" method="post">
          <Button type="submit" variant="secondary">
            <RefreshCw className="h-4 w-4" /> Neu generieren
          </Button>
        </form>
      </div>

      <Card>
        <CardBody>
          <h2 className="font-semibold mb-3">Offene Empfehlungen ({open.length})</h2>
          {open.length === 0 ? (
            <p className="text-sm text-gray-500">Alles im Griff. 🎉</p>
          ) : (
            <ul className="space-y-2">
              {open.map((r) => (
                <li key={r.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <Badge tone="gray">{r.type}</Badge> · Priorität {r.priorityScore}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{r.reasoning}</p>
                    </div>
                    <Link href={r.ctaTarget}>
                      <Button size="sm">Anpacken →</Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {closed.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="font-semibold mb-3">Historie ({closed.length})</h2>
            <ul className="space-y-1">
              {closed.map((r) => (
                <li key={r.id} className="text-sm flex items-center justify-between py-1">
                  <span className="text-gray-700">{r.title}</span>
                  <Badge tone={r.status === "accepted" ? "green" : r.status === "dismissed" ? "gray" : "amber"}>
                    {r.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
