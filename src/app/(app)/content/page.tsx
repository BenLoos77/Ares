import Link from "next/link";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, StatusChip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CONTENT_TYPE_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContentListPage() {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });
  const contents = await prisma.content.findMany({
    where: { brandId: brand!.id },
    include: {
      persona: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content</h1>
          <p className="text-sm text-gray-500 mt-1">{contents.length} Einträge</p>
        </div>
        <Link href="/app/content/new">
          <Button>
            <Plus className="h-4 w-4" />
            Neu erstellen
          </Button>
        </Link>
      </div>

      {contents.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <p className="text-gray-600 mb-4">Noch kein Content. Erstelle deinen ersten Entwurf mit dem Copilot.</p>
            <Link href="/app/content/new">
              <Button>
                <Plus className="h-4 w-4" /> Ersten Content erstellen
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="text-left font-medium py-3 px-5">Titel</th>
                  <th className="text-left font-medium py-3 px-5">Typ</th>
                  <th className="text-left font-medium py-3 px-5">Persona</th>
                  <th className="text-left font-medium py-3 px-5">Status</th>
                  <th className="text-left font-medium py-3 px-5">Geändert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contents.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-5">
                      <Link href={`/app/content/${c.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-gray-600">{CONTENT_TYPE_LABEL[c.type] || c.type}</td>
                    <td className="py-3 px-5 text-gray-600">{c.persona?.name ?? "—"}</td>
                    <td className="py-3 px-5">
                      <StatusChip status={c.status} />
                    </td>
                    <td className="py-3 px-5 text-gray-500 text-xs">{formatDateTime(c.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
