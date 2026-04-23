import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { LeadDetailClient } from "@/components/sales/LeadDetailClient";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session!.user.organizationId },
    select: { id: true },
  });
  if (!brand) return notFound();

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, brandId: brand.id },
    include: {
      owner: { select: { id: true, name: true } },
      persona: { select: { id: true, name: true } },
      activities: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { occurredAt: "desc" },
        take: 30,
      },
      opportunities: true,
      touches: {
        include: { content: { select: { id: true, title: true, type: true } } },
      },
    },
  });
  if (!lead) return notFound();

  return <LeadDetailClient lead={JSON.parse(JSON.stringify(lead))} />;
}
