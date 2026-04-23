import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function StrategyPage() {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    include: {
      personas: { orderBy: { createdAt: "asc" } },
      competitors: { orderBy: { createdAt: "asc" } },
      goals: { orderBy: { periodEnd: "asc" } },
    },
  });
  if (!brand) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Strategy Hub</h1>
        <p className="text-sm text-gray-500 mt-1">
          Diese Daten fließen in jeden generierten Content ein. Änderungen wirken ab sofort.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unternehmen: {brand.name}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <Field label="Positionierung" value={brand.positioning} />
          <Field label="Vision" value={brand.vision} />
          <Field label="Mission" value={brand.mission} />
          <div>
            <div className="text-xs text-gray-500 uppercase mb-2">USPs</div>
            <div className="flex flex-wrap gap-2">
              {brand.usp.map((u, i) => (
                <Badge key={i} tone="blue">{u}</Badge>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Markenstimme</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <SliderDisplay label="Formalität" value={brand.toneFormality} leftLabel="locker" rightLabel="formell" />
            <SliderDisplay label="Meinungsstärke" value={brand.toneOpinion} leftLabel="neutral" rightLabel="pointiert" />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase mb-2">Kernbotschaften</div>
            <ul className="list-disc pl-5 space-y-1">
              {brand.keyMessages.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
          {brand.noGos.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 uppercase mb-2">No-Gos</div>
              <div className="flex flex-wrap gap-2">
                {brand.noGos.map((n, i) => <Badge key={i} tone="red">{n}</Badge>)}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personas</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <ul className="divide-y divide-gray-100">
            {brand.personas.map((p) => (
              <li key={p.id} className="p-4">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-gray-500 mb-2">{p.roleTitle}{p.industry ? " · " + p.industry : ""}</div>
                {p.painPoints.length > 0 && (
                  <div className="text-sm"><span className="text-gray-500">Pain Points:</span> {p.painPoints.join(", ")}</div>
                )}
                {p.buyingMotives.length > 0 && (
                  <div className="text-sm"><span className="text-gray-500">Motive:</span> {p.buyingMotives.join(", ")}</div>
                )}
                {p.objections.length > 0 && (
                  <div className="text-sm"><span className="text-gray-500">Einwände:</span> {p.objections.join(", ")}</div>
                )}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ziele</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {brand.goals.length === 0 ? (
            <p className="text-sm text-gray-500 p-4">Noch keine Ziele definiert.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {brand.goals.map((g) => {
                const target = Number(g.targetValue);
                const current = Number(g.currentValue);
                const pct = target > 0 ? Math.round((current / target) * 100) : 0;
                return (
                  <li key={g.id} className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{g.title}</span>
                        <span className="text-xs text-gray-500 ml-2 capitalize">{g.category}</span>
                      </div>
                      <span className="text-gray-600">{current} / {target} {g.unit}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase mb-1">{label}</div>
      <div className="text-gray-900">{value || <span className="text-gray-400">—</span>}</div>
    </div>
  );
}

function SliderDisplay({
  label, value, leftLabel, rightLabel,
}: { label: string; value: number; leftLabel: string; rightLabel: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase mb-1">{label}: <span className="font-bold text-brand-600">{value}/5</span></div>
      <div className="h-2 bg-gray-100 rounded-full relative">
        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
